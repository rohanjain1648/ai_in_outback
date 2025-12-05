# 🎬 Rural Connect AI - Hackathon Demo Package

## 🚀 Quick Start (Choose One)

### Option 1: Automated Setup (Recommended)
```powershell
# Windows
.\setup-demo.ps1

# Mac/Linux
./setup-demo.sh
```

### Option 2: Manual Setup
```bash
# 1. Start MongoDB
docker run -d -p 27017:27017 --name rural-connect-demo mongo:latest

# 2. Seed demo data
cd backend
npm run seed:demo

# 3. Start backend (Terminal 1)
npm run dev

# 4. Start frontend (Terminal 2 - from root)
npm run dev

# 5. Open browser
# Visit: http://localhost:5173
```

## 🔑 Demo Login

**Email:** sarah@demo.com  
**Password:** demo123

(All 5 demo users have password: demo123)

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **HACKATHON_DEMO_README.md** | Main demo guide |
| **DEMO_SETUP_GUIDE.md** | Detailed setup instructions |
| **DEMO_DATA_OVERVIEW.md** | Complete data inventory |
| **DEMO_QUICK_REFERENCE.md** | Quick reference during demo |
| **BACKEND_FIXED_SUMMARY.md** | Technical implementation details |

## 🎯 What's Included

### Demo Users (5)
- Sarah (Farmer) - Agricultural features
- Jack (Elder) - Cultural heritage
- Emma (Health Worker) - Wellbeing services
- Tom (Tech Helper) - Digital literacy
- Lisa (Business Owner) - Local economy

### Demo Data
- ✅ 2 farms with realistic data
- ✅ 2 local businesses
- ✅ 3 cultural stories
- ✅ 4 skills for exchange
- ✅ 3 gig job postings
- ✅ 2 service listings
- ✅ 3 blockchain credentials
- ✅ 3 AI spirit avatars
- ✅ 3 community resources
- ✅ 2 emergency alerts
- ✅ 2 wellbeing check-ins
- ✅ 2 chat rooms with messages

## 🌟 Key Features to Demo

### Unique Innovations
1. **Spirit Avatars** - AI-generated cultural identity
2. **Blockchain Credentials** - Verified skills/achievements
3. **Voice Interface** - Accessibility for all
4. **Offline-First** - Works without internet
5. **Cultural Preservation** - Digital storytelling

### Core Features
- 🚜 Agricultural Intelligence
- 💚 Mental Health Support
- 🤝 Community Matching
- 💼 Gig Economy
- 🔍 Service Navigator
- 🚨 Emergency Alerts
- 🎓 Skills Exchange
- 🏪 Business Directory

## ⏱️ 7-Minute Demo Flow

1. **Opening** (30s) - Problem & solution
2. **Agriculture** (1.5min) - Sarah's farm dashboard
3. **Culture** (1min) - Jack's stories & credentials
4. **Health** (1min) - Emma's wellbeing services
5. **Community** (1.5min) - Chat, alerts, services
6. **Innovation** (1min) - Voice, blockchain, avatars
7. **Closing** (30s) - Impact & vision

## 🐛 Troubleshooting

### MongoDB won't start
```bash
docker stop rural-connect-demo
docker rm rural-connect-demo
docker run -d -p 27017:27017 --name rural-connect-demo mongo:latest
```

### Backend won't start
```bash
# Check if port 3001 is free
netstat -ano | findstr :3001  # Windows
lsof -ti:3001                  # Mac/Linux
```

### Seed failed
```bash
# Clear and reseed
mongo
use rural-connect-ai
db.dropDatabase()
exit

cd backend
npm run seed:demo
```

## ✅ Pre-Recording Checklist

- [ ] MongoDB running
- [ ] Backend running (http://localhost:3001/health)
- [ ] Frontend running (http://localhost:5173)
- [ ] Demo data seeded
- [ ] Test login works
- [ ] Browser full screen
- [ ] Notifications disabled
- [ ] Audio/video ready
- [ ] Practice once

## 🎯 Judging Criteria

### Innovation (30%)
Focus on: Spirit avatars, blockchain, voice interface, offline-first

### Impact (30%)
Focus on: 7M rural Australians, cultural preservation, mental health

### Technical Excellence (20%)
Focus on: Full-stack, real-time, accessibility, scalability

### Presentation (20%)
Focus on: Clear story, compelling demo, time management

## 💡 Key Talking Points

**Problem:** "Rural Australians face isolation, limited services, and cultural loss."

**Solution:** "Rural Connect AI bridges the digital divide with AI-powered community connection."

**Innovation:** "Blockchain verification, AI avatars, voice interfaces, offline-first design."

**Impact:** "Empowering 7 million rural Australians with connection and opportunity."

## 📊 Quick Stats

- **Users:** 5 diverse profiles
- **Features:** 15+ major features
- **Data Points:** 50+ realistic entries
- **Technologies:** React, Node.js, MongoDB, Blockchain, AI
- **Accessibility:** Voice, offline, high contrast
- **Coverage:** All Australian states

## 🎉 You're Ready!

Your platform now has:
- ✅ Realistic, interconnected data
- ✅ All features populated
- ✅ Compelling user stories
- ✅ Professional presentation ready

**Good luck with your hackathon! 🚀**

---

## 📞 Support

If you encounter issues:
1. Check `DEMO_SETUP_GUIDE.md` for detailed troubleshooting
2. Review `BACKEND_FIXED_SUMMARY.md` for technical details
3. Use `DEMO_QUICK_REFERENCE.md` during your demo

## 🌟 Final Tips

- Practice your demo at least once
- Stay within the 7-minute time limit
- Show enthusiasm for rural communities
- Highlight unique innovations
- Tell a story, not just features
- Have fun and be confident!

**You've got this! 🎬**
