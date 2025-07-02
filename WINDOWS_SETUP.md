# 🪟 Windows Setup Guide

This guide will help you set up the Care Coordination System on Windows 11.

## 📋 What You Need

- Windows 10/11 (64-bit)
- Internet connection
- About 30 minutes

## 🚀 Step-by-Step Setup

### Step 1: Install Docker Desktop

1. **Download Docker Desktop**
   - Go to: https://www.docker.com/products/docker-desktop
   - Click "Download for Windows"
   - Save the installer file

2. **Install Docker Desktop**
   - Double-click the downloaded installer
   - Follow the installation wizard
   - **Important**: When asked, make sure "Use WSL 2 instead of Hyper-V" is checked
   - Restart your computer when prompted

3. **Start Docker Desktop**
   - Look for Docker Desktop in your Start menu
   - Launch it and wait for it to start
   - You'll see a whale icon in your system tray when it's ready
   - The first startup can take 2-3 minutes

### Step 2: Download the Care Coordination System

**Option A: Download ZIP (Easier)**
1. Go to the GitHub repository
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to `C:\care-coordination` (or anywhere you like)

**Option B: Use Git (If you have it)**
```bash
git clone <repository-url>
cd care-coordination-system
```

### Step 3: Run the Setup

1. **Open the project folder**
   - Navigate to where you extracted/cloned the project
   - You should see files like `setup-windows.bat`

2. **Run the setup**
   - Double-click `setup-windows.bat`
   - The first time will take 5-10 minutes as it downloads everything
   - You'll see lots of text scrolling - this is normal!

3. **Wait for completion**
   - When you see "Setup Complete! 🎉", you're done!
   - Your web browser should automatically open to the system

### Step 4: Start Using the System

1. **Login**
   - Email: `admin@carecompany.com`
   - Password: `password123`

2. **Start adding workers and clients!**

## 🔧 Daily Usage

### Starting the System
- Double-click `start-windows.bat`
- Wait for it to start (usually 30 seconds)
- Your browser will open automatically

### Stopping the System
- Double-click `stop-windows.bat`
- Wait for confirmation that it's stopped

### Accessing the System
- Open your web browser
- Go to: http://localhost:3004
- Login with the credentials above

## 🆘 Troubleshooting

### "Docker is not installed or not running"
- Make sure Docker Desktop is installed
- Look for the whale icon in your system tray
- If you don't see it, start Docker Desktop from the Start menu

### "Failed to start the system"
- Check that ports 3003 and 3004 aren't being used by other programs
- Restart Docker Desktop
- Try running `setup-windows.bat` again

### "Can't access http://localhost:3004"
- Wait a bit longer - the system might still be starting
- Check that Docker containers are running:
  - Open Command Prompt
  - Type: `docker ps`
  - You should see 3 containers running

### Website loads but can't login
- The database might still be starting up
- Wait 2-3 minutes and try again
- If still not working, run `stop-windows.bat` then `start-windows.bat`

### General Issues
- Restart Docker Desktop
- Restart your computer
- Make sure you have a good internet connection
- Check Windows Defender isn't blocking Docker

## 💡 Tips

- **Keep Docker Desktop running** when you want to use the system
- **The first startup is slow** - subsequent starts are much faster
- **Bookmark http://localhost:3004** for easy access
- **Change the default password** after first login

## 🔄 Updates

When there's a new version:
1. Download the new files
2. Run `stop-windows.bat`
3. Replace the old files with new ones
4. Run `setup-windows.bat` again

## 🤝 Need Help?

- **Create a GitHub Issue** if something doesn't work
- **Include error messages** and what you were trying to do
- **Mention you're on Windows** so we can help better

---

**You've got this! The setup might seem complex, but it's just a one-time thing. Once it's running, it's super easy to use!** 💪
