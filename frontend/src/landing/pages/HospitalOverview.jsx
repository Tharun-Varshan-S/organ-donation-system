import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Bed, Building2, Truck, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import Card from '../components/Card';
import Button from '../components/Button';
import { getHospitalImage } from '../utils/mockImages';
import apiService from '../../services/api';
import './HospitalOverview.css';

const HospitalOverview = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getHospitalById(hospitalId);
        
        // Only show approved hospitals
        if (data.hospital && data.hospital.status === 'approved') {
          setHospital(data.hospital);
        } else {
          setError('Hospital not found or not approved');
        }
      } catch (err) {
        setError(err.message || 'Failed to load hospital details');
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, [hospitalId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#D4E8E8] via-[#A2BFC6] to-[#798E93]">
        <AnimatedBackground />
        <Navbar user={user} onLogout={logout} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 flex items-center justify-center">
          <Card className="text-center py-12">
            <p className="text-[#556B73] text-lg">Loading hospital details...</p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#D4E8E8] via-[#A2BFC6] to-[#798E93]">
        <AnimatedBackground />
        <Navbar user={user} onLogout={logout} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
          <Card className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-[#556B73] text-lg mb-6">{error || 'Hospital not found'}</p>
            <Button variant="primary" onClick={() => navigate('/hospitals')}>
              Back to Hospitals
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const image = getHospitalImage(hospital);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D4E8E8] via-[#A2BFC6] to-[#798E93]">
      <AnimatedBackground />
      <Navbar user={user} onLogout={logout} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/hospitals')}
          className="flex items-center gap-2 text-[#2C3E44] hover:text-red-600 transition mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Hospitals
        </button>

        {/* Hero Banner */}
        <div className="hospital-hero">
          <img src={image} alt={hospital.name} className="hero-image" />
          <div className="hero-overlay">
            <div className="hero-content">
              <h1 className="hero-title">{hospital.name}</h1>
              <div className="hero-badges">
                {hospital.contactInfo?.emergencyPhone && (
                  <span className="badge-emergency">🚨 Emergency Services</span>
                )}
                <span className="badge-approved">✓ Approved Hospital</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card className="hospital-card-section">
              <h2 className="section-title">About Hospital</h2>
              <p className="section-text">
                {hospital.name} is a leading medical institution dedicated to providing exceptional healthcare services and organ transplant support.
              </p>
            </Card>

            {/* Specializations Section */}
            <Card className="hospital-card-section">
              <h2 className="section-title">Specializations & Services</h2>
              <div className="specializations-grid">
                {hospital.specializations && hospital.specializations.length > 0 ? (
                  hospital.specializations.map((spec, index) => (
                    <div key={index} className="specialization-tag">
                      <span className="spec-icon">💼</span>
                      <span>{spec}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[#798E93]">No specializations listed</p>
                )}
              </div>
            </Card>

            {/* Infrastructure Section */}
            <Card className="hospital-card-section">
              <h2 className="section-title">Infrastructure & Capacity</h2>
              <div className="infrastructure-grid">
                <div className="infra-item">
                  <Bed className="infra-icon" />
                  <div>
                    <div className="infra-label">Total Beds</div>
                    <div className="infra-value">{hospital.capacity?.totalBeds || 0}</div>
                  </div>
                </div>
                <div className="infra-item">
                  <Building2 className="infra-icon" />
                  <div>
                    <div className="infra-label">Available Beds</div>
                    <div className="infra-value">{hospital.capacity?.availableBeds || 0}</div>
                  </div>
                </div>
                <div className="infra-item">
                  <Truck className="infra-icon" />
                  <div>
                    <div className="infra-label">Ambulances</div>
                    <div className="infra-value">Available</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Contact & Actions */}
          <div className="space-y-6">
            {/* Contact Info Card */}
            <Card className="hospital-card-section">
              <h2 className="section-title">Contact Information</h2>
              <div className="space-y-4">
                {/* Location */}
                <div className="contact-item">
                  <MapPin className="contact-icon" />
                  <div>
                    <div className="contact-label">Location</div>
                    <p className="contact-value">
                      {hospital.location?.address && `${hospital.location.address}, `}
                      {hospital.location?.city}, {hospital.location?.state} {hospital.location?.zipCode}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                {hospital.contactInfo?.phone && (
                  <div className="contact-item">
                    <Phone className="contact-icon" />
                    <div>
                      <div className="contact-label">Phone</div>
                      <a href={`tel:${hospital.contactInfo.phone}`} className="contact-value hover-link">
                        {hospital.contactInfo.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Emergency Phone */}
                {hospital.contactInfo?.emergencyPhone && (
                  <div className="contact-item emergency">
                    <AlertCircle className="contact-icon text-red-600" />
                    <div>
                      <div className="contact-label text-red-600">Emergency Hotline</div>
                      <a href={`tel:${hospital.contactInfo.emergencyPhone}`} className="contact-value text-red-600 hover-link">
                        {hospital.contactInfo.emergencyPhone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {hospital.email && (
                  <div className="contact-item">
                    <Mail className="contact-icon" />
                    <div>
                      <div className="contact-label">Email</div>
                      <a href={`mailto:${hospital.email}`} className="contact-value hover-link">
                        {hospital.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions Card */}
            <Card className="hospital-card-section">
              <h2 className="section-title">Actions</h2>
              <div className="space-y-3">
                {user?.role === 'admin' && (
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/admin/hospitals/${hospitalId}/manage`)}
                    className="w-full"
                  >
                    Manage Hospital
                  </Button>
                )}
                {user?.role === 'hospital' && user?.hospitalId === hospital._id && (
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/hospital/dashboard`)}
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => navigate('/hospitals')}
                  className="w-full"
                >
                  View All Hospitals
                </Button>
              </div>
            </Card>

            {/* Status Badge */}
            <div className="status-info">
              <div className="status-badge approved">
                <span className="status-dot"></span>
                <span>Approved Hospital</span>
              </div>
              {hospital.approvedAt && (
                <p className="text-xs text-[#798E93] mt-2">
                  Approved on {new Date(hospital.approvedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HospitalOverview;
