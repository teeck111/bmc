# Firebase Setup Instructions for BMC

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `bmc-trip-log` (or your preferred name)
4. Enable Google Analytics if desired
5. Click "Create project"

## 2. Set up Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for now (we'll secure it later)
4. Select a location close to you
5. Click "Done"

## 3. Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon (</>) to add a web app
4. Register app with name "BMC Trip Log"
5. Copy the config object that looks like:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 4. Update firebase-config.js

Replace the placeholder values in `firebase-config.js` with your actual Firebase config values.

## 5. Set up Firestore Security Rules (Optional but Recommended)

Go to Firestore > Rules and update to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all trips
    match /bmc-trips/{tripId} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can write
    }
  }
}
```

## 6. Enable Authentication (Optional)

If you want to add proper user authentication:
1. Go to Authentication in Firebase Console
2. Click "Get started"
3. Choose sign-in methods (Email/Password recommended)
4. Set up users as needed

## 7. Test the Setup

1. Start your local server: `python3 -m http.server 8000`
2. Open `http://localhost:8000/trip-log.html`
3. Check browser console for Firebase connection messages
4. Try adding a new trip to test database integration

## Fallback Mode

The app is designed to fall back to localStorage if Firebase is not available or configured, so it will work without Firebase setup, but data won't be persistent across devices.