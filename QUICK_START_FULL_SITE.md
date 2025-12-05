# Quick Start - Full Site

## Prerequisites

- Node.js installed
- MongoDB running (see options below)

## Option 1: Quick Start with Docker MongoDB

```bash
# Start MongoDB in Docker
docker run -d -p 27017:27017 --name rural-connect-mongodb mongo:latest

# Start Backend (Terminal 1)
cd backend
npm run dev

# Start Frontend (Terminal 2)
npm run dev
```

Visit: http://localhost:5173

## Option 2: Without MongoDB (Frontend Only)

If you don't have MongoDB, you can still run the frontend:

```bash
npm run dev
```

The frontend will work but backend-dependent features won't function.

## Option 3: Use MongoDB Atlas (Cloud)

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and get your connection string
3. Update `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rural-connect-ai
   ```
4. Start the backend and frontend as in Option 1

## Verify Backend is Running

```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "success": true,
  "message": "Backend is running",
  "timestamp": "...",
  "database": "connected"
}
```

## Available Features

Once both frontend and backend are running:

- ✅ User Authentication
- ✅ Community Matching
- ✅ Resource Discovery
- ✅ Agricultural Dashboard
- ✅ Emergency Alerts
- ✅ Business Directory
- ✅ Cultural Heritage
- ✅ Skills Sharing
- ✅ Mental Health & Wellbeing
- ✅ Chat & Messaging
- ✅ Gig Board
- ✅ Service Navigator
- ✅ Blockchain Credentials
- ✅ Spirit Avatars

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Check if port 3001 is available
- Check `backend/.env` configuration

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check browser console for CORS errors
- Verify `VITE_API_URL` in frontend `.env.development`

### MongoDB connection errors
- Ensure MongoDB is running on port 27017
- Check MongoDB logs
- Try restarting MongoDB service

## Stop Services

```bash
# Stop Docker MongoDB
docker stop rural-connect-mongodb
docker rm rural-connect-mongodb

# Stop backend/frontend
# Press Ctrl+C in their respective terminals
```
