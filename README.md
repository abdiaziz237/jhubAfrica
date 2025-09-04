# JHUB Learning Platform

A learning management system built with React and Node.js.

## Setup

1. Install dependencies:
```bash
npm install
cd client && npm install
cd ../server && npm install
```

2. Set up environment variables:
```bash
cp server/env.example server/.env
# Edit server/.env with your values
```

3. Start the application:
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
cd client
npm start
```

## Features

- User registration and login
- Course management
- Admin dashboard
- User profiles

## Tech Stack

- React
- Node.js
- Express
- MongoDB
- JWT authentication

## Notes

- Still working on some features
- Database setup needs to be done manually
- Some bugs in the admin panel