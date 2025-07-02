#!/bin/bash

# Deploy script for local machine
# Transfers files to server and rebuilds containers

SERVER="jay@192.168.0.103"
SERVER_PATH="/home/jay/care-app"

echo "🚀 Starting deployment to $SERVER..."
echo "📦 You'll be prompted for the password (aes) for each step..."

# Transfer all files (excluding problematic directories)
echo "📦 Transferring all files..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude 'build' \
  --exclude '.cache' \
  --exclude '.env' \
  --exclude '*.log' \
  --exclude '.DS_Store' \
  --exclude '.vscode' \
  --exclude '.idea' \
  -e "ssh -o StrictHostKeyChecking=no" \
  . "$SERVER:$SERVER_PATH/"

# Make start script executable and run it on server
echo "🚀 Starting application on server..."
ssh -o StrictHostKeyChecking=no "$SERVER" "cd $SERVER_PATH && chmod +x start.sh && echo 'aes' | sudo -S ./start.sh"

echo "🎉 Deployment complete!"
echo "🌐 Frontend: http://192.168.0.103:3004"
echo "🔧 Backend: http://192.168.0.103:3003"
