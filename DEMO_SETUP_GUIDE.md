# 🎬 Demo Setup Guide for Hackathon Judges

This guide will help you quickly set up the Rural Connect AI platform with realistic demo data for your video presentation.

## 🚀 Quick Setup (5 minutes)

### Step 1: Start MongoDB

Choose one option:

**Option A: Docker (Recommended)**
```bash
docker run -d -p 27017:27017 --name rural-connect-demo mongo:latest
```

**Option B: Local MongoDB**
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### Step 2: Seed Demo Data

```bash
cd backend
npm run seed:demo
```

This will create:
- ✅ 5 demo users with different roles
- ✅ 2 farms with realistic data
- ✅ 2 local businesses
- ✅ 3 cultural stories
- ✅ 4 skills for exchange
- ✅ 3 gig job postings
- ✅ 2 service listings
- ✅ 3 blockchain credentials
- ✅ 3 spirit avatars
- ✅ 3 community resources
- ✅ 2 emergency alerts
- ✅ 2 wellbeing check-ins
- ✅ 2 chat rooms with messages

### Step 3: Start the Backend

```bash
# In backend directory
npm run dev
```

Wait for: `🚀 Rural Connect AI API server running on port 3001`

### Step 4: Start the Frontend

```bash
# In root directory
npm run dev
```

Visit: http://localhost:5173

## 🔑 Demo Login Credentials

All demo users have the password: **demo123**

### Demo Users:

1. **Sarah Thompson** (Farmer)
   - Email: `sarah@demo.com`
   - Role: Third-generation farmer
   - Features: Farm management, agricultural dashboard

2. **Jack Williams** (Elder)
   - Email: `jack@demo.com`
   - Role: Cultural knowledge keeper
   - Features: Cultural stories, traditional skills

3. **Emma Chen** (Health Worker)
   - Email: `emma@demo.com`
   - Role: Mental health counselor
   - Features: Wellbeing services, counseling

4. **Tom Anderson** (Tech Helper)
   - Email: `tom@demo.com`
   - Role: Technology educator
   - Features: Tech support, digital literacy

5. **Lisa Martinez** (Business Owner)
   - Email: `lisa@demo.com`
   - Role: Small business owner
   - Features: Business directory, local economy

## 🎥 Demo Video Script Suggestions

### 1. Opening (30 seconds)
- Show landing page
- Highlight the problem: Rural isolation and limited access to services
- Show the solution: Rural Connect AI platform

### 2. User Journey - Sarah (Farmer) (2 minutes)
Login as `sarah@demo.com`

**Show:**
- ✅ Agricultural Dashboard with farm data
- ✅ Weather alerts and crop monitoring
- ✅ Community connections with other farmers
- ✅ Gig board - posting harvest help needed
- ✅ Spirit avatar - "Golden Harvest Spirit"

### 3. Cultural Heritage - Jack (Elder) (1.5 minutes)
Login as `jack@demo.com`

**Show:**
- ✅ Cultural stories dashboard
- ✅ "Rainbow Serpent" Dreamtime story
- ✅ Traditional bush medicine knowledge
- ✅ Blockchain credential for basket weaving mastery
- ✅ Spirit avatar - "Ancient Wisdom Keeper"

### 4. Mental Health Support - Emma (1.5 minutes)
Login as `emma@demo.com`

**Show:**
- ✅ Wellbeing dashboard
- ✅ Service listings for counseling
- ✅ Community support connections
- ✅ Crisis resources
- ✅ Peer support volunteer opportunities

### 5. Community Features (1.5 minutes)
**Show:**
- ✅ Chat rooms (Sustainable Farming Group)
- ✅ Real-time messaging
- ✅ Emergency alerts system
- ✅ Service navigator
- ✅ Skills exchange marketplace

### 6. Innovation Highlights (1 minute)
**Show:**
- ✅ Blockchain credentials (verified skills)
- ✅ AI-powered spirit avatars
- ✅ Voice interface (accessibility)
- ✅ Offline-first capabilities
- ✅ 3D landscape visualization

### 7. Closing (30 seconds)
- Impact summary
- Future vision
- Call to action

## 📊 Key Features to Highlight

### 🌟 Unique Innovations
1. **Spirit Avatars** - AI-generated cultural identity
2. **Blockchain Credentials** - Verified skills and achievements
3. **Voice Interface** - Accessibility for all literacy levels
4. **Offline-First** - Works without internet
5. **Cultural Preservation** - Digital storytelling platform

### 🎯 Core Features
1. **Agricultural Intelligence** - Farm management and monitoring
2. **Mental Health Support** - Wellbeing check-ins and counseling
3. **Community Matching** - Connect people with shared interests
4. **Gig Economy** - Local job marketplace
5. **Service Navigator** - Find local services easily
6. **Emergency Alerts** - Real-time community safety
7. **Skills Exchange** - Learn and teach traditional skills
8. **Business Directory** - Support local economy

## 🎨 Visual Tips for Demo Video

### Good Shots to Capture:
- ✅ Dashboard with real data (not empty states)
- ✅ Map views showing community connections
- ✅ Chat conversations in action
- ✅ Spirit avatar gallery
- ✅ Blockchain credential verification
- ✅ Mobile responsive views
- ✅ Accessibility features (voice, high contrast)

### Transitions:
- Use smooth transitions between features
- Show user switching (logout/login) quickly
- Highlight notifications and real-time updates

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Or restart it
docker restart rural-connect-demo
```

### "Port 3001 already in use"
```bash
# Kill the process
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### "Seed script fails"
```bash
# Clear database and try again
mongo
use rural-connect-ai
db.dropDatabase()
exit

# Run seed again
npm run seed:demo
```

## 📝 Demo Checklist

Before recording:

- [ ] MongoDB is running
- [ ] Backend is running (port 3001)
- [ ] Frontend is running (port 5173)
- [ ] Demo data is seeded
- [ ] Test login with sarah@demo.com
- [ ] Browser is in full screen
- [ ] Close unnecessary tabs/windows
- [ ] Disable notifications
- [ ] Check audio levels
- [ ] Practice the flow once

## 🎉 You're Ready!

Your platform now has realistic data that tells a compelling story about rural community connection, cultural preservation, and digital inclusion.

Good luck with your demo! 🚀
