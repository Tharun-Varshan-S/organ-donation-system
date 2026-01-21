import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './landing/contexts/AuthContext';
import Home from './landing/pages/Home';
import Mission from './landing/pages/Mission';
import About from './landing/pages/About';
import Contact from './landing/pages/Contact';
import AuthPage from './components/AuthPage';
import HospitalDashboard from './landing/pages/HospitalDashboard';
import HospitalOverview from './landing/pages/HospitalOverview';
import HospitalRequestDetails from './landing/pages/HospitalRequestDetails';
<<<<<<< HEAD
import HospitalDetailedList from './pages/HospitalList'; // Alias logic if needed
import HospitalDetailPage from './pages/HospitalDetailPage';
import './App.css';

// Internal Hospital Portal Components
import HospitalLayout from './components/HospitalLayout';
import PendingApproval from './pages/hospital/PendingApproval';
import HospitalInternalDashboard from './pages/hospital/Dashboard';
import HospitalDonors from './pages/hospital/Donors';
import HospitalRequests from './pages/hospital/Requests';
import HospitalTransplants from './pages/hospital/Transplants';
import HospitalProfile from './pages/hospital/Profile';

=======
import HospitalList from './pages/HospitalList';
import HospitalDetailPage from './pages/HospitalDetailPage';
import './App.css';

>>>>>>> ec10091 (Implemented Admin Dashboard UI enhancements)
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

<<<<<<< HEAD
            {/* Hospital Dashboard Routes (Public/Admin View) */}
=======
            {/* Hospital Dashboard Routes */}
>>>>>>> ec10091 (Implemented Admin Dashboard UI enhancements)
            <Route path="/hospitals" element={<HospitalDashboard />} />
            <Route path="/hospitals/:hospitalId" element={<HospitalOverview />} />

            {/* Admin Routes */}
            <Route path="/admin/hospitals/:id" element={<HospitalDetailPage />} />
            <Route path="/admin/hospital-requests/:hospitalId" element={<HospitalRequestDetails />} />

            {/* Legacy Hospital List Route (can be deprecated) */}
<<<<<<< HEAD
            <Route path="/hospital-list" element={<HospitalDetailedList />} />

            {/* INTERNAL HOSPITAL PORTAL */}
            <Route path="/hospital/pending-approval" element={<PendingApproval />} />

            <Route path="/hospital" element={<HospitalLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<HospitalInternalDashboard />} />
              <Route path="donors" element={<HospitalDonors />} />
              <Route path="requests" element={<HospitalRequests />} />
              <Route path="transplants" element={<HospitalTransplants />} />
              <Route path="profile" element={<HospitalProfile />} />
            </Route>
=======
            <Route path="/hospital-list" element={<HospitalList />} />
>>>>>>> ec10091 (Implemented Admin Dashboard UI enhancements)

            {/* Catch-all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;