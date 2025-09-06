# Deployment Instructions

## Vercel Deployment

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. Import to Vercel:
- Go to vercel.com
- Click "New Project" 
- Import your GitHub repository
- Deploy settings are pre-configured in vercel.json

3. Environment Variables (optional):
- VITE_API_BASE_URL (default: https://app.tablecrm.com/api/v1)

## Local Build

```bash
npm install
npm run build
```

Build output will be in `dist/` directory.