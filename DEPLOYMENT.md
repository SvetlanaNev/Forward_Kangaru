# 🚀 Forward Accelerator Platform - Deployment Guide

## Firebase Setup

### 1. Complete Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your `forward-2e9b1` project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate new private key** → Download the JSON file
5. Extract these values from the JSON:
   - `private_key` → Use for `FIREBASE_PRIVATE_KEY`
   - `client_email` → Use for `FIREBASE_CLIENT_EMAIL`

### 2. Set Up Firestore Database

1. In Firebase Console → **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select your preferred region

### 3. Configure Authentication

1. In Firebase Console → **Authentication**
2. Go to **Sign-in method** tab
3. Enable **Email/Password** provider

## Vercel Deployment

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy from your project directory
```bash
cd accelerator_platform/app
vercel
```

### 3. Configure Environment Variables in Vercel

Go to your Vercel project dashboard and add these environment variables:

**Public Variables:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCSB7-0i_eKz3iozGXRhKubdgPu0f-ogSQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=forward-2e9b1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=forward-2e9b1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=forward-2e9b1.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=454349221539
NEXT_PUBLIC_FIREBASE_APP_ID=1:454349221539:web:project-454349221539
```

**Private Variables (from your Firebase service account JSON):**
```
FIREBASE_PROJECT_ID=forward-2e9b1
FIREBASE_CLIENT_EMAIL=[your-service-account-email]
FIREBASE_PRIVATE_KEY=[your-private-key-with-newlines]
```

### 4. Redeploy
```bash
vercel --prod
```

## Alternative: Deploy with GitHub

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Vercel will auto-deploy on every push

## Post-Deployment

1. Test authentication (sign up/sign in)
2. Create a test project
3. Verify calendar functionality
4. Check daily updates and comments

## Firestore Security Rules

Add these rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Others can read for discovery
    }
    
    // Projects are readable by all authenticated users
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.founderId;
    }
    
    // Daily updates
    match /dailyUpdates/{updateId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Comments
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Availability slots
    match /availabilitySlots/{slotId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Booked sessions
    match /bookedSessions/{sessionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Build Issues
- Make sure all environment variables are set
- Check Firebase project ID matches everywhere
- Verify Firebase services are enabled

### Authentication Issues
- Ensure Email/Password is enabled in Firebase Auth
- Check that Firebase Auth domain is configured
- Verify API keys are correct

### Database Issues
- Make sure Firestore is initialized
- Check security rules allow your operations
- Verify collection names match the code

## Your App Features ✨

Your migrated app now includes:
- 🔐 Firebase Authentication 
- 📊 Project Management with beautiful card layout
- 📅 Calendar with availability booking (similar to Focusmate)
- 💬 Comments and feedback system
- 👥 Team discovery and networking
- 📈 Daily progress tracking with visual indicators
- 🎨 Modern gradient UI design

The project maintains the exact layout you loved - with each project displayed in its own row with horizontal scrolling for daily updates! 