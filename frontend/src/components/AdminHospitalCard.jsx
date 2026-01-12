import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Check, Star } from 'lucide-react';
import { getHospitalImage } from '../utils/mockImages';
import './AdminHospitalCard.css';

const AdminHospitalCard = ({ hospital, basePath = '/admin/hospitals' }) => {
    const navigate = useNavigate();
    const image = getHospitalImage(hospital);

    const isEmergency = !!hospital.contactInfo?.emergencyPhone;
    const locationLine = `${hospital.location?.city || ''}${hospital.location?.city && hospital.location?.state ? ', ' : ''}${hospital.location?.state || ''}`;

    return (
        <div
            className="admin-hospital-card"
            onClick={() => navigate(`${basePath}/${hospital._id}`)}
            role="button"
            tabIndex={0}
        >
            {/* Deal/Tag Overlay */}
            {hospital.status === 'approved' && (
                <div className="card-badge-overlay">Verified Partner</div>
            )}

            {/* Top Image */}
            <div className="admin-card-image-wrapper">
                <img src={image} alt={hospital.name} className="admin-card-image" />
            </div>

            {/* Content */}
            <div className="admin-card-details">
                {/* Header */}
                <div className="admin-card-header">
                    <h3 className="admin-hospital-name">{hospital.name}</h3>
                    <span className="duration-badge">EST 2024</span>
                </div>

                {/* Location */}
                <div className="admin-location">
                    <MapPin size={12} />
                    <span>{locationLine || 'Location N/A'}</span>
                </div>

                {/* Bullet Specs (Mocking the 2-column list in reference) */}
                <div className="admin-specs">
                    <div className="spec-item"><span className="spec-bullet" /> {hospital.capacity?.totalBeds || 0} Beds</div>
                    <div className="spec-item"><span className="spec-bullet" /> Ambulance</div>
                    <div className="spec-item"><span className="spec-bullet" /> ICU Available</div>
                    <div className="spec-item"><span className="spec-bullet" /> 24/7 Care</div>
                </div>

                {/* Green Check Features */}
                <div className="feature-list">
                    {hospital.specializations?.slice(0, 3).map((spec, i) => (
                        <div key={i} className="feature-item">
                            <Check size={14} className="check-icon" />
                            {spec}
                        </div>
                    ))}
                    {isEmergency && (
                        <div className="feature-item">
                            <Check size={14} className="check-icon" />
                            Emergency Services
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="admin-card-footer">
                    <div className="status-badge-container">
                        <span className={`status-badge ${hospital.status}`}>{hospital.status}</span>
                    </div>

                    <div className="text-right">
                        <div className="footer-price">{hospital.rating || '4.5'}/5</div>
                        <div className="footer-label">Quality Score</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHospitalCard;
