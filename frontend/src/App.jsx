import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './landing/contexts/AuthContext';
import Home from './landing/pages/Home';
import Mission from './landing/pages/Mission';
import About from './landing/pages/About';
import Contact from './landing/pages/Contact';
import AuthPage from './components/AuthPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen">
          <Routes>
            {/* Landing Page Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Authenticated Portal Routes */}
            <Route path="/login" element={<AuthPage />} />

            {/* Catch-all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;