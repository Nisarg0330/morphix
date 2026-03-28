# Morphix — Serverless File Converter

> Transform anything. Instantly.

A production-grade serverless file converter built on AWS.
Upload a file, pick a target format, download the result in seconds.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + Tailwind CSS |
| Hosting | AWS Amplify |
| Auth | Amazon Cognito |
| API | Amazon API Gateway (HTTP) |
| Compute | AWS Lambda (Python 3.11 + Pillow) |
| Storage | Amazon S3 (private, encrypted) |
| IaC | AWS CDK (Python) |

## Supported Conversions

- JPG → PNG, WEBP, PDF, Grayscale
- PNG → JPG, WEBP, PDF, Grayscale
- WEBP → JPG, PNG, PDF

## Setup

### Backend
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cdk bootstrap
cdk deploy
```

### Frontend
```bash
cd frontend
npm install
cp ../.env.example .env.local
# fill in values printed by cdk deploy
npm run dev
```

## Architecture

See `docs/architecture.png`

## Built for

AWS File Converter App Challenge — March/April 2026