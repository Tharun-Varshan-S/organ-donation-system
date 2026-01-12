import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Bed, Building2, Truck, AlertCircle, ArrowLeft, Check, X, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { getHospitalImage } from '../utils/mockImages';
import apiService from '../../services/api';
import './HospitalOverview.css'; // Reuse styles

const HospitalRequestDetails = () => {
    const { hospitalId } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchHospital = async () => {
            try {
                setLoading(true);
                setError(null);
                // Use ADMIN endpoint to get details (works for pending too)
                const data = await apiService.getAdminHospitalDetails(hospitalId);
                if (data.data) {
                    setHospital(data.data);
                } else {
                    setError('Hospital not found');
                }
            } catch (err) {
                setError(err.message || 'Failed to load hospital details');
            } finally {
                setLoading(false);
            }
        };

        fetchHospital();
    }, [hospitalId]);

    const handleApprove = async () => {
        if (!window.confirm('Are you sure you want to APPROVE this hospital? They will become visible in the system.')) return;

        try {
            setIsProcessing(true);
            await apiService.approveHospital(hospitalId);
            // Navigate back to admin dashboard
            navigate('/'); // Assuming root or back to where we came from, but improved logic in dashboard handles routing
            // Actually we should navigate to Admin Dashboard Requests page
            // But AdminDashboard isn't a route, it's rendered by AuthPage or we might direct to login?
            // Since we are likely in an admin context...
            // For now, let's navigate to /login which renders AdminDashboard if logged in, ensuring refresh
            window.location.href = '/login';
        } catch (err) {
            alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }

        try {
            setIsProcessing(true);
            await apiService.rejectHospital(hospitalId, rejectionReason);
            setIsRejectModalOpen(false);
            window.location.href = '/login';
        } catch (err) {
            alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#D4E8E8] via-[#A2BFC6] to-[#798E93]">
                <AnimatedBackground />
                <Navbar user={user} onLogout={logout} />
                <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 flex items-center justify-center">
                    <Card className="text-center py-12">
                        <p className="text-[#556B73] text-lg">Loading request details...</p>
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
                        <p className="text-[#556B73] text-lg mb-6">{error || 'Request not found'}</p>
                        <Button variant="primary" onClick={() => navigate('/')}>
                            Back to Dashboard
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
                    onClick={() => navigate('/')} // Back to Admin Dashboard
                    className="flex items-center gap-2 text-[#2C3E44] hover:text-red-600 transition mb-6 font-medium"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>

                {/* Hero Banner with PENDING Status */}
                <div className="hospital-hero">
                    <img src={image} alt={hospital.name} className="hero-image" />
                    <div className="hero-overlay">
                        <div className="hero-content">
                            <div className="flex items-center gap-4 mb-2">
                                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full font-bold text-sm uppercase tracking-wide">
                                    {hospital.status} Request
                                </span>
                                <span className="text-white/80 text-sm">
                                    Submitted: {new Date(hospital.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="hero-title">{hospital.name}</h1>
                            <div className="hero-badges">
                                <span className="badge-emergency">License: {hospital.licenseNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8 mt-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Admin Decision Section - High Priority */}
                        <Card className="hospital-card-section border-l-4 border-yellow-500">
                            <h2 className="section-title flex items-center gap-2">
                                <FileText className="text-yellow-600" />
                                Registration Request
                            </h2>
                            <p className="text-[#556B73] mb-6">
                                This hospital has requested to join the Organ Donation System.
                                Please review their details below and take action.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleApprove}
                                    disabled={isProcessing}
                                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Check size={20} />
                                    Approve Request
                                </button>
                                <button
                                    onClick={() => setIsRejectModalOpen(true)}
                                    disabled={isProcessing}
                                    className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <X size={20} />
                                    Reject Request
                                </button>
                            </div>
                        </Card>

                        {/* Specializations Section */}
                        <Card className="hospital-card-section">
                            <h2 className="section-title">Requested Specializations</h2>
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

                    {/* Right Column - Contact & Details */}
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

                        {/* Profile Info */}
                        <Card className="hospital-card-section">
                            <h2 className="section-title">Admin Metadata</h2>
                            <div className="space-y-2 text-sm text-[#556B73]">
                                <p><strong>DB ID:</strong> {hospital._id}</p>
                                <p><strong>Created:</strong> {new Date(hospital.createdAt).toLocaleString()}</p>
                                <p><strong>License:</strong> {hospital.licenseNumber}</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {isRejectModalOpen && (
                <Modal isOpen={true} onClose={() => setIsRejectModalOpen(false)} title="Reject Hospital Request" size="md">
                    <div className="space-y-4">
                        <p className="text-[#556B73]">
                            Are you sure you want to reject this hospital? They will be hidden from the system.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-[#2C3E44] mb-1">Reason for Rejection *</label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full h-32 p-3 border border-[#798E93]/30 rounded-lg focus:outline-none focus:border-red-600 bg-white/50"
                                placeholder="Enter rejection reason..."
                                required
                            />
                        </div>

                        <div className="flex space-x-4 mt-6">
                            <Button
                                variant="primary"
                                onClick={handleReject}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                disabled={!rejectionReason.trim() || isProcessing}
                            >
                                {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setIsRejectModalOpen(false)}
                                className="flex-1"
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            <Footer />
        </div>
    );
};

export default HospitalRequestDetails;
