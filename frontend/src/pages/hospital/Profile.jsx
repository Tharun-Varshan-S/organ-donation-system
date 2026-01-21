import React, { useEffect, useState } from 'react';
import './Profile.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

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

    return (
        <div className="profile-page">
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

            <div className="map-section">
                <h3>Location Map</h3>
                <div className="map-container">
                    <iframe
                        width="100%"
                        height="400"
                        id="gmap_canvas"
                        src={mapSrc}
                        frameBorder="0"
                        scrolling="no"
                        marginHeight="0"
                        marginWidth="0"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default Profile;
