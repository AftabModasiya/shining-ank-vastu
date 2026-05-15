# Shining Ank Vastu - Numerology Report Generator

A modern, professional numerology report generator built with React, Vite, and Firebase. Generate personalized Vedic numerology reports with beautiful PDF exports and client management.

## Features

- 🎯 **Numerology Calculations**: Life Path, Expression, Soul Urge, Personality, Birthday, and Personal Year numbers
- 📊 **Lo Shu Grid Analysis**: Visual representation of number distribution
- 📄 **PDF Generation**: Professional, beautifully formatted PDF reports
- ✏️ **Editable Reports**: Edit client information and regenerate reports
- 💾 **Client History**: Store and manage all client data in Firebase
- 🔍 **Search & Filter**: Easily find clients by name, email, or phone
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🎨 **Modern UI**: Clean, professional interface with smooth animations

## Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM
- **Database**: Firebase Firestore
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **Icons**: Lucide React
- **Styling**: Custom CSS with CSS Variables

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:

```bash
cd shining-ank-vastu
```

2. Install dependencies:

```bash
npm install
```

3. Set up Firebase:

   a. Go to [Firebase Console](https://console.firebase.google.com/)

   b. Create a new project or use existing one

   c. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create database"
   - Start in production mode
   - Choose your location

   d. Get your Firebase configuration:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click on the web icon (</>)
   - Copy the configuration object

4. Create environment file:

```bash
cp .env.example .env
```

5. Update `.env` with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

### Firebase Security Rules

Set up Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{document=**} {
      allow read, write: if true; // For development
      // For production, add proper authentication
    }
  }
}
```

### Running the Application

Development mode:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Project Structure

```
shining-ank-vastu/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase configuration
│   ├── pages/
│   │   ├── Home.jsx             # Main form page
│   │   ├── Home.css
│   │   ├── ReportView.jsx       # Report display & edit
│   │   ├── ReportView.css
│   │   ├── ClientHistory.jsx    # Client list & management
│   │   └── ClientHistory.css
│   ├── services/
│   │   └── clientService.js     # Firebase CRUD operations
│   ├── utils/
│   │   ├── numerology.js        # Numerology calculations
│   │   └── pdfGenerator.js      # PDF generation logic
│   ├── App.jsx                  # Main app component
│   ├── App.css                  # Global styles
│   ├── main.jsx                 # Entry point
│   └── index.css                # Base styles
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Usage

### Adding a New Client

1. Fill in the client form on the home page
2. Required fields: Name and Date of Birth
3. Click "Generate Numerology Report"
4. The report will be generated and saved to Firebase

### Viewing Reports

1. After generation, you'll be redirected to the report view
2. Or access from Client History page
3. View all numerology calculations and insights

### Editing Reports

1. Click "Edit Report" button on the report page
2. Modify client information
3. Click "Save Changes" to update Firebase

### Downloading PDF

1. Click "Download PDF" button on any report
2. A professionally formatted PDF will be generated
3. PDF includes all numerology data and insights

### Managing Clients

1. Go to "Client History" from the home page
2. Search clients by name, email, or phone
3. View or delete client records
4. Click on any client to view their full report

## Numerology Calculations

The app calculates the following numbers based on Vedic numerology:

- **Life Path Number (Mulank)**: Calculated from date of birth
- **Expression Number (Bhagyank)**: Calculated from full name
- **Soul Urge Number**: Calculated from vowels in name
- **Personality Number**: Calculated from consonants in name
- **Birthday Number**: Simplified day of birth
- **Personal Year Number**: Current year's influence
- **Lo Shu Grid**: 3x3 grid showing number distribution

## Color Scheme

The application uses a professional color palette inspired by the reference site:

- Primary Purple: `#4a3a8a`
- Accent Gold: `#daa520`
- Background Cream: `#faf8f5`
- Text Dark: `#2c2c2c`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a private project. For any issues or suggestions, please contact the development team.

## License

© 2026 Occult King by Pinnacle Vastu. All Rights Reserved.

## Support

For support, email: support@pinnaclevastu.com

## Acknowledgments

- Vedic Numerology principles
- Chaldean numerology system
- Lo Shu Grid ancient wisdom
