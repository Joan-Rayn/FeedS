# Render Configuration for FeedS Backend

## Build Command
```bash
pip install -r requirements.txt
python create_db.py
python populate_db.py
```

## Start Command
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Environment Variables (Required)
- `DATABASE_URL`: Automatically provided by Render PostgreSQL addon
- `SECRET_KEY`: Generate a secure random key (use: `openssl rand -hex 32`)
- `ALGORITHM`: HS256
- `ACCESS_TOKEN_EXPIRE_MINUTES`: 60
- `UPLOAD_DIRECTORY`: /tmp/uploads
- `MAX_UPLOAD_SIZE`: 10485760
- `PYTHON_VERSION`: 3.11.0

## Optional Environment Variables
- `REDIS_HOST`: Redis host if using cache
- `REDIS_PORT`: 6379
- `SENTRY_DSN`: Sentry DSN for error tracking
- `SMTP_SERVER`: SMTP server for emails
- `SMTP_PORT`: 587
- `SMTP_USERNAME`: Email username
- `SMTP_PASSWORD`: Email password

## Health Check Path
`/api/v1/metrics/health`

## Dockerfile Deployment
If using Docker deployment on Render:
- Root Directory: `backend/app`
- Dockerfile Path: `./Dockerfile`
