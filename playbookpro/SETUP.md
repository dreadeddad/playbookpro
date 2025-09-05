# Playbook Pro - Setup Instructions

Complete setup guide for the Playbook Pro basketball coaching platform.

## 📋 Prerequisites

- **Node.js 18+** and npm/yarn
- **Python 3.8+** and pip
- **Firebase account** (for authentication)
- **Google Cloud account** (for Gemini AI - optional)
- **Git** for version control

## 🚀 Quick Setup

### 1. Clone Repository

```bash
git clone https://github.com/dreadeddad/playbookpro.git
cd playbookpro
git checkout main.1
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Or install separately:
npm install              # Root dependencies
cd frontend && npm install  # Frontend dependencies
cd ../backend && pip install -r requirements.txt  # Backend dependencies
```

### 3. Environment Configuration

**Frontend Environment (.env.local):**
```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase configuration:
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
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:
```env
FLASK_APP=app.py
FLASK_ENV=development
PORT=5000
CORS_ORIGINS=http://localhost:3000
FIREBASE_ADMIN_KEY_PATH=./firebase-admin-key.json
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Firebase Setup

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com
   - Click "Create a project"
   - Project name: `playbook-pro`

2. **Enable Authentication:**
   - Click "Authentication" → "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/Password"

3. **Enable Firestore Database:**
   - Click "Firestore Database" → "Create database"
   - Start in "test mode"
   - Choose your preferred location

4. **Enable Storage:**
   - Click "Storage" → "Get started"
   - Start in test mode

5. **Get Configuration:**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" → Click web icon `</>`
   - Register app: `playbook-pro-web`
   - Copy the config and update your `.env.local`

6. **Service Account (Optional):**
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Save as `backend/firebase-admin-key.json`

### 5. Run the Application

**Development Mode (Both servers):**
```bash
npm run dev
```

**Or run separately:**
```bash
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Backend  
npm run dev:backend
```

**Access the application:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## 🔧 Advanced Setup

### Database Configuration

**Option 1: Firebase (Recommended)**
- Already configured if you followed Firebase setup
- No additional configuration needed

**Option 2: MongoDB (Optional)**
```bash
# Install MongoDB locally or use MongoDB Atlas
# Update backend/.env:
DATABASE_URL=mongodb://localhost:27017/playbook_pro
```

**Option 3: PostgreSQL (Optional)**
```bash
# Install PostgreSQL
# Update backend/.env:
DATABASE_URL=postgresql://user:password@localhost/playbook_pro
```

### AI Integration

**Google Gemini API:**
1. Go to https://console.cloud.google.com
2. Enable Gemini API
3. Create API key
4. Add to `backend/.env`: `GEMINI_API_KEY=your_key`

**Alternative: OpenAI API:**
```env
OPENAI_API_KEY=your_openai_key
```

### File Upload Configuration

Create uploads directory:
```bash
mkdir backend/uploads
chmod 755 backend/uploads
```

Update file size limits in `backend/app.py` if needed:
```python
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
```

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests (if implemented)
cd backend
python -m pytest

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📦 Production Deployment

### Frontend (Vercel)

1. **Connect to Vercel:**
```bash
cd frontend
npm install -g vercel
vercel
```

2. **Environment Variables:**
   - Add all `NEXT_PUBLIC_*` variables in Vercel dashboard
   - Ensure `NEXT_PUBLIC_API_URL` points to your production API

### Backend (Railway/Heroku/PythonAnywhere)

**Railway:**
```bash
cd backend
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

**Heroku:**
```bash
cd backend
# Create Procfile
echo "web: gunicorn app:app" > Procfile
heroku create playbook-pro-api
git push heroku main
```

**Environment Variables:**
- Set all variables from `.env` in your deployment platform
- Update CORS_ORIGINS to include your frontend domain

### Database Migration

For production, consider using a managed database:
- **Firebase:** Already configured
- **MongoDB Atlas:** Cloud MongoDB
- **PostgreSQL:** Heroku Postgres, Railway PostgreSQL

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 3000 or 5000
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

**Firebase connection issues:**
- Verify API keys are correct
- Check Firebase project settings
- Ensure domain is authorized in Firebase console

**CORS errors:**
- Update `CORS_ORIGINS` in backend `.env`
- Restart backend server after changes

**File upload errors:**
- Check `backend/uploads` directory exists
- Verify file permissions
- Check file size limits

### Logs and Debugging

**Frontend logs:**
```bash
cd frontend
npm run dev  # Check console for errors
```

**Backend logs:**
```bash
cd backend
FLASK_ENV=development python app.py
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🆘 Support

If you encounter issues:

1. Check this setup guide
2. Review error logs
3. Check GitHub Issues
4. Create new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, Python version)

---

**Happy Coaching! 🏀**