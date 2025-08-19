import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './assets/components/Login';
import Register from './assets/components/Register';
import Dashboard from './assets/components/Dashboard';
import Admin from './assets/components/Admin';
import Courses from './assets/components/Courses';
import Profile from './assets/components/Profile';
import Referrals from './assets/components/Referrals';
import Settings from './assets/components/Settings';

import './App.css';
import AdminLogin from './assets/components/Admin-login';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;