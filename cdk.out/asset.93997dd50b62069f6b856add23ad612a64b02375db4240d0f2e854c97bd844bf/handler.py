import json
import boto3
import os
import uuid
from botocore.exceptions import ClientError

s3_client = boto3.client("s3", region_name=os.environ["REGION"])
BUCKET_NAME = os.environ["BUCKET_NAME"]

ALLOWED_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
}

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


def lambda_handler(event, context):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Content-Type": "application/json",
    }

    try:
        body = json.loads(event.get("body", "{}"))
        file_name = body.get("fileName")
        file_type = body.get("fileType")
        file_size = body.get("fileSize", 0)
        user_id = body.get("userId", "anonymous")

        # ── Validate inputs ──────────────────────────────────────────
        if not file_name or not file_type:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({
                    "error": "fileName and fileType are required"
                }),
            }

        if file_type not in ALLOWED_TYPES:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({
                    "error": f"Unsupported file type: {file_type}. Allowed: JPEG, PNG, WEBP, PDF"
                }),
            }

        if file_size > MAX_FILE_SIZE:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({
                    "error": "File size exceeds 50 MB limit"
                }),
            }

        # ── Generate unique S3 key ───────────────────────────────────
        ext = ALLOWED_TYPES[file_type]
        unique_id = str(uuid.uuid4())
        s3_key = f"originals/{user_id}/{unique_id}.{ext}"

        # ── Generate pre-signed URL ──────────────────────────────────
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": BUCKET_NAME,
                "Key": s3_key,
                "ContentType": file_type,
            },
            ExpiresIn=300,  # 5 minutes
        )

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({
                "uploadUrl": presigned_url,
                "s3Key": s3_key,
                "fileId": unique_id,
            }),
        }

    except ClientError as e:
        print(f"AWS error: {e}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": "Failed to generate upload URL"}),
        }

    except Exception as e:
        print(f"Unexpected error: {e}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": "Internal server error"}),
        }