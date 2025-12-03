# 🚀 Rural Connect AI - Local Development Setup Guide

## Quick Start (Recommended)

### Option 1: Using PowerShell Script (Windows)

The easiest way to run the project locally:

```powershell
.\start-local.ps1
```

This script will:
- ✅ Check for Node.js and npm
- ✅ Install all dependencies (frontend + backend)
- ✅ Build the application
- ✅ Start both frontend and backend servers

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## Manual Setup

If you prefer to set up manually or the script doesn't work:

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)

Check your versions:
```bash
node --version  # Should be v18+
npm --version   # Should be 9+
```

### Step 1: Install Dependencies

#### Frontend Dependencies
```bash
# In the project root directory
npm install
```

#### Backend Dependencies
```bash
# Navigate to backend directory
cd backend
npm install
cd ..
```

### Step 2: Environment Configuration

The project uses `.env.development` for local development. The default configuration should work out of the box:

```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
NODE_ENV=development
```

If you need to customize, create a `.env.local` file in the root directory.

### Step 3: Start the Development Servers

You need to run both frontend and backend servers:

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

The backend will start on: **http://localhost:3001**

#### Terminal 2 - Frontend Server
```bash
# In the project root
npm run dev
```

The frontend will start on: **http://localhost:5173**

### Step 4: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api

---

## Testing the Voice Interface

To test the newly implemented voice interface:

1. **Open the application** in a supported browser (Chrome, Edge, or Safari)
2. **Allow microphone permissions** when prompted
3. **Try voice commands**:
   - "Search for farmers"
   - "Go to dashboard"
   - "Help"
   - "Home"

### Voice Interface Demo

To see a dedicated demo of the voice interface:

1. Import the VoiceDemo component in your App.tsx:
```tsx
import { VoiceDemo } from './components/voice/VoiceDemo';

// Add to your component
<VoiceDemo />
```

2. Or use the integration example:
```tsx
import { VoiceIntegrationExample } from './components/voice/VoiceIntegrationExample';

<VoiceIntegrationExample
  onNavigate={(view) => console.log('Navigate to:', view)}
  onSearch={(query) => console.log('Search:', query)}
  onPost={(content) => console.log('Post:', content)}
/>
```

---

## Available Scripts

### Frontend Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

### Backend Scripts

```bash
cd backend
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

---

## Project Structure

```
rural-connect-ai/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── voice/               # 🎤 Voice interface components (NEW!)
│   │   │   ├── VoiceInterface.tsx
│   │   │   ├── VoiceDemo.tsx
│   │   │   └── VoiceIntegrationExample.tsx
│   │   ├── agricultural/        # Agricultural features
│   │   ├── admin/               # Admin dashboard
│   │   └── ...
│   ├── services/                # API services
│   │   ├── voiceService.ts      # 🎤 Voice service (NEW!)
│   │   └── ...
│   ├── hooks/                   # Custom React hooks
│   │   ├── useVoice.ts          # 🎤 Voice hook (NEW!)
│   │   └── ...
│   ├── types/                   # TypeScript types
│   │   ├── voice.ts             # 🎤 Voice types (NEW!)
│   │   ├── speech.d.ts          # 🎤 Speech API types (NEW!)
│   │   └── ...
│   └── utils/                   # Utility functions
├── backend/                     # Backend source code
│   ├── src/
│   │   ├── models/             # Database models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── middleware/         # Express middleware
│   └── package.json
├── package.json                 # Frontend dependencies
├── start-local.ps1             # Quick start script
└── README.md                    # Project documentation
```

---

## Troubleshooting

### Port Already in Use

If you get an error that port 5173 or 3001 is already in use:

**Windows:**
```powershell
# Find process using port 5173
netstat -ano | findstr :5173

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Alternative:** Change the port in `vite.config.ts`:
```ts
export default defineConfig({
  server: {
    port: 3000, // Change to any available port
  },
});
```

### Module Not Found Errors

If you see "Cannot find module" errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Do the same for backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

If you see TypeScript compilation errors:

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Rebuild
npm run build
```

### Voice Interface Not Working

If the voice interface doesn't work:

1. **Check browser support**: Use Chrome, Edge, or Safari
2. **Allow microphone permissions**: Check browser settings
3. **Use HTTPS or localhost**: Web Speech API requires secure context
4. **Check console**: Open browser DevTools (F12) for error messages

---

## Docker Setup (Optional)

For a full production-like environment with all services:

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Start All Services

```bash
# Start all services (MongoDB, Redis, Elasticsearch, etc.)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Services will be available at:**
- Frontend: http://localhost:80
- Backend: http://localhost:3000
- MongoDB: localhost:27017
- Redis: localhost:6379
- Elasticsearch: http://localhost:9200
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

---

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- **Frontend**: Changes to `.tsx`, `.ts`, `.css` files will auto-reload
- **Backend**: Changes to `.ts` files will restart the server automatically

### Browser DevTools

For debugging the voice interface:
1. Open DevTools (F12)
2. Go to Console tab
3. Try voice commands and watch the logs

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

---

## Next Steps

1. ✅ **Run the application locally**
2. 🎤 **Test the voice interface** with different commands
3. 🔍 **Explore the codebase** in `src/components/voice/`
4. 📖 **Read the documentation** in `src/components/voice/README.md`
5. 🚀 **Start implementing** the next task from the spec

---

## Need Help?

- Check the main README.md for project overview
- Review the voice interface documentation: `src/components/voice/README.md`
- Check the implementation summary: `VOICE_INTERFACE_IMPLEMENTATION.md`
- Look at the spec documents in `.kiro/specs/hackathon-enhancements/`

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `.\start-local.ps1` | Quick start (Windows) |
| `npm run dev` | Start frontend dev server |
| `cd backend && npm run dev` | Start backend dev server |
| `npm run build` | Build for production |
| `npm run test` | Run tests |
| `npm run lint` | Check code quality |

---

**Happy coding! 🎉**
