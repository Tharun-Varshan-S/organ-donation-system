import React, { useState, useEffect } from 'react';
import {
    X, MapPin, Calendar, Shield, Award, Activity, Star,
    TrendingUp, Users, Heart, CheckCircle, Clock, AlertCircle,
    Phone, Mail, Building2, Stethoscope
} from 'lucide-react';
import './HospitalDetailView.css';

const HospitalDetailView = ({ hospitalId, onClose }) => {
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('overview');

    useEffect(() => {
        if (hospitalId) {
            fetchHospitalDetails();
        }
    }, [hospitalId]);

    const fetchHospitalDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/hospitals/${hospitalId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch hospital details');

            const data = await response.json();
            setHospital(data.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="hospital-detail-overlay">
                <div className="hospital-detail-modal">
                    <div className="loading-spinner">Loading hospital details...</div>
                </div>
            </div>
        );
    }

    if (error || !hospital) {
        return (
            <div className="hospital-detail-overlay">
                <div className="hospital-detail-modal">
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                    <div className="error-message">Error: {error || 'Hospital not found'}</div>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        const colors = {
            approved: '#10b981',
            pending: '#f59e0b',
            suspended: '#ef4444',
            rejected: '#6b7280'
        };
        return colors[status] || '#6b7280';
    };

    const getTimelineIcon = (type) => {
        const icons = {
            REGISTRATION: Building2,
            APPROVAL: CheckCircle,
            REQUEST: Heart,
            TRANSPLANT: Activity,
            SUSPEND: AlertCircle,
            UPDATE: Clock
        };
        return icons[type] || Clock;
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={16}
                fill={i < rating ? '#fbbf24' : 'none'}
                stroke={i < rating ? '#fbbf24' : '#d1d5db'}
            />
        ));
    };

    return (
        <div className="hospital-detail-overlay" onClick={onClose}>
            <div className="hospital-detail-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="detail-header">
                    <div className="header-content">
                        <div className="hospital-title">
                            <Building2 size={32} />
                            <div>
                                <h2>{hospital.name}</h2>
                                <p className="license-id">License: {hospital.licenseNumber}</p>
                            </div>
                        </div>
                        <div className="header-actions">
                            <span
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(hospital.status) }}
                            >
                                {hospital.status.toUpperCase()}
                            </span>
                            <button className="close-btn" onClick={onClose}>
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="detail-tabs">
                        {['overview', 'location', 'statistics', 'reviews', 'timeline'].map(tab => (
                            <button
                                key={tab}
                                className={`tab-btn ${activeSection === tab ? 'active' : ''}`}
                                onClick={() => setActiveSection(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Sections */}
                <div className="detail-content">
                    {/* SECTION A: OVERVIEW */}
                    {activeSection === 'overview' && (
                        <div className="section-overview">
                            <div className="info-grid">
                                <div className="info-card">
                                    <Mail size={20} />
                                    <div>
                                        <label>Email</label>
                                        <p>{hospital.email}</p>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <Phone size={20} />
                                    <div>
                                        <label>Phone</label>
                                        <p>{hospital.contactInfo?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <Calendar size={20} />
                                    <div>
                                        <label>Joined</label>
                                        <p>{new Date(hospital.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <Shield size={20} />
                                    <div>
                                        <label>Approved By</label>
                                        <p>{hospital.approvedBy?.name || 'Pending'}</p>
                                    </div>
                                </div>
                            </div>

                            {hospital.specializations && hospital.specializations.length > 0 && (
                                <div className="specializations-section">
                                    <h3><Stethoscope size={20} /> Specializations</h3>
                                    <div className="specialization-tags">
                                        {hospital.specializations.map((spec, idx) => (
                                            <span key={idx} className="spec-tag">{spec}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {hospital.approvedAt && (
                                <div className="approval-history">
                                    <h3>Approval History</h3>
                                    <div className="approval-info">
                                        <CheckCircle size={20} color="#10b981" />
                                        <div>
                                            <p>Approved by <strong>{hospital.approvedBy?.name}</strong></p>
                                            <p className="timestamp">{new Date(hospital.approvedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION B: LOCATION */}
                    {activeSection === 'location' && (
                        <div className="section-location">
                            <div className="location-info">
                                <MapPin size={24} />
                                <div>
                                    <h3>Address</h3>
                                    <p>{hospital.location?.address || 'N/A'}</p>
                                    <p>{hospital.location?.city}, {hospital.location?.state} {hospital.location?.zipCode}</p>
                                    {hospital.location?.region && (
                                        <span className="region-badge">{hospital.location.region}</span>
                                    )}
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            {(hospital.location?.latitude && hospital.location?.longitude) ? (
                                <div className="map-container">
                                    <iframe
                                        title="Hospital Location"
                                        width="100%"
                                        height="400"
                                        frameBorder="0"
                                        style={{ border: 0, borderRadius: '12px' }}
                                        src={`https://www.google.com/maps?q=${hospital.location.latitude},${hospital.location.longitude}&output=embed`}
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <div className="map-placeholder">
                                    <MapPin size={48} />
                                    <p>Location coordinates not available</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION C: STATISTICS */}
                    {activeSection === 'statistics' && (
                        <div className="section-statistics">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <Users size={32} />
                                    <div>
                                        <h4>{hospital.stats?.donorCount || 0}</h4>
                                        <p>Donors Managed</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <Heart size={32} />
                                    <div>
                                        <h4>{hospital.stats?.requestCount || 0}</h4>
                                        <p>Organ Requests</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <Activity size={32} />
                                    <div>
                                        <h4>{hospital.stats?.transplants?.successful || 0}</h4>
                                        <p>Successful Transplants</p>
                                    </div>
                                </div>
                                <div className="stat-card success-rate">
                                    <TrendingUp size={32} />
                                    <div>
                                        <h4>{hospital.stats?.successRate || 0}%</h4>
                                        <p>Success Rate</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION D: REVIEWS */}
                    {activeSection === 'reviews' && (
                        <div className="section-reviews">
                            {hospital.reviewStats && hospital.reviewStats.totalReviews > 0 ? (
                                <>
                                    <div className="reviews-summary">
                                        <div className="average-rating">
                                            <h2>{hospital.reviewStats.averageRating}</h2>
                                            <div className="stars">
                                                {renderStars(Math.round(hospital.reviewStats.averageRating))}
                                            </div>
                                            <p>{hospital.reviewStats.totalReviews} reviews</p>
                                            <p className="verified-count">
                                                <CheckCircle size={16} /> {hospital.reviewStats.verifiedCount} verified
                                            </p>
                                        </div>
                                    </div>

                                    <div className="reviews-list">
                                        {hospital.reviewStats.recentReviews.map((review, idx) => (
                                            <div key={idx} className="review-card">
                                                <div className="review-header">
                                                    <div className="stars">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                    {review.verified && (
                                                        <span className="verified-badge">
                                                            <CheckCircle size={14} /> Verified
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="review-comment">{review.comment}</p>
                                                <p className="review-date">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="no-reviews">
                                    <Star size={48} />
                                    <p>No reviews yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION E: ACTIVITY TIMELINE */}
                    {activeSection === 'timeline' && (
                        <div className="section-timeline">
                            {hospital.timeline && hospital.timeline.length > 0 ? (
                                <div className="timeline-list">
                                    {hospital.timeline.map((event, idx) => {
                                        const Icon = getTimelineIcon(event.type);
                                        return (
                                            <div key={idx} className="timeline-item">
                                                <div className="timeline-icon" style={{
                                                    backgroundColor: event.status === 'success' ? '#10b981' :
                                                        event.status === 'error' ? '#ef4444' :
                                                            event.status === 'warning' ? '#f59e0b' : '#6b7280'
                                                }}>
                                                    <Icon size={20} />
                                                </div>
                                                <div className="timeline-content">
                                                    <div className="timeline-header">
                                                        <span className="event-type">{event.type}</span>
                                                        <span className="event-time">
                                                            {new Date(event.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="event-description">{event.description}</p>
                                                    {event.performedBy && (
                                                        <p className="event-performer">By: {event.performedBy}</p>
                                                    )}
                                                    {event.urgency && (
                                                        <span className={`urgency-badge ${event.urgency}`}>
                                                            {event.urgency}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="no-timeline">
                                    <Clock size={48} />
                                    <p>No activity recorded</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HospitalDetailView;
