import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Phone, Mail, Calendar, Shield,
    Users, Heart, Activity, TrendingUp, Star, CheckCircle,
    Building2, Stethoscope, Clock, Siren, Map
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
                <button onClick={() => navigate('/login', { state: { from: location.state?.from || 'dashboard' } })} className="btn-back">
                    <ArrowLeft size={20} />
                    System Command Center
                </button>
                <div className="header-info">
                    <div className="title-section">
                        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-200">
                            <Building2 size={32} />
                        </div>
                        <div>
                            {loading ? (
                                <div className="skeleton" style={{ height: '32px', width: '300px' }}></div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <h1>{hospital?.name}</h1>
                                        {hospital?.contactInfo?.emergencyPhone && (
                                            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full animate-pulse flex items-center gap-1">
                                                <Siren size={10} /> CRITICAL ENTITY
                                            </span>
                                        )}
                                    </div>
                                    <p className="license font-mono uppercase tracking-widest text-xs opacity-60">ID: {hospital?.licenseNumber || 'PENDING'}</p>
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
                {['overview', 'location', 'statistics', 'reviews', 'timeline', 'requests'].map(tab => (
                    <button
                        key={tab}
                        className={`tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)
                            .replace('location', 'Location & Map')
                            .replace('timeline', 'Activity Timeline')
                            .replace('requests', 'Organ Requests')}
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
                                <div className="map-section animate-fade-in">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3><Map size={20} className="text-blue-600" /> Geospatial Intelligence</h3>
                                        <div className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> System Verified Location
                                        </div>
                                    </div>
                                    <div className="map-container card-hover-shadow" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '450px', position: 'relative' }}>
                                        {loading ? (
                                            <div className="skeleton h-full w-full"></div>
                                        ) : (
                                            <iframe
                                                title="Hospital Location"
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                style={{ border: 0 }}
                                                src={`https://www.google.com/maps?q=${hospital?.name}+${hospital?.location?.address || ''}+${hospital?.location?.city || ''}&output=embed&z=16`}
                                                allowFullScreen
                                            />
                                        )}
                                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-2xl border border-white/20 z-10 max-w-[200px]">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Coordinates</p>
                                            <p className="text-xs font-black text-[#1e293b]">{mapLat.toFixed(6)}, {mapLng.toFixed(6)}</p>
                                            <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase">Precision Lockdown Active</p>
                                        </div>
                                    </div>
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
                                <div className="reviews-summary flex items-center gap-8 p-8 bg-gray-50 rounded-3xl mb-8 border border-gray-100">
                                    <div className="text-center">
                                        <p className="text-5xl font-black text-[#1e293b]">{hospital?.reviewStats?.averageRating || '0.0'}</p>
                                        <div className="flex justify-center mt-2">{renderStars(Math.round(hospital?.reviewStats?.averageRating || 0))}</div>
                                        <p className="text-[10px] font-black uppercase text-[#94a3b8] mt-2 tracking-widest">{hospital?.reviewStats?.totalReviews || 0} TOTAL REVIEWS</p>
                                    </div>
                                    <div className="h-20 w-px bg-gray-200"></div>
                                    <div className="flex-1 space-y-3">
                                        {[5, 4, 3, 2, 1].map(star => (
                                            <div key={star} className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-[#64748b] w-4">{star}</span>
                                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-yellow-400"
                                                        style={{ width: `${hospital?.reviews?.filter(r => r.rating === star).length / (hospital?.reviews?.length || 1) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {hospital?.reviews?.map((review, i) => (
                                        <div key={i} className="review-card p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black">
                                                        {review.userName?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-[#1e293b] text-sm uppercase">{review.userName || 'Verified User'}</p>
                                                        <p className="text-[10px] text-[#94a3b8] font-bold">{new Date(review.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">{renderStars(review.rating)}</div>
                                            </div>
                                            <p className="text-sm text-[#475569] leading-relaxed">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* REQUESTS TAB */}
                        {activeTab === 'requests' && (
                            <div className="tab-content">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-[#1e293b] uppercase tracking-tighter">Active Demands Matrix</h3>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100 uppercase tracking-widest">
                                        {hospital?.requests?.length || 0} Total Requests
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {hospital?.requests?.length > 0 ? (
                                        hospital.requests.map(req => (
                                            <div key={req._id} className="request-card-mini p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 group-hover:bg-blue-50 transition-colors z-0"></div>
                                                <div className="relative z-10">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-white flex items-center justify-center font-black text-sm uppercase">
                                                                {req.organType?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-[#1e293b] uppercase tracking-tighter">{req.organType}</h4>
                                                                <span className="text-[10px] font-black text-[#94a3b8] uppercase">#{req.requestId || req._id.slice(-6).toUpperCase()}</span>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${req.patient?.urgencyLevel === 'critical' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                            {req.patient?.urgencyLevel || 'STANDARD'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                                        <div>
                                                            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-1">Status</p>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full animate-pulse ${req.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                                                <span className="text-xs font-black text-[#1e293b] uppercase">{req.status}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-1">Registered</p>
                                                            <p className="text-xs font-bold text-[#64748b]">{new Date(req.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                <Heart size={24} className="text-gray-300" />
                                            </div>
                                            <p className="text-sm font-black text-[#94a3b8] uppercase tracking-widest">No Active Organ Requests Synchronized</p>
                                        </div>
                                    )}
                                </div>
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
