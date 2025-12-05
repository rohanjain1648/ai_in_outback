# 🏆 Rural Connect AI - Hackathon Demo

## 🎯 One-Command Setup

### Windows:
```powershell
.\setup-demo.ps1
```

### Mac/Linux:
```bash
chmod +x setup-demo.sh
./setup-demo.sh
```

## 🚀 Manual Setup (If script doesn't work)

### 1. Start MongoDB
```bash
docker run -d -p 27017:27017 --name rural-connect-demo mongo:latest
```

### 2. Seed Demo Data
```bash
cd backend
npm run seed:demo
```

### 3. Start Backend
```bash
cd backend
npm run dev
```

### 4. Start Frontend (New Terminal)
```bash
npm run dev
```

### 5. Open Browser
Visit: http://localhost:5173

## 🔑 Login Credentials

**Email:** sarah@demo.com  
**Password:** demo123

(All demo users have password: demo123)

## 👥 Demo Users

1. **sarah@demo.com** - Farmer (Agricultural features)
2. **jack@demo.com** - Elder (Cultural heritage)
3. **emma@demo.com** - Health Worker (Wellbeing services)
4. **tom@demo.com** - Tech Helper (Digital literacy)
5. **lisa@demo.com** - Business Owner (Local economy)

## 📊 What's Included

The demo data includes:
- ✅ 5 realistic user profiles
- ✅ 2 farms with crop and livestock data
- ✅ 2 local businesses
- ✅ 3 cultural stories (Dreamtime, bush medicine, farming heritage)
- ✅ 4 skills for exchange
- ✅ 3 gig job postings
- ✅ 2 service listings
- ✅ 3 blockchain credentials
- ✅ 3 AI-generated spirit avatars
- ✅ 3 community resources
- ✅ 2 emergency alerts
- ✅ 2 wellbeing check-ins
- ✅ 2 chat rooms with messages

## 🎬 Demo Flow Suggestion

### Act 1: The Problem (30 sec)
Show the challenges of rural isolation

### Act 2: The Solution (6 min)
1. **Agricultural Dashboard** (1 min)
   - Login as Sarah
   - Show farm management
   - Weather alerts
   - Community connections

2. **Cultural Heritage** (1.5 min)
   - Login as Jack
   - Cultural stories
   - Traditional knowledge
   - Blockchain credentials

3. **Mental Health Support** (1 min)
   - Login as Emma
   - Wellbeing dashboard
   - Service listings
   - Crisis resources

4. **Community Features** (1.5 min)
   - Chat rooms
   - Emergency alerts
   - Skills exchange
   - Gig board

5. **Innovation Showcase** (1 min)
   - Spirit avatars
   - Voice interface
   - Offline capabilities
   - 3D landscapes

### Act 3: Impact & Vision (30 sec)
Closing message about rural empowerment

## 🌟 Key Features to Highlight

### Unique Innovations:
- 🎨 **AI Spirit Avatars** - Cultural identity representation
- 🔐 **Blockchain Credentials** - Verified skills & achievements
- 🎤 **Voice Interface** - Accessibility for all literacy levels
- 📱 **Offline-First** - Works without internet
- 🏛️ **Cultural Preservation** - Digital storytelling platform

### Core Features:
- 🚜 Agricultural Intelligence
- 💚 Mental Health Support
- 🤝 Community Matching
- 💼 Gig Economy Marketplace
- 🔍 Service Navigator
- 🚨 Emergency Alerts
- 🎓 Skills Exchange
- 🏪 Business Directory

## 📸 Screenshot Checklist

Capture these views:
- [ ] Landing page
- [ ] Agricultural dashboard with data
- [ ] Cultural story viewer
- [ ] Spirit avatar gallery
- [ ] Blockchain credential verification
- [ ] Chat interface
- [ ] Emergency alerts map
- [ ] Service navigator
- [ ] Gig board
- [ ] Mobile responsive view
- [ ] Voice interface demo
- [ ] Accessibility features

## 🐛 Quick Fixes

### MongoDB won't start:
```bash
docker stop rural-connect-demo
docker rm rural-connect-demo
docker run -d -p 27017:27017 --name rural-connect-demo mongo:latest
```

### Backend won't start:
```bash
# Check if port 3001 is free
netstat -ano | findstr :3001  # Windows
lsof -ti:3001                  # Mac/Linux

# Kill the process if needed
```

### Seed data failed:
```bash
# Clear database
mongo
use rural-connect-ai
db.dropDatabase()
exit

# Seed again
cd backend
npm run seed:demo
```

## 📝 Pre-Recording Checklist

- [ ] MongoDB running
- [ ] Backend running (check http://localhost:3001/health)
- [ ] Frontend running (check http://localhost:5173)
- [ ] Demo data seeded
- [ ] Test login works
- [ ] Browser in full screen
- [ ] Close unnecessary tabs
- [ ] Disable notifications
- [ ] Check audio/video quality
- [ ] Practice the flow

## 🎉 You're Ready!

Your platform is now loaded with realistic data that tells a compelling story about:
- Rural community connection
- Cultural preservation
- Digital inclusion
- Mental health support
- Economic opportunity

**Good luck with your hackathon presentation! 🚀**

---

## 📚 Additional Resources

- **Full Demo Script:** See `DEMO_SETUP_GUIDE.md`
- **Technical Docs:** See `BACKEND_FIXED_SUMMARY.md`
- **Quick Start:** See `QUICK_START_FULL_SITE.md`

## 💡 Tips for Judges

- Emphasize the **real-world impact** on rural communities
- Highlight **unique innovations** (spirit avatars, blockchain, voice)
- Show **accessibility features** (offline, voice, high contrast)
- Demonstrate **cultural sensitivity** in design
- Explain **scalability** and future vision

## 🌏 Impact Statement

Rural Connect AI bridges the digital divide by providing:
- **Connection** - Overcoming isolation through community
- **Preservation** - Protecting cultural heritage digitally
- **Empowerment** - Access to services and opportunities
- **Innovation** - Cutting-edge tech for rural communities
- **Inclusion** - Accessible to all, regardless of literacy or connectivity
