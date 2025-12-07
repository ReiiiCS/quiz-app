# Vercel 404 Fix - Step by Step

## The Problem
You're getting a 404 error because Vercel is trying to build from the repository root instead of the `frontend/` directory.

## The Solution

### Method 1: Configure Root Directory in Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in if needed

2. **Select Your Project**
   - Click on your `quiz-app` project

3. **Open Settings**
   - Click on **"Settings"** tab (top navigation)

4. **Find Root Directory**
   - Scroll down to **"Root Directory"** section
   - Click **"Edit"** button

5. **Set Root Directory**
   - Type or select: `frontend`
   - Click **"Save"**

6. **Set Environment Variable** (if not done already)
   - Still in Settings, go to **"Environment Variables"**
   - Add:
     - **Name**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://quiz-api.quizzz-app.workers.dev`
     - **Environments**: Check all (Production, Preview, Development)
   - Click **"Save"**

7. **Redeploy**
   - Go to **"Deployments"** tab
   - Find the latest deployment
   - Click the **three dots (⋯)** menu
   - Click **"Redeploy"**
   - Wait for build to complete (1-2 minutes)

8. **Test**
   - Visit your Vercel URL
   - Should now work! ✅

---

### Method 2: Re-import Project (If Method 1 doesn't work)

1. **Delete Current Project** (optional, or just create new)
   - In Vercel dashboard, go to project settings
   - Scroll to bottom → **"Delete Project"**

2. **Import Project Again**
   - Click **"Add New Project"**
   - Select your GitHub repository
   - **IMPORTANT**: In the configuration screen:
     - **Root Directory**: Set to `frontend`
     - **Framework Preset**: Should auto-detect "Next.js"
   - Click **"Deploy"**

3. **Set Environment Variable**
   - After first deployment, go to Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL` = `https://quiz-api.quizzz-app.workers.dev`
   - Redeploy

---

## Verify It's Working

After redeployment, check:

1. **Visit your Vercel URL**
   - Should load the quiz app (not 404)

2. **Check Browser Console** (F12)
   - Should see API calls to `quiz-api.quizzz-app.workers.dev`
   - No 404 errors for the main page

3. **Test the Quiz**
   - Questions should load
   - Can submit answers
   - Results should display

---

## Still Getting 404?

Check the Vercel build logs:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Check **"Build Logs"**
4. Look for errors like:
   - "Cannot find module"
   - "No such file or directory"
   - Build failures

Common issues:
- ❌ Root directory not set to `frontend`
- ❌ Environment variable not set
- ❌ Build command failing
- ❌ Missing dependencies

---

## Quick Checklist

- [ ] Root Directory set to `frontend` in Vercel
- [ ] `NEXT_PUBLIC_API_URL` environment variable set
- [ ] Project redeployed after configuration changes
- [ ] Build logs show successful build
- [ ] No errors in browser console (except WebSocket, which is harmless)
