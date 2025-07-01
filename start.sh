#!/bin/bash

# Start script for server
# Starts the care-app containers

echo "🚀 Starting Care App containers..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start containers
echo "🔨 Starting containers..."
docker-compose up -d

# Wait for containers to start
echo "⏳ Waiting for containers to start..."
sleep 10

# Check container status
echo "📊 Container status:"
docker-compose ps

# Check if services are responding
echo "🔍 Checking service health..."

# Check backend
if curl -f http://localhost:3003/health > /dev/null 2>&1; then
    echo "✅ Backend is running on port 3003"
else
    echo "❌ Backend is not responding"
fi

# Check frontend
if curl -f http://localhost:3004 > /dev/null 2>&1; then
    echo "✅ Frontend is running on port 3004"
else
    echo "❌ Frontend is not responding"
fi

echo "🎉 Care App is ready!"
echo "🌐 Frontend: http://localhost:3004"
echo "🔧 Backend: http://localhost:3003"
