#!/bin/bash

# Rural Connect AI - Demo Setup Script
# This script sets up everything you need for the hackathon demo

echo "🌾 Rural Connect AI - Demo Setup"
echo "================================="
echo ""

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if nc -z localhost 27017 2>/dev/null; then
    echo "✅ MongoDB is running"
    MONGO_RUNNING=true
else
    echo "⚠️  MongoDB not detected"
    MONGO_RUNNING=false
fi

if [ "$MONGO_RUNNING" = false ]; then
    echo ""
    echo "MongoDB is not running. Choose an option:"
    echo "1. Start MongoDB with Docker (recommended)"
    echo "2. I'll start MongoDB manually"
    echo "3. Skip MongoDB (frontend only)"
    read -p "Enter choice (1-3): " choice
    
    if [ "$choice" = "1" ]; then
        echo "🐳 Starting MongoDB with Docker..."
        docker run -d -p 27017:27017 --name rural-connect-demo mongo:latest
        sleep 5
        echo "✅ MongoDB started"
    elif [ "$choice" = "2" ]; then
        echo "⏸️  Please start MongoDB and press Enter to continue..."
        read
    else
        echo "⚠️  Skipping MongoDB - backend features won't work"
        SKIP_BACKEND=true
    fi
fi

if [ "$SKIP_BACKEND" != true ]; then
    # Seed demo data
    echo ""
    echo "🌱 Seeding demo data..."
    cd backend
    npm run seed:demo
    if [ $? -eq 0 ]; then
        echo "✅ Demo data seeded successfully"
    else
        echo "❌ Failed to seed demo data"
        echo "   You can try manually: cd backend && npm run seed:demo"
    fi
    cd ..
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start the backend:  cd backend && npm run dev"
echo "2. Start the frontend: npm run dev"
echo "3. Visit: http://localhost:5173"
echo ""
echo "🔑 Demo Login:"
echo "   Email: sarah@demo.com"
echo "   Password: demo123"
echo ""
echo "📖 See DEMO_SETUP_GUIDE.md for full demo script"
echo ""

# Ask if user wants to start services now
read -p "Start backend and frontend now? (y/n): " start_now
if [ "$start_now" = "y" ] || [ "$start_now" = "Y" ]; then
    echo ""
    echo "🚀 Starting services..."
    
    # Start backend in background
    cd backend
    npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait a bit for backend to start
    sleep 3
    
    # Start frontend in background
    npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    echo "✅ Services started"
    echo "   Backend PID: $BACKEND_PID (log: backend.log)"
    echo "   Frontend PID: $FRONTEND_PID (log: frontend.log)"
    echo "   Backend: http://localhost:3001"
    echo "   Frontend: http://localhost:5173"
    echo ""
    echo "To stop services:"
    echo "   kill $BACKEND_PID $FRONTEND_PID"
fi

echo ""
echo "Good luck with your demo! 🎬"
