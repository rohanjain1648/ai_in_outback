# 🔧 Quick Fix: Backend MongoDB Error

## The Problem

You're seeing this error:
```
Error: Config validation error: "MONGODB_URI" is required
```

This happens because the backend needs MongoDB to run, but it's not configured yet.

## ✅ Solution 1: Run Frontend Only (Fastest)

If you just want to test the **voice interface** and don't need backend features:

```powershell
.\start-frontend-only.ps1
```

This will:
- ✅ Start only the frontend
- ✅ Let you test the voice interface
- ✅ No database required!

**Access at:** http://localhost:5173

---

## ✅ Solution 2: Setup Environment Files

If you want the full stack with backend:

### Step 1: Run the environment setup
```powershell
.\setup-env.ps1
```

This creates the necessary `.env` files with default values.

### Step 2: Choose your database option

**Option A: Run without MongoDB (Backend will show errors but won't crash)**
```powershell
.\start-local.ps1
```
The frontend will work fine, backend will log connection errors.

**Option B: Install MongoDB**

**Using Docker (Easiest):**
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

**Or download MongoDB:**
- Download from: https://www.mongodb.com/try/download/community
- Install and start the MongoDB service

### Step 3: Start the application
```powershell
.\start-local.ps1
```

---

## ✅ Solution 3: Manual Environment Setup

If the scripts don't work, manually create `backend/.env`:

```bash
# Navigate to backend folder
cd backend

# Create .env file
notepad .env
```

Paste this content:
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/rural-connect-ai
JWT_SECRET=dev-secret-key-12345
JWT_REFRESH_SECRET=dev-refresh-secret-key-12345
CORS_ORIGIN=http://localhost:5173
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
BCRYPT_SALT_ROUNDS=12
OPENAI_API_KEY=
WEATHER_API_KEY=
ELASTICSEARCH_URL=http://localhost:9200
```

Save and close, then:
```powershell
cd ..
.\start-local.ps1
```

---

## 🎯 Recommended for Testing Voice Interface

**Just run:**
```powershell
.\start-frontend-only.ps1
```

This is the fastest way to test the voice interface features without dealing with backend setup!

---

## What Works Without Backend?

✅ **Voice Interface** - Full functionality
✅ **UI Components** - All visual elements
✅ **3D Graphics** - Three.js scenes
✅ **Animations** - Framer Motion effects
✅ **Local State** - React state management

❌ **API Calls** - Will fail (expected)
❌ **Database Operations** - Not available
❌ **Real-time Features** - Socket.io won't connect

---

## Need More Help?

Check these files:
- `LOCAL_SETUP_GUIDE.md` - Complete setup guide
- `VOICE_INTERFACE_IMPLEMENTATION.md` - Voice interface details
- `src/components/voice/README.md` - Voice component docs
