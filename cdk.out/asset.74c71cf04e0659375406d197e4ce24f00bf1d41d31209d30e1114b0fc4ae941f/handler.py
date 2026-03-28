import json
import boto3
import os
import uuid
from io import BytesIO
from botocore.exceptions import ClientError
from PIL import Image

s3_client = boto3.client("s3", region_name=os.environ["REGION"])
BUCKET_NAME = os.environ["BUCKET_NAME"]

SUPPORTED_CONVERSIONS = {
    "jpg":  ["png", "webp", "pdf", "grayscale"],
    "jpeg": ["png", "webp", "pdf", "grayscale"],
    "png":  ["jpg", "webp", "pdf", "grayscale"],
    "webp": ["jpg", "png", "pdf"],
}

FORMAT_MAP = {
    "jpg":  "JPEG",
    "jpeg": "JPEG",
    "png":  "PNG",
    "webp": "WEBP",
}

MIME_MAP = {
    "jpg":   "image/jpeg",
    "jpeg":  "image/jpeg",
    "png":   "image/png",
    "webp":  "image/webp",
    "pdf":   "application/pdf",
}

HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Content-Type": "application/json",
}


def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        s3_key = body.get("s3Key", "").strip()
        target_format = body.get("targetFormat", "").lower().strip()
        user_id = body.get("userId", "anonymous")

        print(f"Request: s3Key={s3_key}, targetFormat={target_format}, userId={user_id}")

        if not s3_key or not target_format:
            return respond(400, {"error": "s3Key and targetFormat are required"})

        source_ext = s3_key.rsplit(".", 1)[-1].lower()
        print(f"Source extension: {source_ext}")

        if source_ext not in SUPPORTED_CONVERSIONS:
            return respond(400, {"error": f"Unsupported source format: {source_ext}"})

        valid_targets = SUPPORTED_CONVERSIONS[source_ext]
        if target_format not in valid_targets:
            return respond(400, {"error": f"Cannot convert {source_ext} to {target_format}. Valid: {valid_targets}"})

        # Download from S3
        print(f"Downloading from S3: bucket={BUCKET_NAME}, key={s3_key}")
        s3_object = s3_client.get_object(Bucket=BUCKET_NAME, Key=s3_key)
        file_bytes = s3_object["Body"].read()
        print(f"Downloaded {len(file_bytes)} bytes")

        # Convert
        output_bytes, output_ext = convert_image(file_bytes, source_ext, target_format)
        print(f"Converted to {output_ext}, size={len(output_bytes)} bytes")

        # Upload result
        unique_id = str(uuid.uuid4())
        output_key = f"converted/{user_id}/{unique_id}.{output_ext}"
        content_type = MIME_MAP.get(output_ext, "application/octet-stream")

        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=output_key,
            Body=output_bytes,
            ContentType=content_type,
        )
        print(f"Uploaded result to: {output_key}")

        # Generate download URL
        download_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": BUCKET_NAME, "Key": output_key},
            ExpiresIn=3600,
        )

        original_name = s3_key.rsplit("/", 1)[-1].rsplit(".", 1)[0]
        download_filename = f"{original_name}_morphix.{output_ext}"

        return respond(200, {
            "downloadUrl": download_url,
            "outputKey": output_key,
            "outputFormat": output_ext,
            "fileName": download_filename,
        })

    except ClientError as e:
        code = e.response["Error"]["Code"]
        msg = e.response["Error"]["Message"]
        print(f"ClientError: {code} - {msg}")
        return respond(500, {"error": f"AWS error: {code} - {msg}"})

    except Exception as e:
        import traceback
        print(f"Exception: {str(e)}")
        print(traceback.format_exc())
        return respond(500, {"error": str(e)})


def respond(status_code, body):
    return {
        "statusCode": status_code,
        "headers": HEADERS,
        "body": json.dumps(body),
    }


def convert_image(file_bytes: bytes, source_ext: str, target_format: str):
    img = Image.open(BytesIO(file_bytes))
    print(f"Image opened: mode={img.mode}, size={img.size}")

    # Grayscale
    if target_format == "grayscale":
        img = img.convert("L")
        out = BytesIO()
        save_fmt = FORMAT_MAP.get(source_ext, "PNG")
        if save_fmt == "JPEG":
            img.save(out, format="JPEG", quality=95)
        else:
            img.save(out, format="PNG")
        return out.getvalue(), source_ext if source_ext != "jpeg" else "jpg"

    # Image to PDF
    if target_format == "pdf":
        if img.mode in ("RGBA", "LA", "P"):
            img = img.convert("RGB")
        out = BytesIO()
        img.save(out, format="PDF", resolution=150)
        return out.getvalue(), "pdf"

    # Image to Image
    pil_format = FORMAT_MAP[target_format]

    # JPEG needs RGB
    if pil_format == "JPEG" and img.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        if img.mode in ("RGBA", "LA"):
            bg.paste(img, mask=img.split()[-1])
        else:
            bg.paste(img)
        img = bg

    out = BytesIO()
    if pil_format == "JPEG":
        img.save(out, format="JPEG", quality=95, optimize=True)
    elif pil_format == "PNG":
        img.save(out, format="PNG", optimize=True)
    elif pil_format == "WEBP":
        img.save(out, format="WEBP", quality=90)

    return out.getvalue(), target_format