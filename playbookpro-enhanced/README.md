# Playbook Pro v1.1 - Enhanced with Firebase Storage

A full-stack youth basketball coaching platform with **Firebase Storage integration** for seamless file uploads, interactive playbooks, 3D simulations, and AI-powered coaching feedback.

## 🚀 New in v1.1: Firebase Storage Integration

- **🔥 Firebase Storage** - Secure cloud file storage for playbooks
- **📁 Enhanced Upload Endpoint** - Handles JSON/PDF uploads with Firebase integration
- **🛡️ Error Handling** - Comprehensive upload error handling and user alerts
- **☁️ Dual Storage** - Firebase Storage with local storage fallback
- **📊 Upload Status** - Real-time upload progress and storage type indicators

## 🏀 Features

- **Role-Based Access**: Separate interfaces for coaches and players
- **Interactive Playbooks**: 2D/3D basketball play visualization
- **AI Coaching Feedback**: Powered by Google Gemini API
- **Firebase Storage**: Secure cloud file uploads for playbooks
- **Playbook Creation**: Drag & drop play designer with file upload
- **Performance Analytics**: Track player progress and improvement
- **Cross-Platform**: Web and mobile support

## 🛠️ Tech Stack

**Frontend:**
- React/Next.js + TypeScript
- Firebase Authentication & Storage
- React Three Fiber (3D graphics)
- Tailwind CSS + Framer Motion

**Backend:**
- Python Flask + Firebase Admin SDK
- Firebase Firestore & Storage
- Google Gemini API integration
- Enhanced file upload handling

**Database & Storage:**
- Firebase Firestore (primary)
- Firebase Storage (files)
- Local storage (fallback)

## 📋 Prerequisites

- **Node.js 18+** and npm/yarn
- **Python 3.8+** and pip
- **Firebase account** (for authentication & storage)
- **Google Cloud account** (for Gemini AI - optional)

## 🔥 Firebase Setup (Required)

### Step 1: Create Firebase Project

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Create a project**: Click "Create a project"
3. **Project name**: `playbook-pro` (or your preferred name)
4. **Google Analytics**: Enable (recommended for analytics)

### Step 2: Enable Firebase Services

**Authentication:**
1. Click "Authentication" → "Get started"
2. Go to "Sign-in method" tab
3. Enable "Email/Password"
4. Click "Save"

**Firestore Database:**
1. Click "Firestore Database" → "Create database"
2. **Start in test mode** (for development)
3. Choose your preferred location
4. Click "Done"

**Storage:**
1. Click "Storage" → "Get started"
2. **Start in test mode** (for development)
3. **Storage location**: Choose same as Firestore
4. Click "Done"

### Step 3: Configure Storage Rules

In Firebase Console → Storage → Rules, update to:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read/write access to playbooks folder
    match /playbooks/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow public read access for public playbooks
    match /playbooks/public/{allPaths=**} {
      allow read;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 4: Get Configuration Keys

1. **Go to Project Settings** (gear icon)
2. **Scroll to "Your apps"** section
3. **Click web icon `</>`** 
4. **App nickname**: `playbook-pro-web`
5. **Copy the configuration object**

### Step 5: Download Service Account Key

1. **Go to Project Settings → Service Accounts**
2. **Click "Generate new private key"**
3. **Download the JSON file**
4. **Rename it to `firebase-admin-key.json`**
5. **Save in `backend/` directory**

⚠️ **Important**: Never commit `firebase-admin-key.json` to version control!

## 🚀 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/dreadeddad/playbookpro.git
cd playbookpro
git checkout main.1.1  # Enhanced version
```

### 2. Install Dependencies

```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend
npm install

# Backend dependencies  
cd ../backend
pip install -r requirements.txt
```

### 3. Environment Configuration

**Frontend (.env.local):**
```bash
cd frontend
cp .env.local.example .env.local
```

Update with your Firebase config:
```env
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com  
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Update configuration:
```env
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
PORT=5000

# CORS Configuration
CORS_ORIGINS=http://localhost:3000

# Firebase Configuration (Required)
FIREBASE_ADMIN_KEY_PATH=./firebase-admin-key.json
FIREBASE_STORAGE_BUCKET=your_project.appspot.com

# AI Configuration (Optional)
GEMINI_API_KEY=your_gemini_api_key_here

# File Upload Configuration
MAX_CONTENT_LENGTH=16777216
UPLOAD_FOLDER=./uploads
```

### 4. Add Firebase Service Account Key

1. **Place your downloaded `firebase-admin-key.json`** in the `backend/` directory
2. **Verify the file path** matches `FIREBASE_ADMIN_KEY_PATH` in `.env`
3. **Ensure it's added to `.gitignore`** (already included)

### 5. Run the Application

**Development Mode:**
```bash
# Start both servers
npm run dev

# Or separately:
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:5000
```

## 🔧 Enhanced Upload Features

### File Upload Types Supported

- **JSON Playbooks** - Automatically parsed and imported
- **PDF Files** - Stored for reference
- **Text Files** - Plain text playbook descriptions
- **Images** - PNG, JPG, JPEG for diagrams

### Upload Flow

1. **Firebase Storage** (primary) - Secure cloud storage
2. **Backend Storage** (fallback) - Local server storage
3. **Error Handling** - User-friendly error messages and alerts
4. **Progress Tracking** - Real-time upload status

### Upload Endpoint API

```bash
# Enhanced upload with Firebase integration
POST /api/upload

# Response includes:
{
  "filename": "timestamped_filename.json",
  "original_name": "my_playbook.json", 
  "firebase_url": "https://firebasestorage.googleapis.com/...",
  "storage_type": "firebase",
  "size": 1024,
  "playbook_created": true,
  "playbook_id": "uuid-here"
}
```

## 🧪 Testing Firebase Integration

### Test Upload Functionality

1. **Start the application**: `npm run dev`
2. **Navigate to Create Playbook**: `/create`
3. **Upload a JSON file** with playbook structure:

```json
{
  "title": "Test Playbook",
  "description": "Testing Firebase upload",
  "category": "offense",
  "plays": [
    {
      "step_number": 1,
      "description": "Initial setup",
      "player_positions": [
        {
          "x": 0.5,
          "y": 0.8,
          "role": "point_guard",
          "responsibilities": ["Control ball"]
        }
      ],
      "key_actions": ["Ball control"]
    }
  ]
}
```

4. **Verify upload success** - Check Firebase Storage console
5. **Test error handling** - Try uploading invalid file types

## 🚢 Production Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
vercel deploy

# Set environment variables in Vercel dashboard:
# - All NEXT_PUBLIC_* variables
# - Ensure NEXT_PUBLIC_API_URL points to production API
```

### Backend (Railway/Heroku)

**Railway:**
```bash
cd backend
railway init
railway up

# Set environment variables:
# - FIREBASE_ADMIN_KEY_PATH (upload the JSON file)
# - FIREBASE_STORAGE_BUCKET
# - All other .env variables
```

**Heroku:**
```bash
cd backend
echo "web: gunicorn app:app" > Procfile
heroku create playbook-pro-api
heroku config:set $(cat .env | sed '/^#/d' | xargs)

# Upload firebase-admin-key.json via Heroku CLI:
heroku config:set FIREBASE_ADMIN_KEY="$(cat firebase-admin-key.json)"
```

## 📊 Firebase Storage Structure

```
playbooks/
├── public/              # Public playbooks
│   ├── 20240101_120000_offense_playbook.json
│   └── 20240101_120500_defense_guide.pdf
├── private/             # Private team playbooks
│   ├── team1/
│   │   ├── secret_play.json
│   │   └── strategy.pdf
│   └── team2/
└── uploads/             # General uploads
    ├── images/
    └── documents/
```

## 🔒 Security Considerations

### Firebase Security Rules

- **Authentication required** for uploads
- **Role-based access** for private playbooks
- **File type validation** on client and server
- **File size limits** (16MB max)

### Backend Validation

- **File extension checking**
- **Content type validation** 
- **Virus scanning** (recommended for production)
- **Rate limiting** on upload endpoints

## 🐛 Troubleshooting

### Firebase Storage Issues

**Connection failed:**
```bash
# Check Firebase configuration
# Verify service account key path
# Ensure Storage is enabled in Firebase Console
```

**Upload errors:**
```bash
# Check Firebase Storage rules
# Verify authentication tokens
# Check file size limits (16MB)
```

**Permissions denied:**
```bash
# Update Storage rules
# Check user authentication status
# Verify service account permissions
```

### Common Fixes

**"Firebase not initialized":**
- Check environment variables
- Verify service account key exists
- Ensure Firebase project is active

**"Upload failed" errors:**
- Check internet connection
- Verify file type is allowed
- Check Firebase quota limits

## 📚 API Documentation

### Enhanced Endpoints

```bash
# Health check with Firebase status
GET /api/health

# Enhanced upload with Firebase
POST /api/upload
  - Form data: file, coach_id
  - Returns: Firebase URL, storage type, playbook info

# Playbooks with Firebase URLs
GET /api/playbooks
  - Returns: Playbooks with firebase_url fields
```

## 🤝 Contributing to main.1.1

```bash
# Create feature branch from main.1.1
git checkout main.1.1
git pull origin main.1.1
git checkout -b feature/your-enhancement

# Make changes
git add .
git commit -m "feat: your enhancement description"
git push origin feature/your-enhancement

# Create pull request to main.1.1
```

## 📈 Version History

- **v1.1**: Firebase Storage integration, enhanced uploads, error handling
- **v1.0**: Initial release with local storage and basic features

## 🆘 Support

For Firebase integration issues:

1. **Check Firebase Console** for service status
2. **Verify environment variables** are correctly set
3. **Review error logs** in browser console and server logs
4. **Test with sample JSON file** provided above

---

**Enhanced Basketball Coaching Platform with Firebase Storage! 🏀🔥**

Ready for production deployment with secure cloud storage and seamless file uploads.