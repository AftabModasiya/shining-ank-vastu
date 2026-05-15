# Firebase Setup Guide

This guide will walk you through setting up Firebase for the Shining Ank Vastu project.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `shining-ank-vastu` (or your preferred name)
4. Click "Continue"
5. Disable Google Analytics (optional for this project)
6. Click "Create project"
7. Wait for project creation to complete
8. Click "Continue"

## Step 2: Register Your Web App

1. In the Firebase Console, click on the web icon `</>` to add a web app
2. Enter app nickname: `Shining Ank Vastu Web`
3. **Do NOT** check "Also set up Firebase Hosting" (unless you want to deploy)
4. Click "Register app"
5. You'll see your Firebase configuration object - **SAVE THIS**

Example configuration:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
};
```

6. Click "Continue to console"

## Step 3: Set Up Firestore Database

1. In the left sidebar, click on "Firestore Database"
2. Click "Create database"
3. Select "Start in production mode" (we'll update rules next)
4. Click "Next"
5. Choose your Cloud Firestore location (choose closest to your users)
   - For India: `asia-south1 (Mumbai)`
   - For US: `us-central1 (Iowa)`
6. Click "Enable"
7. Wait for database creation (takes 1-2 minutes)

## Step 4: Configure Firestore Security Rules

1. In Firestore Database, click on the "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Clients collection
    match /clients/{clientId} {
      // Allow read and write for all (for development)
      allow read, write: if true;

      // For production, use authentication:
      // allow read, write: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

**⚠️ Important Security Note:**

- The above rules allow anyone to read/write data (good for development)
- For production, implement Firebase Authentication and update rules
- Consider adding user-based access control

## Step 5: Create Firestore Collection Structure

The app will automatically create the collection when you add your first client, but you can create it manually:

1. Go to "Firestore Database" → "Data" tab
2. Click "Start collection"
3. Collection ID: `clients`
4. Click "Next"
5. Add a test document:
   - Document ID: (auto-generate)
   - Fields:
     - `name` (string): "Test Client"
     - `dob` (string): "1988-11-28"
     - `gender` (string): "male"
     - `createdAt` (timestamp): (click "Add field" → select timestamp)
6. Click "Save"

## Step 6: Configure Environment Variables

1. In your project root, create `.env` file:

```bash
cp .env.example .env
```

2. Open `.env` and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_from_step_2
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_from_step_2
VITE_FIREBASE_PROJECT_ID=your_project_id_from_step_2
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_from_step_2
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_from_step_2
VITE_FIREBASE_APP_ID=your_app_id_from_step_2
```

3. Save the file

**⚠️ Security Note:**

- Never commit `.env` file to Git
- `.env` is already in `.gitignore`
- Keep your Firebase credentials secure

## Step 7: Test the Connection

1. Start your development server:

```bash
npm run dev
```

2. Open the app in your browser (usually `http://localhost:5173`)

3. Fill in the client form and submit

4. Check Firebase Console → Firestore Database → Data
   - You should see a new document in the `clients` collection

5. Go to "Client History" in the app
   - You should see your test client listed

## Step 8: Optional - Set Up Firebase Authentication (Production)

For production, you should add authentication:

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable sign-in methods:
   - Email/Password
   - Google (recommended)
4. Update Firestore rules to require authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{clientId} {
      // Only authenticated users can read/write
      allow read, write: if request.auth != null;

      // Or restrict to specific users:
      // allow read, write: if request.auth.uid == "your_admin_uid";
    }
  }
}
```

## Step 9: Optional - Set Up Indexes (for better performance)

If you plan to have many clients, create indexes:

1. Go to Firestore Database → "Indexes" tab
2. Click "Create index"
3. Collection: `clients`
4. Fields to index:
   - `createdAt` - Descending
   - `name` - Ascending
5. Click "Create"

## Troubleshooting

### Error: "Firebase: Error (auth/api-key-not-valid)"

- Check that your API key in `.env` is correct
- Make sure you're using `VITE_` prefix for all variables
- Restart your dev server after changing `.env`

### Error: "Missing or insufficient permissions"

- Check your Firestore security rules
- Make sure rules allow read/write access
- Verify you're using the correct project

### Data not showing in Client History

- Check browser console for errors
- Verify Firebase configuration is correct
- Check Firestore rules allow read access
- Ensure collection name is exactly `clients`

### PDF not generating

- This is a client-side issue, not Firebase-related
- Check browser console for errors
- Ensure jsPDF is installed: `npm install jspdf jspdf-autotable`

## Firebase Pricing

Current usage should fit within Firebase's free tier:

**Free Tier Limits:**

- Firestore: 1 GB storage, 50K reads/day, 20K writes/day
- Hosting: 10 GB storage, 360 MB/day transfer

For production with many users, consider upgrading to Blaze (pay-as-you-go) plan.

## Data Structure

Each client document in Firestore has this structure:

```javascript
{
  // Basic Info
  name: "Hemant Makkar",
  dob: "1988-11-28",
  gender: "male",
  phone: "+91 98765 43210",
  email: "hemant@example.com",

  // Additional Info
  birthTime: "14:30",
  birthPlace: "Mumbai",
  address: "123 Main Street",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  spouseName: "Optional",

  // Numerology Report
  report: {
    lifePath: 1,
    expression: 9,
    soulUrge: 2,
    personality: 7,
    birthday: 1,
    personalYear: 4,
    lifePathTraits: { ... },
    expressionTraits: { ... },
    soulUrgeTraits: { ... },
    personalityTraits: { ... },
    affirmations: [ ... ]
  },

  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Next Steps

1. ✅ Firebase project created
2. ✅ Firestore database enabled
3. ✅ Security rules configured
4. ✅ Environment variables set
5. ✅ Test connection successful
6. 🚀 Start building!

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review Firebase Console for error messages
3. Check browser console for JavaScript errors
4. Verify all environment variables are set correctly

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com/)
