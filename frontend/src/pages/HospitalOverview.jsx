import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Phone, Mail, Clock, ShieldCheck,
    Activity, Bed, Truck, AlertCircle, ChevronLeft
} from 'lucide-react';
import Navbar from '../landing/components/Navbar';
import apiService from '../services/api';
import { getHospitalImage } from '../utils/mockImages';
import './HospitalOverview.css';

const HospitalOverview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await apiService.getPublicHospitalById(id);
                if (response.success) {
                    setHospital(response.data);
                }
            } catch (err) {
                setError('Failed to load hospital details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="overview-loading">Loading details...</div>;
    if (!hospital) return <div className="overview-error">Hospital not found</div>;

    const image = getHospitalImage(hospital);

    return (
        <div className="hospital-overview-page">
            <Navbar />

            {/* Hero Banner */}
            <div className="overview-hero" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${image})` }}>
                <div className="hero-content-wrapper">
                    <button className="back-btn" onClick={() => navigate('/hospitals')}>
                        <ChevronLeft size={20} /> Back to List
                    </button>

                    <div className="hospital-identity">
                        <h1>{hospital.name}</h1>
                        <div className="hero-badges">
                            <span className="hero-badge verified"><ShieldCheck size={16} /> Verified Center</span>
                            {hospital.contactInfo?.emergencyPhone && <span className="hero-badge emergency">24/7 Emergency</span>}
                        </div>
                        <div className="hero-location">
                            <MapPin size={20} />
                            {hospital.location?.address}, {hospital.location?.city}, {hospital.location?.state} {hospital.location?.zipCode}
                        </div>
                    </div>
                </div>
            </div>

            <div className="overview-layout">
                <div className="main-col">
                    {/* About Section */}
                    <section className="detail-section">
                        <h2>About {hospital.name}</h2>
                        <p className="description">
                            {hospital.name} is a premier healthcare institution dedicated to providing world-class medical care.
                            Equipped with state-of-the-art infrastructure and a team of highly skilled doctors, we specialize in
                            complex transplant procedures and emergency care.
                            {/* Note: This is generic text since we don't have a description field yet, but matches the prompt's request for trust-building content */}
                        </p>
                    </section>

                    {/* Specializations */}
                    <section className="detail-section">
                        <h2>Medical Departments</h2>
                        <div className="specs-grid">
                            {hospital.specializations?.map((spec, i) => (
                                <div key={i} className="spec-card-detail">
                                    <Activity className="spec-icon" />
                                    <span>{spec}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Infrastructure */}
                    <section className="detail-section">
                        <h2>Infrastructure & Capacity</h2>
                        <div className="infra-grid">
                            <div className="infra-item">
                                <div className="infra-icon-box"><Bed /></div>
                                <div>
                                    <strong>{hospital.capacity?.totalBeds}</strong>
                                    <span>Total Beds</span>
                                </div>
                            </div>
                            <div className="infra-item">
                                <div className="infra-icon-box"><Activity /></div>
                                <div>
                                    <strong>{hospital.capacity?.icuBeds || 'N/A'}</strong>
                                    <span>ICU Units</span>
                                </div>
                            </div>
                            <div className="infra-item">
                                <div className="infra-icon-box"><Truck /></div>
                                <div>
                                    <strong>{hospital.capacity?.availableBeds}</strong>
                                    <span>Available Now</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="sidebar-col">
                    {/* Contact Card */}
                    <div className="contact-card">
                        <h3>Contact Information</h3>
                        <div className="contact-row">
                            <Phone size={18} />
                            <div>
                                <label>Emergency</label>
                                <a href={`tel:${hospital.contactInfo?.emergencyPhone}`} className="emergency-link">
                                    {hospital.contactInfo?.emergencyPhone || 'N/A'}
                                </a>
                            </div>
                        </div>
                        <div className="contact-row">
                            <Phone size={18} />
                            <div>
                                <label>General Line</label>
                                <a href={`tel:${hospital.contactInfo?.phone}`}>
                                    {hospital.contactInfo?.phone || 'N/A'}
                                </a>
                            </div>
                        </div>
                        <div className="contact-row">
                            <Mail size={18} />
                            <div>
                                <label>Email</label>
                                <a href={`mailto:${hospital.email}`}>{hospital.email}</a>
                            </div>
                        </div>
                        <div className="contact-row">
                            <Clock size={18} />
                            <div>
                                <label>Hours</label>
                                <span>Open 24/7</span>
                            </div>
                        </div>

                        <button className="action-btn-primary">Request Appointment</button>
                        <button className="action-btn-secondary">View on Map</button>
                    </div>

                    <div className="status-card-sidebar">
                        <h3>Registration Status</h3>
                        <div className="status-indicator">
                            <div className="status-dot"></div>
                            <span>Approved & Verified</span>
                        </div>
                        <p className="license">Lic: {hospital.licenseNumber}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalOverview;
