@echo off
set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
set MONGO_URI=mongodb+srv://jhubadmin:admin1234@cluster0.blbkroq.mongodb.net/jhub?retryWrites=true&w=majority&appName=Cluster0
set NODE_ENV=development
set PORT=5001
npm run dev
