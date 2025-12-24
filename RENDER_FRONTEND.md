# Render Configuration for FeedS Frontend

## Build Command
```bash
npm install
npm run build
```

## Publish Directory
```
dist
```

## Environment Variables (Required)
- `VITE_API_BASE_URL`: Your Render backend URL (e.g., https://feeds-backend.onrender.com)
- `VITE_APP_ENV`: production
- `VITE_PWA_ENABLED`: true

## Redirects and Rewrites
Add this to handle React Router:

```
/*    /index.html   200
```

## Headers (Optional)
For better PWA and security:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Build Settings
- Node Version: 18.x or higher
- Build Directory: `frontend`

## Important Notes
1. Make sure to generate PWA icons before deploying
2. Open `generate-icons.html` in your browser and download all icons
3. Place icons in `frontend/public/icons/` directory
4. Update `VITE_API_BASE_URL` with your actual backend URL after backend deployment
