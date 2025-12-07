# Deployment Guide

This guide walks you through deploying the Quiz App to production:
- **Frontend**: Next.js app on Vercel
- **Backend**: Hono API on Cloudflare Workers

## Prerequisites

- GitHub account (for connecting to Vercel)
- Cloudflare account (free tier works)
- Vercel account (free tier works)
- Node.js 18+ installed locally

---

## Step 1: Deploy Backend to Cloudflare Workers

### 1.1 Login to Cloudflare

```bash
cd backend
npx wrangler login
```

This will open a browser window for you to authenticate with Cloudflare.

### 1.2 Deploy the Worker

```bash
npm run deploy
```

After successful deployment, you'll see output like:
```
✨  Deployed to https://quiz-api.YOUR_SUBDOMAIN.workers.dev
```

**Important**: Copy this URL - you'll need it for the frontend configuration!

### 1.3 Verify Deployment

Test your deployed API:
```bash
curl https://quiz-api.YOUR_SUBDOMAIN.workers.dev/health
```

You should get: `{"status":"ok"}`

### 1.4 (Optional) Update CORS for Production

If you want to restrict CORS to your Vercel domain only, update `backend/src/index.ts`:

```typescript
// Replace the CORS middleware with:
app.use('/*', async (c, next) => {
  const allowedOrigins = [
    'https://your-app.vercel.app',
    'http://localhost:3000' // Keep for local dev
  ];
  
  const origin = c.req.header('Origin');
  const allowedOrigin = allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0];
  
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204, {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    });
  }
  
  await next();
  
  c.header('Access-Control-Allow-Origin', allowedOrigin);
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type');
});
```

Then redeploy:
```bash
npm run deploy
```

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Push Code to GitHub

If you haven't already, push your code to a GitHub repository:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2.2 Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (or create an account)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 2.3 Configure Project Settings

In the project configuration:

1. **Root Directory**: Set to `frontend` (if your repo has both frontend and backend)
   - Or leave blank if you're deploying from a monorepo setup

2. **Framework Preset**: Should auto-detect as "Next.js"

3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install` (default)

### 2.4 Set Environment Variables

**Critical Step**: Add the environment variable for your API URL:

1. In the Vercel project settings, go to **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://quiz-api.YOUR_SUBDOMAIN.workers.dev` (use your actual Cloudflare Worker URL)
   - **Environment**: Select all (Production, Preview, Development)

3. Click **Save**

### 2.5 Deploy

1. Click **"Deploy"** button
2. Wait for the build to complete (usually 1-2 minutes)
3. Once deployed, you'll get a URL like: `https://your-app.vercel.app`

### 2.6 Verify Deployment

1. Visit your Vercel URL
2. Open browser DevTools → Network tab
3. Try taking the quiz
4. Verify API calls are going to your Cloudflare Worker URL

---

## Step 3: Update CORS (If Needed)

If you restricted CORS in Step 1.4, make sure to update the allowed origins with your actual Vercel URL:

1. Update `backend/src/index.ts` with your Vercel domain
2. Redeploy: `cd backend && npm run deploy`

---

## Step 4: Continuous Deployment Setup

### Backend (Cloudflare Workers)

For automatic deployments on git push, you can:

1. **Option A**: Use GitHub Actions (recommended)
   - Create `.github/workflows/deploy-worker.yml`
   - See example below

2. **Option B**: Manual deployment
   - Run `npm run deploy` from your local machine after each change

### Frontend (Vercel)

Vercel automatically deploys on every push to your main branch. You can also:
- Set up preview deployments for pull requests
- Configure custom domains in Vercel settings

---

## GitHub Actions for Backend (Optional)

Create `.github/workflows/deploy-worker.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
        
      - name: Deploy to Cloudflare Workers
        working-directory: ./backend
        run: npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

To use this:
1. Go to Cloudflare Dashboard → My Profile → API Tokens
2. Create a token with "Edit Cloudflare Workers" permissions
3. Add it as a GitHub Secret: `CLOUDFLARE_API_TOKEN`

---

## Troubleshooting

### Backend Issues

**Problem**: `wrangler login` fails
- **Solution**: Make sure you have a Cloudflare account and try again

**Problem**: Deployment fails with authentication error
- **Solution**: Run `npx wrangler login` again

**Problem**: CORS errors in browser
- **Solution**: Check that your Vercel URL is allowed in CORS settings

### Frontend Issues

**Problem**: API calls fail with 404
- **Solution**: Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel environment variables

**Problem**: Build fails on Vercel
- **Solution**: Check build logs in Vercel dashboard. Common issues:
  - Missing dependencies (check `package.json`)
  - TypeScript errors (run `npm run build` locally first)
  - Root directory misconfiguration

**Problem**: Environment variable not working
- **Solution**: 
  - Make sure variable name starts with `NEXT_PUBLIC_` for client-side access
  - Redeploy after adding/changing environment variables
  - Check that variable is set for the correct environment (Production/Preview/Development)

---

## Production Checklist

- [ ] Backend deployed to Cloudflare Workers
- [ ] Backend URL copied and saved
- [ ] Frontend deployed to Vercel
- [ ] `NEXT_PUBLIC_API_URL` environment variable set in Vercel
- [ ] CORS configured (if restricting origins)
- [ ] Both deployments tested and working
- [ ] Custom domain configured (optional)
- [ ] GitHub Actions set up for CI/CD (optional)

---

## URLs After Deployment

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://quiz-api.YOUR_SUBDOMAIN.workers.dev`
- **Health Check**: `https://quiz-api.YOUR_SUBDOMAIN.workers.dev/health`

---

## Next Steps

- Set up a custom domain in Vercel
- Configure Cloudflare Workers custom domain
- Add monitoring and error tracking
- Set up analytics
- Configure rate limiting (if needed)
