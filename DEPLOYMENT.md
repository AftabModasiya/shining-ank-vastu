# Deployment Guide

This guide covers deploying the Shining Ank Vastu application to various platforms.

## Prerequisites

- Completed Firebase setup (see FIREBASE_SETUP.md)
- Node.js and npm installed
- Git installed
- Project built successfully locally

## Option 1: Deploy to Firebase Hosting (Recommended)

Firebase Hosting is free and integrates seamlessly with your Firebase project.

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase Hosting

```bash
cd shining-ank-vastu
firebase init hosting
```

Answer the prompts:

- **Select Firebase project**: Choose your existing project
- **What do you want to use as your public directory?**: `dist`
- **Configure as a single-page app?**: `Yes`
- **Set up automatic builds with GitHub?**: `No` (or Yes if you want CI/CD)
- **Overwrite index.html?**: `No`

### Step 4: Build Your Project

```bash
npm run build
```

### Step 5: Deploy

```bash
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

### Step 6: Set Up Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the instructions to verify domain ownership
4. Add DNS records as instructed

## Option 2: Deploy to Vercel

Vercel offers excellent performance and automatic deployments from Git.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
cd shining-ank-vastu
vercel
```

Follow the prompts:

- **Set up and deploy?**: `Yes`
- **Which scope?**: Select your account
- **Link to existing project?**: `No`
- **Project name**: `shining-ank-vastu`
- **Directory**: `./`
- **Override settings?**: `No`

### Step 4: Add Environment Variables

```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
```

Or add them in Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all Firebase variables

### Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

Your app will be live at: `https://your-project.vercel.app`

## Option 3: Deploy to Netlify

Netlify is another excellent option with great developer experience.

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

### Step 3: Build Your Project

```bash
npm run build
```

### Step 4: Deploy

```bash
netlify deploy
```

For production:

```bash
netlify deploy --prod
```

### Step 5: Add Environment Variables

In Netlify Dashboard:

1. Go to Site settings → Build & deploy → Environment
2. Add all Firebase environment variables
3. Redeploy the site

## Option 4: Deploy to GitHub Pages

### Step 1: Update vite.config.js

Add base URL:

```javascript
export default defineConfig({
  plugins: [react()],
  base: "/shining-ank-vastu/",
});
```

### Step 2: Install gh-pages

```bash
npm install --save-dev gh-pages
```

### Step 3: Update package.json

Add deploy scripts:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### Step 4: Deploy

```bash
npm run deploy
```

Your app will be live at: `https://yourusername.github.io/shining-ank-vastu/`

## Environment Variables for Production

Make sure to set these environment variables in your hosting platform:

```env
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_production_auth_domain
VITE_FIREBASE_PROJECT_ID=your_production_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_production_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
VITE_FIREBASE_APP_ID=your_production_app_id
```

## Post-Deployment Checklist

- [ ] Test all features on production URL
- [ ] Verify Firebase connection works
- [ ] Test PDF generation
- [ ] Test client creation and retrieval
- [ ] Test edit functionality
- [ ] Test client history and search
- [ ] Check mobile responsiveness
- [ ] Verify all images and assets load
- [ ] Test on different browsers
- [ ] Set up Firebase security rules for production
- [ ] Enable Firebase Authentication (recommended)
- [ ] Set up monitoring and analytics
- [ ] Configure custom domain (if applicable)

## Security Considerations for Production

### 1. Update Firestore Security Rules

Replace development rules with production rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{clientId} {
      // Only authenticated users can access
      allow read, write: if request.auth != null;

      // Or restrict to specific admin users
      // allow read, write: if request.auth.uid in ['admin_uid_1', 'admin_uid_2'];
    }
  }
}
```

### 2. Enable Firebase Authentication

1. Go to Firebase Console → Authentication
2. Enable Email/Password or Google sign-in
3. Update your app to require authentication
4. Add login/logout functionality

### 3. Set Up Firebase App Check

Protect your Firebase resources from abuse:

1. Go to Firebase Console → App Check
2. Enable App Check for your web app
3. Choose reCAPTCHA v3 as provider
4. Update your app to use App Check

### 4. Environment Variables

- Never commit `.env` file
- Use different Firebase projects for dev/prod
- Rotate API keys periodically
- Use Firebase App Check to protect API keys

## Monitoring and Analytics

### Set Up Firebase Analytics

1. Go to Firebase Console → Analytics
2. Enable Google Analytics
3. Add Analytics to your app:

```javascript
import { getAnalytics } from "firebase/analytics";
const analytics = getAnalytics(app);
```

### Set Up Error Monitoring

Consider adding error tracking:

- Sentry
- LogRocket
- Firebase Crashlytics

## Performance Optimization

### 1. Enable Compression

Most hosting platforms enable this by default, but verify:

- Gzip compression
- Brotli compression

### 2. Optimize Images

If you add images later:

- Use WebP format
- Lazy load images
- Use responsive images

### 3. Code Splitting

Vite handles this automatically, but you can optimize further:

- Lazy load routes
- Split large components
- Use dynamic imports

### 4. Caching Strategy

Configure caching headers in your hosting platform:

- Cache static assets for 1 year
- Cache HTML for 5 minutes
- Use service workers for offline support

## Continuous Deployment

### GitHub Actions for Firebase

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: your-project-id
```

## Troubleshooting Deployment Issues

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working

- Verify variable names start with `VITE_`
- Restart dev server after changing `.env`
- Check hosting platform's environment variable settings
- Ensure variables are set for production environment

### Firebase Connection Issues

- Verify Firebase config is correct
- Check Firestore security rules
- Ensure Firebase project is active
- Check browser console for errors

### PDF Generation Not Working

- Verify jsPDF is installed
- Check browser console for errors
- Test in different browsers
- Ensure fonts are loading correctly

## Rollback Strategy

### Firebase Hosting

```bash
# View deployment history
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

### Vercel

```bash
# List deployments
vercel ls

# Promote a previous deployment
vercel promote [deployment-url]
```

### Netlify

Use Netlify Dashboard:

1. Go to Deploys
2. Find previous successful deploy
3. Click "Publish deploy"

## Support

For deployment issues:

1. Check hosting platform documentation
2. Review Firebase Console for errors
3. Check browser console for JavaScript errors
4. Verify all environment variables are set

## Resources

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
