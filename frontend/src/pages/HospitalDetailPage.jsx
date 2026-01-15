import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Phone, Mail, Calendar, Shield,
    Users, Heart, Activity, TrendingUp, Star, CheckCircle,
    Building2, Stethoscope, Clock
} from 'lucide-react';
import apiService from '../services/api';
import './HospitalDetailPage.css';

const SkeletonLoader = () => (
    <div className="tab-content">
        <div className="info-grid">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="info-card skeleton" style={{ height: '100px' }}></div>
            ))}
        </div>
        <div className="section">
            <div className="skeleton" style={{ height: '24px', width: '200px', marginBottom: '16px' }}></div>
            <div className="tags">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="skeleton" style={{ height: '36px', width: '100px', borderRadius: '20px' }}></div>
                ))}
            </div>
        </div>
        <div className="section">
            <div className="skeleton" style={{ height: '100px', borderRadius: '12px' }}></div>
        </div>
    </div>
);

const HospitalDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchHospitalDetails();
    }, [id]);

    const fetchHospitalDetails = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAdminHospitalDetails(id);
            setHospital(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            approved: '#10b981',
            pending: '#f59e0b',
            suspended: '#ef4444',
            rejected: '#6b7280'
        };
        return colors[status] || '#6b7280';
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

    if (error) {
        return (
            <div className="hospital-detail-page">
                <div className="error-container">
                    <p>Error: {error}</p>
                    <button onClick={() => navigate('/admin')} className="btn-back">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Default coordinates
    const mapLat = hospital?.location?.latitude || hospital?.location?.coordinates?.latitude || 34.0522;
    const mapLng = hospital?.location?.longitude || hospital?.location?.coordinates?.longitude || -118.2437;

    return (
        <div className="hospital-detail-page">
            {/* Header */}
            <div className="detail-header">
                <button onClick={() => navigate('/login', { state: { from: location.state?.from || 'hospitals' } })} className="btn-back">
                    <ArrowLeft size={20} />
                    Back
                </button>
                <div className="header-info">
                    <div className="title-section">
                        <Building2 size={32} className="hospital-icon" />
                        <div>
                            {loading ? (
                                <div className="skeleton" style={{ height: '32px', width: '300px' }}></div>
                            ) : (
                                <>
                                    <h1>{hospital?.name}</h1>
                                    <p className="license">License: {hospital?.licenseNumber}</p>
                                </>
                            )}
                        </div>
                    </div>
                    {!loading && (
                        <span
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(hospital?.status) }}
                        >
                            {hospital?.status?.toUpperCase()}
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
                {['overview', 'location', 'statistics', 'reviews', 'timeline'].map(tab => (
                    <button
                        key={tab}
                        className={`tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1).replace('location', 'Location & Map').replace('timeline', 'Activity Timeline')}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="detail-content">
                {loading ? (
                    <SkeletonLoader />
                ) : (
                    <>
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="tab-content">
                                <div className="info-grid">
                                    <div className="info-card">
                                        <Mail className="icon" />
                                        <div>
                                            <label>Email</label>
                                            <p>{hospital?.email}</p>
                                        </div>
                                    </div>
                                    <div className="info-card">
                                        <Phone className="icon" />
                                        <div>
                                            <label>Phone</label>
                                            <p>{hospital?.contactInfo?.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="info-card">
                                        <Calendar className="icon" />
                                        <div>
                                            <label>Joined</label>
                                            <p>{new Date(hospital?.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="info-card">
                                        <Shield className="icon" />
                                        <div>
                                            <label>Approved By</label>
                                            <p>{hospital?.approvedBy?.name || 'Pending'}</p>
                                        </div>
                                    </div>
                                </div>

                                {hospital?.specializations && hospital.specializations.length > 0 && (
                                    <div className="section">
                                        <h3><Stethoscope size={20} /> Specializations</h3>
                                        <div className="tags">
                                            {hospital.specializations.map((spec, idx) => (
                                                <span key={idx} className="tag">{spec}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {hospital?.approvedAt && (
                                    <div className="section approval-section">
                                        <h3>Approval History</h3>
                                        <div className="approval-info">
                                            <CheckCircle size={20} className="check-icon" />
                                            <div>
                                                <p>Approved by <strong>{hospital?.approvedBy?.name}</strong></p>
                                                <p className="timestamp">{new Date(hospital?.approvedAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* LOCATION TAB */}
                        {activeTab === 'location' && (
                            <div className="tab-content">
                                <div className="location-info">
                                    <MapPin size={24} className="icon" />
                                    <div>
                                        <h3>Address</h3>
                                        <p>{hospital?.location?.address || 'N/A'}</p>
                                        <p>{hospital?.location?.city}, {hospital?.location?.state} {hospital?.location?.zipCode}</p>
                                        {hospital?.location?.region && (
                                            <span className="region-badge">{hospital.location.region}</span>
                                        )}
                                    </div>
                                </div>

                                {/* GOOGLE MAPS - ALWAYS SHOWS */}
                                <div className="map-section">
                                    <h3>Location Map</h3>
                                    <div className="map-container">
                                        <iframe
                                            title="Hospital Location"
                                            width="100%"
                                            height="450"
                                            frameBorder="0"
                                            style={{ border: 0 }}
                                            src={`https://www.google.com/maps?q=${mapLat},${mapLng}&output=embed&z=15`}
                                            allowFullScreen
                                        />
                                    </div>
                                    <p className="map-note">
                                        Coordinates: {mapLat.toFixed(6)}, {mapLng.toFixed(6)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* STATISTICS TAB */}
                        {activeTab === 'statistics' && (
                            <div className="tab-content">
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <Users size={32} className="stat-icon" />
                                        <div>
                                            <h4>{hospital?.stats?.donorCount || 0}</h4>
                                            <p>Donors Managed</p>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <Heart size={32} className="stat-icon" />
                                        <div>
                                            <h4>{hospital?.stats?.requestCount || 0}</h4>
                                            <p>Organ Requests</p>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <Activity size={32} className="stat-icon" />
                                        <div>
                                            <h4>{hospital?.stats?.transplants?.successful || 0}</h4>
                                            <p>Successful Transplants</p>
                                        </div>
                                    </div>
                                    <div className="stat-card success-card">
                                        <TrendingUp size={32} className="stat-icon" />
                                        <div>
                                            <h4>{hospital?.stats?.successRate || 0}%</h4>
                                            <p>Success Rate</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* REVIEWS TAB */}
                        {activeTab === 'reviews' && (
                            <div className="tab-content">
                                {hospital?.reviewStats && hospital.reviewStats.totalReviews > 0 ? (
                                    <>
                                        <div className="reviews-summary">
                                            <div className="rating-display">
                                                <h2>{hospital.reviewStats.averageRating}</h2>
                                                <div className="stars">
                                                    {renderStars(Math.round(hospital.reviewStats.averageRating))}
                                                </div>
                                                <p>{hospital.reviewStats.totalReviews} reviews</p>
                                                <p className="verified">
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
                                    <div className="empty-state">
                                        <Star size={48} />
                                        <p>No reviews yet</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TIMELINE TAB */}
                        {activeTab === 'timeline' && (
                            <div className="tab-content">
                                {hospital?.timeline && hospital.timeline.length > 0 ? (
                                    <div className="timeline">
                                        {hospital.timeline.map((event, idx) => (
                                            <div key={idx} className="timeline-item">
                                                <div className={`timeline-marker ${event.status}`}></div>
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
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <Clock size={48} />
                                        <p>No activity recorded</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default HospitalDetailPage;
