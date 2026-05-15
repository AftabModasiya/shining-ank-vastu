# Quick Start Guide

Get your Shining Ank Vastu Numerology app up and running in 10 minutes!

## Prerequisites

- Node.js installed (v16 or higher)
- A Firebase account (free)
- Basic terminal/command line knowledge

## Step 1: Navigate to Project (1 minute)

```bash
cd shining-ank-vastu
```

## Step 2: Install Dependencies (2 minutes)

```bash
npm install
```

Wait for all packages to install...

## Step 3: Set Up Firebase (5 minutes)

### 3.1 Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it: `shining-ank-vastu`
4. Disable Google Analytics (optional)
5. Click "Create project"

### 3.2 Enable Firestore

1. Click "Firestore Database" in left sidebar
2. Click "Create database"
3. Select "Start in production mode"
4. Choose your location (e.g., `asia-south1` for India)
5. Click "Enable"

### 3.3 Get Firebase Config

1. Click the gear icon (⚙️) → "Project settings"
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register app: name it "Shining Ank Vastu Web"
5. Copy the `firebaseConfig` object

### 3.4 Update Security Rules

1. Go to Firestore Database → Rules tab
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click "Publish"

## Step 4: Configure Environment (1 minute)

Create `.env` file in project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
```

## Step 5: Start Development Server (1 minute)

```bash
npm run dev
```

Open your browser to: http://localhost:5173

## Step 6: Test the App

### Create Your First Client

1. Fill in the form:
   - Name: "Test Client"
   - Date of Birth: "1988-11-28"
   - Gender: "Male"
2. Click "Generate Numerology Report"
3. View the generated report
4. Click "Download PDF" to test PDF generation

### Check Client History

1. Click "Client History" button
2. You should see your test client
3. Click "View Report" to see the report again

## Troubleshooting

### Port Already in Use

If port 5173 is busy:

```bash
npm run dev -- --port 3000
```

### Firebase Connection Error

1. Check `.env` file has correct values
2. Verify Firebase project is active
3. Check Firestore security rules
4. Restart dev server: `Ctrl+C` then `npm run dev`

### PDF Not Generating

1. Check browser console for errors
2. Try a different browser
3. Clear browser cache
4. Verify jsPDF is installed: `npm list jspdf`

### Data Not Saving

1. Check Firebase Console → Firestore Database
2. Verify security rules allow write access
3. Check browser console for errors
4. Verify internet connection

## Next Steps

### Customize the App

1. **Change Colors**: Edit `src/App.css` CSS variables
2. **Modify Calculations**: Edit `src/utils/numerology.js`
3. **Update PDF Layout**: Edit `src/utils/pdfGenerator.js`
4. **Add Fields**: Update form in `src/pages/Home.jsx`

### Deploy to Production

See `DEPLOYMENT.md` for detailed deployment instructions.

Quick deploy to Firebase:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Add Authentication

1. Enable Firebase Authentication
2. Add login/signup pages
3. Update security rules
4. Protect routes

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Install new package
npm install package-name

# Update dependencies
npm update
```

## Project Structure

```
shining-ank-vastu/
├── src/
│   ├── pages/           # React pages
│   ├── utils/           # Helper functions
│   ├── services/        # Firebase services
│   ├── config/          # Configuration
│   └── App.jsx          # Main app
├── .env                 # Environment variables (create this)
├── package.json         # Dependencies
└── README.md           # Documentation
```

## Key Files to Know

- **src/pages/Home.jsx** - Main form page
- **src/pages/ReportView.jsx** - Report display
- **src/pages/ClientHistory.jsx** - Client list
- **src/utils/numerology.js** - Calculation logic
- **src/utils/pdfGenerator.js** - PDF creation
- **src/services/clientService.js** - Firebase operations
- **src/config/firebase.js** - Firebase setup

## Getting Help

### Documentation

- `README.md` - Overview and features
- `FIREBASE_SETUP.md` - Detailed Firebase guide
- `DEPLOYMENT.md` - Deployment instructions
- `FEATURES.md` - Complete feature list

### Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)

### Support

- Check browser console for errors
- Review Firebase Console for issues
- Read error messages carefully
- Search for similar issues online

## Success Checklist

- [ ] Dependencies installed
- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] Security rules updated
- [ ] `.env` file configured
- [ ] Dev server running
- [ ] Test client created
- [ ] PDF generated successfully
- [ ] Client history working
- [ ] Edit functionality tested

## What's Next?

1. **Explore Features**: Try all functionality
2. **Customize Design**: Match your branding
3. **Add Clients**: Start using with real data
4. **Deploy**: Make it live for clients
5. **Add Authentication**: Secure your app
6. **Collect Feedback**: Improve based on usage

## Tips for Success

1. **Keep Firebase Console Open**: Monitor data in real-time
2. **Use Browser DevTools**: Check console for errors
3. **Test on Mobile**: Ensure responsive design works
4. **Backup Data**: Export Firestore data regularly
5. **Version Control**: Use Git for code management
6. **Document Changes**: Keep notes on customizations

## Quick Reference

### Environment Variables

All must start with `VITE_` prefix for Vite to recognize them.

### Firebase Collections

- `clients` - Stores all client data and reports

### Routes

- `/` - Home page with form
- `/report/:id` - View/edit report
- `/history` - Client history list

### Key Components

- Form validation
- Numerology calculations
- PDF generation
- Firebase CRUD operations
- Search and filter

---

**You're all set!** 🎉

Start creating numerology reports and helping your clients discover their life path!

For detailed information, see the other documentation files in this project.
