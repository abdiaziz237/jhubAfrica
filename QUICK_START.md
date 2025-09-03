# 🚀 JHUB Website - Quick Start Guide

## ⚡ **Get Running in 5 Minutes**

### **1. Environment Setup**
```bash
# Copy environment template
cp server/env.example server/.env

# Edit .env file with your values
nano server/.env
```

**Required changes in .env:**
- `JWT_SECRET` - Change to a secure random string
- `MONGO_URI` - Your MongoDB connection string
- `NODE_ENV` - Set to 'production' for production

### **2. Install Dependencies**
```bash
# Install all dependencies
npm run install:all

# Or install separately:
cd client && npm install
cd ../server && npm install
```

### **3. Database Setup**
```bash
cd server

# Setup database with sample data
npm run db:setup

# Create admin user
npm run db:admin

# Add sample courses
npm run db:courses
```

### **4. Start the Application**
```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Start frontend (development)
cd client
npm start

# Or build for production:
npm run build:prod
```

## 🔧 **Production Deployment**

### **Server Deployment**
```bash
cd server

# Install production dependencies only
npm install --production

# Start production server
npm start

# Or use PM2 for process management:
npm install -g pm2
pm2 start server.js --name "jhub-server"
pm2 startup
pm2 save
```

### **Frontend Build**
```bash
cd client

# Build for production
npm run build:prod

# The build folder will be served by the Express server
```

## 🌐 **Access Your Website**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Admin Dashboard**: http://localhost:3000/admin/login
- **Health Check**: http://localhost:5001/api/health

## 🔑 **Default Admin Access**

After running `npm run db:admin`:
- **Email**: admin@jhub.com
- **Password**: admin123

**⚠️ IMPORTANT**: Change these credentials immediately in production!

## 🚨 **Critical Security Steps**

1. **Change JWT Secret** in .env file
2. **Change Admin Password** after first login
3. **Restrict Database Access** to your server IP only
4. **Enable HTTPS** in production
5. **Set up Firewall** rules

## 📊 **Verify Everything Works**

### **Test Admin Functions**
- [ ] Login to admin dashboard
- [ ] Create a new user
- [ ] Add a new course
- [ ] Check system status
- [ ] View analytics

### **Test User Functions**
- [ ] User registration
- [ ] User login
- [ ] Course browsing
- [ ] Interest registration
- [ ] Waitlist joining

## 🆘 **Troubleshooting**

### **Common Issues**

**Database Connection Failed**
```bash
# Check MongoDB connection
curl http://localhost:5001/api/test-db
```

**Admin Routes Not Working**
```bash
# Check if admin routes are mounted
curl http://localhost:5001/api/v1/admin/stats
```

**Frontend Build Issues**
```bash
# Clear build cache
cd client
rm -rf build
npm run build:prod
```

### **Logs & Debugging**
```bash
# Check server logs
cd server
tail -f logs/app.log

# Check MongoDB connection
cd server
npm run db:health
```

## 📱 **Mobile Testing**

Test on these devices:
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)
- Desktop (Chrome, Firefox, Safari, Edge)

## 🚀 **Ready to Launch!**

Your JHUB website is now ready for production deployment. Follow the production checklist in `PRODUCTION_READINESS.md` for a complete deployment guide.

---

**Need Help?** Check the logs or refer to the comprehensive production guide.
