import React, { useEffect, useState } from 'react';
import { Zap, Shield, MapPin, Phone, Award, CheckCircle } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState(null);

    useEffect(() => {
        fetchProfile();
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/hospital/dashboard', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setDashboardStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    const calculateEmergencyReadiness = () => {
        if (!profile || !dashboardStats) return 0;
        let score = 0;
        
        // Capacity score (40%)
        if (profile.capacity?.totalBeds && profile.capacity?.availableBeds) {
            const capacityRatio = profile.capacity.availableBeds / profile.capacity.totalBeds;
            score += capacityRatio * 40;
        }
        
        // Emergency ready flag (30%)
        if (profile.isEmergencyReady) score += 30;
        
        // Critical requests handling (30%)
        const criticalCount = dashboardStats.requests?.emergency || 0;
        if (criticalCount === 0) score += 30;
        else if (criticalCount <= 2) score += 20;
        else if (criticalCount <= 5) score += 10;
        
        return Math.min(100, Math.round(score));
    };

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/hospital/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setProfile(data.data);
                setFormData(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // deep merge handling simplified for flat structure, but contactInfo is nested
        // For fast implementation, I'll flatten updates or handle specific keys
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData({
                ...formData,
                [parent]: { ...formData[parent], [child]: value }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                name: formData.name,
                phone: formData.contactInfo?.phone,
                emergencyPhone: formData.contactInfo?.emergencyPhone,
                address: formData.location?.address,
                city: formData.location?.city,
                totalBeds: formData.capacity?.totalBeds
            };

            const response = await fetch('http://localhost:5000/api/hospital/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) alert('Profile updated');
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading Profile...</div>;
    if (!profile) return <div>Error loading profile</div>;

    const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
        (profile.location?.address || '') + ' ' + (profile.location?.city || '')
    )}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

    const emergencyReadinessScore = calculateEmergencyReadiness();
    const isLicenseVerified = profile?.licenseNumber && profile?.status === 'approved';

    return (
        <div className="profile-page">
            {/* Verified License Badge */}
            {isLicenseVerified && (
                <div className="verified-license-badge">
                    <Shield size={20} />
                    <div>
                        <h3>Verified License</h3>
                        <p>License Number: {profile.licenseNumber}</p>
                    </div>
                    <CheckCircle size={24} className="verified-icon" />
                </div>
            )}

            {/* Emergency Readiness Score */}
            <div className="emergency-readiness-card">
                <div className="readiness-header">
                    <Zap size={24} />
                    <div>
                        <h3>Emergency Readiness Score</h3>
                        <p>Operational capacity for critical situations</p>
                    </div>
                </div>
                <div className="readiness-meter">
                    <div className="readiness-bar">
                        <div
                            className={`readiness-fill ${emergencyReadinessScore >= 80 ? 'excellent' : emergencyReadinessScore >= 60 ? 'good' : 'needs-improvement'}`}
                            style={{ width: `${emergencyReadinessScore}%` }}
                        />
                    </div>
                    <div className="readiness-score">
                        <span className="score-value">{emergencyReadinessScore}</span>
                        <span className="score-label">/ 100</span>
                    </div>
                </div>
                <div className="readiness-breakdown">
                    <div className="breakdown-item">
                        <span>Capacity Utilization</span>
                        <span>{profile.capacity?.availableBeds || 0} / {profile.capacity?.totalBeds || 0} beds</span>
                    </div>
                    <div className="breakdown-item">
                        <span>Emergency Ready</span>
                        <span>{profile.isEmergencyReady ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="breakdown-item">
                        <span>Critical Requests</span>
                        <span>{dashboardStats?.requests?.emergency || 0}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="profile-form">
                <div className="form-section">
                    <h3>Hospital Details</h3>
                    <div className="form-row">
                        <label>Hospital Name</label>
                        <input name="name" value={formData.name || ''} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                        <label>License Number</label>
                        <input value={formData.licenseNumber || ''} disabled className="disabled-input" />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Contact Information</h3>
                    <div className="form-row">
                        <label>General Phone</label>
                        <input name="contactInfo.phone" value={formData.contactInfo?.phone || ''} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                        <label>Emergency Contact</label>
                        <input name="contactInfo.emergencyPhone" value={formData.contactInfo?.emergencyPhone || ''} onChange={handleChange} className="emergency-input" />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Infrastructure</h3>
                    <div className="form-row">
                        <label>Total Beds</label>
                        <input type="number" name="capacity.totalBeds" value={formData.capacity?.totalBeds || ''} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Location</h3>
                    <div className="form-row">
                        <label>Address</label>
                        <input name="location.address" value={formData.location?.address || ''} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                        <label>City</label>
                        <input name="location.city" value={formData.location?.city || ''} onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="save-btn">Save Changes</button>
            </form>

            {/* Admin Remarks Section */}
            {profile.adminRemarks && (
                <div className="form-section admin-remarks-section">
                    <h3>Admin Remarks</h3>
                    <div className="admin-remarks-display">
                        <p>{profile.adminRemarks}</p>
                        <span className="remarks-note">Read-only • Updated by Admin</span>
                    </div>
                </div>
            )}

            <div className="map-section">
                <div className="map-header">
                    <h3>Location & Access Routes</h3>
                    {profile.isEmergencyReady && (
                        <span className="emergency-ready-badge">
                            <Zap size={16} />
                            Emergency Ready
                        </span>
                    )}
                </div>
                <div className="access-routes-info">
                    <div className="route-item">
                        <MapPin size={18} />
                        <div>
                            <strong>Address:</strong> {profile.location?.address || 'N/A'}, {profile.location?.city || 'N/A'}, {profile.location?.state || 'N/A'}
                        </div>
                    </div>
                    <div className="route-item">
                        <Phone size={18} />
                        <div>
                            <strong>Emergency Contact:</strong> {profile.contactInfo?.emergencyPhone || profile.contactInfo?.phone || 'N/A'}
                        </div>
                    </div>
                </div>
                <div className={`map-container ${profile.isEmergencyReady ? 'emergency-highlight' : ''}`}>
                    <iframe
                        width="100%"
                        height="500"
                        id="gmap_canvas"
                        src={mapSrc}
                        frameBorder="0"
                        scrolling="no"
                        marginHeight="0"
                        marginWidth="0"
                        style={{ borderRadius: '12px' }}
                    ></iframe>
                    {profile.isEmergencyReady && (
                        <div className="emergency-overlay">
                            <div className="emergency-overlay-content">
                                <Zap size={24} />
                                <p>This hospital is marked as Emergency Ready</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
