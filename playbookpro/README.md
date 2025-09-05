# Playbook Pro - Youth Basketball Coaching Platform

A full-stack web and mobile application for youth basketball coaches and players with interactive playbooks, 3D simulations, and AI-powered coaching feedback.

## 🏀 Features

- **Role-Based Access**: Separate interfaces for coaches and players
- **Interactive Playbooks**: 2D/3D basketball play visualization
- **AI Coaching Feedback**: Powered by Google Gemini API
- **Playbook Creation**: Drag & drop play designer for coaches
- **Performance Analytics**: Track player progress and improvement
- **Cross-Platform**: Web and mobile support

## 🛠️ Tech Stack

**Frontend:**
- React/Next.js
- TypeScript
- Firebase Authentication
- React Three Fiber (3D graphics)
- Tailwind CSS

**Backend:**
- Python Flask
- Firebase Admin SDK
- Google Gemini API integration
- File upload handling

**Database & Storage:**
- Firebase Firestore
- Firebase Storage
- MongoDB (optional)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.8+
- Firebase account
- Google Cloud account (for Gemini API)

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/dreadeddad/playbookpro.git
cd playbookpro
git checkout main.1
```

### 2. Environment Setup

**Frontend Environment (.env.local):**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend Environment (.env):**
```env
FLASK_APP=app.py
FLASK_ENV=development
FIREBASE_ADMIN_KEY_PATH=./firebase-admin-key.json
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGINS=http://localhost:3000
```

### 3. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Enable Storage
5. Download service account key → `backend/firebase-admin-key.json`
6. Update environment variables with your Firebase config

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 5. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
playbookpro/
├── frontend/                 # Next.js React frontend
│   ├── pages/               # Next.js page routes
│   │   ├── index.tsx        # Landing page with role selection
│   │   ├── dashboard.tsx    # User dashboard
│   │   ├── playbooks/       # Playbook routes
│   │   └── create.tsx       # Playbook creation
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── lib/            # Utilities and configs
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript definitions
│   ├── public/             # Static assets
│   └── styles/             # CSS styles
├── backend/                 # Flask Python backend
│   ├── app.py              # Main Flask application
│   ├── models/             # Data models
│   ├── routes/             # API route handlers
│   ├── utils/              # Helper functions
│   └── uploads/            # File upload directory
└── docs/                   # Documentation
```

## 🎯 Usage

### For Coaches:
1. Register/Login as a Coach
2. Create custom basketball playbooks
3. Upload existing playbooks (PDF/JSON)
4. View player performance analytics
5. Share playbooks with players

### for Players:
1. Register/Login as a Player
2. Browse assigned playbooks
3. Practice plays in 3D simulation
4. View AI coaching feedback
5. Track progress and improvement

## 🔗 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Playbooks
- `GET /api/playbooks` - List playbooks
- `POST /api/playbooks` - Create playbook
- `GET /api/playbooks/:id` - Get specific playbook
- `PUT /api/playbooks/:id` - Update playbook
- `DELETE /api/playbooks/:id` - Delete playbook

### File Upload
- `POST /api/upload` - Upload playbook files
- `GET /api/uploads/:filename` - Serve uploaded files

### AI Features
- `POST /api/ai/analyze` - AI performance analysis
- `POST /api/ai/feedback` - Generate coaching feedback

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
python -m pytest
```

## 🚢 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Railway/Heroku)
```bash
# Set environment variables
# Deploy using platform-specific commands
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@playbookpro.com or create an issue on GitHub.

---

**Built with ❤️ for youth basketball development**