// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';  // Simple placeholder component
import Login from './Login';  // Login logic
// import Profile from './Profile';  // Profile logic
import Homew from './Hi';  // HelloWorld logic

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Routes>
            {}
            <Route path="/" element={<Navigate to="/login" />} /> 
            <Route path="/login" element={<Login />} /> 
            <Route path="/home" element={<Homew />} />
            <Route path="/app" element={<App />} />  
        </Routes>
    </BrowserRouter>
);
