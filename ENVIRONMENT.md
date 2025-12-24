# FeedS Environment Variables

# ============================================
# DEVELOPMENT ENVIRONMENT (.env)
# ============================================

# Database Configuration
DATABASE_URL=sqlite:///./feeds_dev.db
# For PostgreSQL in Docker:
# DATABASE_URL=postgresql://feeds_user:feeds_password@postgres:5432/feeds_db

# Security
SECRET_KEY=your-secret-key-here-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# File Uploads
UPLOAD_DIRECTORY=uploads
MAX_UPLOAD_SIZE=10485760

# CORS (Cross-Origin Resource Sharing)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5176

# Email Configuration (Optional)
SMTP_SERVER=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
ENABLE_EMAIL=false

# Redis Cache (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=
REDIS_CACHE_TTL=300

# Monitoring & Analytics
SENTRY_DSN=
ENABLE_METRICS=true
LOG_LEVEL=INFO

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# ============================================
# PRODUCTION ENVIRONMENT (.env.prod)
# ============================================

# Database (REQUIRED)
DATABASE_URL=postgresql://feeds_user:PRODUCTION_PASSWORD@postgres:5432/feeds_db
DB_PASSWORD=PRODUCTION_PASSWORD

# Security (REQUIRED - Generate strong keys)
SECRET_KEY=your-super-secret-production-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (REQUIRED - Your actual domains)
CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Redis (REQUIRED for production performance)
REDIS_HOST=redis
REDIS_PORT=6379

# Monitoring (RECOMMENDED)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
ENABLE_METRICS=true
LOG_LEVEL=WARNING

# ============================================
# FRONTEND ENVIRONMENT VARIABLES
# ============================================

# API Configuration
VITE_API_BASE_URL=http://localhost:8000
# Production: VITE_API_BASE_URL=https://your-backend-domain.com

# Application Settings
VITE_APP_ENV=development
# Production: VITE_APP_ENV=production

# PWA Settings
VITE_PWA_ENABLED=true

# ============================================
# DOCKER ENVIRONMENT VARIABLES
# ============================================

# Database Password (for docker-compose)
DB_PASSWORD=feeds_password

# CORS Origins (for production)
CORS_ORIGINS=https://your-frontend-domain.com

# Frontend API URL
VITE_API_BASE_URL=https://your-backend-domain.com

# ============================================
# HOW TO SET ENVIRONMENT VARIABLES
# ============================================

# 1. Copy the appropriate template:
# cp .env.example .env                    # Development
# cp .env.docker .env                     # Docker production

# 2. Edit the values according to your environment

# 3. For production, use strong, unique values:
# - SECRET_KEY: Use openssl rand -hex 32
# - DB_PASSWORD: Use a strong password
# - SENTRY_DSN: Get from Sentry.io

# ============================================
# SECURITY BEST PRACTICES
# ============================================

# ✅ DO:
# - Use different SECRET_KEY for each environment
# - Use strong passwords for database
# - Limit CORS_ORIGINS to your actual domains
# - Enable Sentry for error monitoring
# - Use HTTPS in production

# ❌ DON'T:
# - Commit .env files to Git
# - Use default/weak passwords
# - Set CORS_ORIGINS to "*" in production
# - Use the same SECRET_KEY across environments
# - Expose sensitive ports publicly