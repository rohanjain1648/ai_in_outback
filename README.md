# Rural Connect AI 🌏

> **Hackathon Submission**: An intelligent community platform designed specifically for regional and rural Australia, featuring voice-first accessibility, blockchain trust, and ethereal UI/UX.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://rural-connect-ai.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Built with Kiro](https://img.shields.io/badge/built%20with-Kiro-purple)](https://kiro.ai)

An intelligent community platform designed specifically for regional and rural Australia. The platform addresses critical challenges faced by rural communities including social isolation, limited access to services, economic opportunities, and emergency preparedness.

## 🎬 **HACKATHON JUDGES: Quick Demo Setup**

**Want to see the platform with realistic data? Run this one command:**

```bash
# Windows
.\setup-demo.ps1

# Mac/Linux
./setup-demo.sh
```

Then login with: **sarah@demo.com** / **demo123**

📖 **Full demo guide:** See [README_DEMO.md](README_DEMO.md) or [DEMO_PACKAGE_COMPLETE.md](DEMO_PACKAGE_COMPLETE.md)

## 🎯 Hackathon Features

### 🎤 Voice-First Interface
- **Web Speech API Integration**: Hands-free interaction for users while driving or working
- **Natural Language Processing**: Speak naturally to search, navigate, and post jobs
- **Text-to-Speech Feedback**: Audio responses for accessibility and convenience
- **Multi-language Support**: Including Aboriginal language terms

### 👻 Ethereal Notification System
- **Holographic Effects**: Stunning visual notifications with glow and particle effects
- **Contextual Sounds**: Web Audio API integration for immersive feedback
- **Spirit Avatars**: AI-generated personalized avatars using DALL-E
- **Haptic Feedback**: Mobile device vibration for important alerts

### 💼 Gig Economy Platform
- **AI-Powered Matching**: Smart job-to-worker matching based on skills and location
- **Micro-Job Board**: Post and find short-term work opportunities
- **Mutual Ratings**: Build trust through transparent reputation system
- **Real-time Updates**: Socket.io integration for instant job status changes

### 🔗 Blockchain Trust System
- **NFT Credentials**: Verifiable achievement badges on Polygon blockchain
- **Immutable Reputation**: Tamper-proof trust scores and verification
- **Offline Queue**: Transaction queuing for areas with poor connectivity
- **Public Verification**: Anyone can verify credentials via blockchain

### 🗺️ Service Navigator
- **Government API Integration**: Access to Australian health, transport, and government services
- **Voice Search**: Find services using natural language voice commands
- **Offline Cache**: Essential services available without internet
- **Low-Data Mode**: Optimized for rural connectivity challenges

### ✨ Spirit Trails Map
- **3D Visualization**: Three.js powered animated connections between users
- **Glowing Beacons**: Event markers with pulsing animations
- **AR Overlay**: WebXR support for augmented reality experience
- **Performance Optimized**: Dynamic LOD for smooth mobile experience

### 📊 Metrics Dashboard
- **Real-time Analytics**: Live platform usage and impact statistics
- **Geographic Distribution**: User density maps across rural regions
- **Impact Calculations**: Time saved, connections made, economic value
- **Demo Data**: Simulated realistic data for demonstration

## 🌟 Core Features

- 🤖 AI-powered community matching and networking
- 🌾 Agricultural intelligence and farm management support
- 🚨 Emergency preparedness and community safety
- 🏪 Local business and economic opportunity platform
- 📚 Cultural heritage and storytelling platform
- 🎓 Skills sharing and community learning
- 💚 Mental health and wellbeing support
- 🎨 Advanced UI/UX with Three.js integration
- 📱 Offline capability and connectivity resilience
- ♿ WCAG AAA accessibility compliance

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **3D Graphics**: Three.js + React Three Fiber
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Voice**: Web Speech API
- **Audio**: Web Audio API
- **AR**: WebXR Device API

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database**: MongoDB + Mongoose
- **Cache**: Redis
- **Search**: Elasticsearch
- **Real-time**: Socket.io
- **Blockchain**: ethers.js + Polygon

### External Services
- **AI**: OpenAI (DALL-E for avatars)
- **Government APIs**: data.gov.au, Health Direct
- **Blockchain**: Polygon Mumbai Testnet
- **Translation**: Google Translate API

### Testing & Quality
- **Testing**: Jest + React Testing Library
- **E2E**: Playwright
- **Code Quality**: ESLint + Prettier
- **Accessibility**: jest-axe

## 🚀 Quick Start

### Try the Live Demo

Visit **[rural-connect-ai.vercel.app](https://rural-connect-ai.vercel.app)** to experience the platform immediately.

**Demo Credentials:**
- Email: `demo@ruralconnect.au`
- Password: `demo2024`

### Local Development

#### Prerequisites

- Node.js (v18 or higher)
- MongoDB (or use Docker)
- Redis (optional, for caching)
- npm or yarn

#### Quick Setup (Frontend Only)

```bash
# Clone the repository
git clone https://github.com/yourusername/rural-connect-ai.git
cd rural-connect-ai

# Install dependencies
npm install

# Set up environment
cp .env.development .env

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

#### Full Stack Setup

```bash
# Install all dependencies
npm install
cd backend && npm install && cd ..

# Set up environment files
cp backend/.env.example backend/.env

# Start MongoDB and Redis (Docker)
docker-compose -f docker-compose.dev.yml up -d mongodb redis

# Start backend
cd backend && npm run dev

# In another terminal, start frontend
npm run dev
```

#### Using PowerShell Scripts (Windows)

```powershell
# Set up environment
.\setup-env.ps1

# Start frontend only
.\start-frontend-only.ps1

# Start full stack
.\start-local.ps1
```

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint

**Backend:**
- `cd backend && npm run dev` - Start backend server
- `cd backend && npm run build` - Build backend
- `cd backend && npm test` - Run backend tests

**Full Stack:**
- `npm run start:all` - Start both frontend and backend
- `npm run test:all` - Run all tests

## 📁 Project Structure

```
rural-connect-ai/
├── .kiro/                          # Kiro spec-driven development files
│   └── specs/
│       └── hackathon-enhancements/ # Feature specifications
│           ├── requirements.md     # EARS-compliant requirements
│           ├── design.md          # Comprehensive design document
│           └── tasks.md           # Implementation task list
├── src/                           # Frontend source code
│   ├── components/
│   │   ├── voice/                # Voice interface components
│   │   ├── notifications/        # Ethereal notification system
│   │   ├── gig/                  # Gig board components
│   │   ├── blockchain/           # Blockchain credential display
│   │   ├── services/             # Service navigator
│   │   ├── three/                # 3D graphics and spirit trails
│   │   ├── admin/                # Metrics dashboard
│   │   └── accessibility/        # Accessibility features
│   ├── services/                 # API services
│   ├── hooks/                    # Custom React hooks
│   ├── types/                    # TypeScript definitions
│   └── utils/                    # Utility functions
├── backend/                       # Backend source code
│   ├── src/
│   │   ├── models/               # MongoDB models
│   │   ├── services/             # Business logic
│   │   ├── routes/               # API endpoints
│   │   ├── middleware/           # Express middleware
│   │   └── validation/           # Input validation
│   └── scripts/                  # Database seeding scripts
├── __tests__/                     # Test files
└── docs/                          # Documentation
```

## 🎬 Demo Walkthrough

### 1. Voice Interface Demo
1. Click the microphone icon in the navigation bar
2. Say "Search for agricultural services"
3. Watch as the voice command is processed and results appear
4. Try other commands: "Go to gig board", "Show my profile"

### 2. Ethereal Notifications
1. Navigate to the Notifications demo page
2. Click "Trigger Notification" to see holographic effects
3. Notice the glowing animations and particle effects
4. Check the notification history panel

### 3. Gig Board
1. Go to the Gig Board section
2. Browse available micro-jobs with AI matching scores
3. Click "Post a Job" to create a new gig
4. Apply to a job and see real-time status updates

### 4. Blockchain Credentials
1. Visit your profile page
2. View earned NFT badges and credentials
3. Click "Verify on Blockchain" to see transaction details
4. Share credentials publicly via the verification link

### 5. Service Navigator
1. Open the Service Navigator
2. Use voice search: "Find health services near me"
3. View services with distance, ratings, and contact info
4. Toggle low-data mode for optimized experience

### 6. Spirit Trails Map
1. Navigate to the Interactive Map
2. See animated "spirit trails" connecting nearby users
3. Click on glowing event beacons
4. Try AR mode on supported devices

### 7. Metrics Dashboard
1. Access the Admin Dashboard
2. View real-time platform statistics
3. Explore geographic distribution maps
4. See impact calculations and engagement metrics

## 📚 Documentation

### Quick Start Guides
- **[Judges' Quick Reference](JUDGES_QUICK_REFERENCE.md)** - ⚡ 5-minute overview for judges
- **[Demo Walkthrough Guide](DEMO_WALKTHROUGH.md)** - Step-by-step feature demonstration
- **[Hackathon Submission Package](HACKATHON_SUBMISSION_PACKAGE.md)** - Complete submission materials

### Development & Deployment
- **[Kiro Development Process](KIRO_WRITEUP.md)** - Spec-driven development methodology
- **[Vercel Deployment Guide](VERCEL_DEPLOYMENT.md)** - Frontend deployment instructions
- **[Local Setup Guide](LOCAL_SETUP_GUIDE.md)** - Detailed local development setup
- **[API Documentation](backend/README.md)** - Backend API reference

### Submission Materials
- **[Demo Video Script](DEMO_VIDEO_SCRIPT.md)** - 3-minute demo video script
- **[Submission Checklist](SUBMISSION_CHECKLIST.md)** - Pre-submission verification

### Feature Documentation
- [Voice Interface Implementation](VOICE_INTERFACE_IMPLEMENTATION.md)
- [Ethereal Notifications](ETHEREAL_NOTIFICATIONS_IMPLEMENTATION.md)
- [Gig Board System](GIG_BOARD_IMPLEMENTATION.md)
- [Blockchain Trust System](BLOCKCHAIN_IMPLEMENTATION_SUMMARY.md)
- [Service Navigator](SERVICE_NAVIGATOR_IMPLEMENTATION.md)
- [Spirit Trails](SPIRIT_TRAILS_IMPLEMENTATION.md)
- [Spirit Avatars](SPIRIT_AVATAR_IMPLEMENTATION.md)
- [Metrics Dashboard](METRICS_DASHBOARD_IMPLEMENTATION.md)
- [Accessibility Features](ACCESSIBILITY_IMPLEMENTATION.md)
- [Edge Case Handling](EDGE_CASE_HANDLING.md)

## 🎯 Hackathon Impact

### Problem Statement
Rural and regional Australians face unique challenges:
- **Social Isolation**: Limited community connections
- **Service Access**: Difficulty finding essential services
- **Economic Opportunity**: Limited job prospects
- **Digital Divide**: Poor connectivity and digital literacy barriers

### Our Solution
Rural Connect AI addresses these challenges through:
1. **Voice-First Design**: Accessible for users with limited literacy or hands-free needs
2. **Offline Capability**: Works in areas with poor connectivity
3. **AI-Powered Matching**: Connects people with opportunities and services
4. **Trust System**: Blockchain-verified credentials build community trust
5. **Immersive UX**: Engaging design encourages platform adoption

### Measurable Impact
- **Connections Made**: AI matching facilitates meaningful community connections
- **Jobs Created**: Gig board enables micro-employment opportunities
- **Services Accessed**: Navigator simplifies finding essential services
- **Time Saved**: Voice interface and smart search reduce friction
- **Trust Built**: Blockchain credentials create transparent reputation

## 🏗️ Built with Kiro

This project was developed using **Kiro's spec-driven development methodology**:

1. **Requirements Gathering**: EARS-compliant acceptance criteria
2. **Design Phase**: Comprehensive architecture and correctness properties
3. **Task Planning**: Incremental implementation with clear milestones
4. **Iterative Development**: Continuous refinement with user feedback

See [KIRO_WRITEUP.pdf](KIRO_WRITEUP.pdf) for detailed insights into our development process.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- voice

# Run E2E tests
npm run test:e2e
```

### Test Coverage
- Unit tests for all services and utilities
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for critical user flows
- Accessibility tests with jest-axe

## 🌐 Deployment

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Railway/Render (Backend)
```bash
# Connect your repository
# Set environment variables
# Deploy automatically on push
```

See [README-DEPLOYMENT.md](README-DEPLOYMENT.md) for comprehensive deployment instructions.

## 🔒 Security

- **Authentication**: JWT-based secure authentication
- **Input Validation**: Comprehensive validation and sanitization
- **Rate Limiting**: API endpoint protection
- **HTTPS**: SSL/TLS encryption for all traffic
- **CORS**: Configured for secure cross-origin requests
- **Security Headers**: HSTS, CSP, X-Frame-Options

## ♿ Accessibility

- **WCAG AAA Compliance**: Meets highest accessibility standards
- **Screen Reader Support**: Full ARIA labels and semantic HTML
- **Keyboard Navigation**: All features accessible without mouse
- **High Contrast Mode**: Enhanced visibility for visual impairments
- **Adjustable Text Size**: Customizable font sizes
- **Voice Interface**: Alternative input method for accessibility

## 🌍 Multi-Language Support

- **Translation API**: Google Translate integration
- **Aboriginal Languages**: Key terms in Indigenous languages
- **RTL Support**: Right-to-left language compatibility
- **Language Selector**: Easy language switching

## 📱 Mobile Optimization

- **Responsive Design**: Works on all screen sizes
- **Touch Optimized**: Large touch targets and gestures
- **Offline First**: Service workers for offline functionality
- **PWA**: Installable as a progressive web app
- **Performance**: Optimized for mobile networks

## 🤝 Development Guidelines

- Follow TypeScript strict mode
- Use Prettier for code formatting
- Write tests for components and utilities
- Follow the established folder structure
- Use semantic commit messages
- Document complex logic and APIs
- Ensure accessibility compliance

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests (`npm run lint && npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Kiro AI**: For the spec-driven development platform
- **Australian Government**: For open data APIs
- **Rural Communities**: For inspiring this solution
- **Open Source Community**: For the amazing tools and libraries

## 📞 Contact & Support

- **Live Demo**: [rural-connect-ai.vercel.app](https://rural-connect-ai.vercel.app)
- **GitHub**: [github.com/yourusername/rural-connect-ai](https://github.com/yourusername/rural-connect-ai)
- **Issues**: [GitHub Issues](https://github.com/yourusername/rural-connect-ai/issues)
- **Email**: support@ruralconnect.au

## 🎥 Demo Video

Watch our 3-minute demo video: [YouTube Link](https://youtube.com/watch?v=demo-video-id)

---

**Built with ❤️ for Rural Australia** | **Powered by Kiro AI** | **Hackathon 2024**