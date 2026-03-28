import json
import boto3
import os
import uuid
from io import BytesIO
from botocore.exceptions import ClientError

try:
    from PIL import Image
except ImportError:
    Image = None

s3_client = boto3.client("s3", region_name=os.environ["REGION"])
BUCKET_NAME = os.environ["BUCKET_NAME"]

SUPPORTED_CONVERSIONS = {
    "jpg":  ["png", "webp", "pdf", "grayscale"],
    "jpeg": ["png", "webp", "pdf", "grayscale"],
    "png":  ["jpg", "webp", "pdf", "grayscale"],
    "webp": ["jpg", "png", "pdf"],
    "pdf":  [],
}

FORMAT_MAP = {
    "jpg":  "JPEG",
    "jpeg": "JPEG",
    "png":  "PNG",
    "webp": "WEBP",
    "pdf":  "PDF",
}

MIME_MAP = {
    "jpg":  "image/jpeg",
    "jpeg": "image/jpeg",
    "png":  "image/png",
    "webp": "image/webp",
    "pdf":  "application/pdf",
}


def lambda_handler(event, context):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Content-Type": "application/json",
    }

    try:
        body = json.loads(event.get("body", "{}"))
        s3_key = body.get("s3Key")
        target_format = body.get("targetFormat", "").lower().strip(".")
        user_id = body.get("userId", "anonymous")

        # ── Validate inputs ──────────────────────────────────────────
        if not s3_key or not target_format:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({
                    "error": "s3Key and targetFormat are required"
                }),
            }

        # Get source extension from key
        source_ext = s3_key.rsplit(".", 1)[-1].lower()

        if source_ext not in SUPPORTED_CONVERSIONS:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({
                    "error": f"Unsupported source format: {source_ext}"
                }),
            }

        valid_targets = SUPPORTED_CONVERSIONS[source_ext]
        if target_format not in valid_targets and target_format != "grayscale":
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({
                    "error": f"Cannot convert {source_ext} to {target_format}"
                }),
            }

        # ── Download from S3 ─────────────────────────────────────────
        print(f"Downloading {s3_key} from {BUCKET_NAME}")
        s3_object = s3_client.get_object(Bucket=BUCKET_NAME, Key=s3_key)
        file_bytes = s3_object["Body"].read()

        # ── Convert ──────────────────────────────────────────────────
        output_bytes, output_ext = convert_file(
            file_bytes, source_ext, target_format
        )

        # ── Upload result to S3 ──────────────────────────────────────
        unique_id = str(uuid.uuid4())
        output_key = f"converted/{user_id}/{unique_id}.{output_ext}"
        content_type = MIME_MAP.get(output_ext, "application/octet-stream")

        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=output_key,
            Body=output_bytes,
            ContentType=content_type,
        )

        # ── Generate download URL ────────────────────────────────────
        download_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": BUCKET_NAME, "Key": output_key},
            ExpiresIn=3600,  # 1 hour
        )

        original_name = s3_key.rsplit("/", 1)[-1].rsplit(".", 1)[0]
        download_filename = f"{original_name}_morphix.{output_ext}"

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({
                "downloadUrl": download_url,
                "outputKey": output_key,
                "outputFormat": output_ext,
                "fileName": download_filename,
            }),
        }

    except ClientError as e:
        print(f"AWS error: {e}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": "File processing failed"}),
        }

    except Exception as e:
        print(f"Conversion error: {e}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": f"Conversion failed: {str(e)}"}),
        }


def convert_file(file_bytes: bytes, source_ext: str, target_format: str):
    """Core conversion logic using Pillow."""

    img = Image.open(BytesIO(file_bytes))

    # ── Grayscale ────────────────────────────────────────────────────
    if target_format == "grayscale":
        img = img.convert("L")
        output = BytesIO()
        save_format = FORMAT_MAP.get(source_ext, "PNG")
        if save_format == "JPEG":
            img.save(output, format="JPEG", quality=95)
        else:
            img.save(output, format="PNG")
        return output.getvalue(), source_ext

    # ── Image to PDF ─────────────────────────────────────────────────
    if target_format == "pdf":
        if img.mode in ("RGBA", "LA", "P"):
            img = img.convert("RGB")
        output = BytesIO()
        img.save(output, format="PDF", resolution=150)
        return output.getvalue(), "pdf"

    # ── Image to Image ───────────────────────────────────────────────
    pil_format = FORMAT_MAP[target_format]

    # JPEG cannot have alpha channel
    if pil_format == "JPEG" and img.mode in ("RGBA", "LA", "P"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = background

    output = BytesIO()

    if pil_format == "JPEG":
        img.save(output, format="JPEG", quality=95, optimize=True)
    elif pil_format == "PNG":
        img.save(output, format="PNG", optimize=True)
    elif pil_format == "WEBP":
        img.save(output, format="WEBP", quality=90)

    return output.getvalue(), target_format