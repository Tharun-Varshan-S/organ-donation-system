import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Siren, AlertCircle } from 'lucide-react';
import { getHospitalImage } from '../utils/mockImages';
import './AdminHospitalCard.css';

const AdminHospitalCard = ({ hospital }) => {
    const navigate = useNavigate();
    const image = getHospitalImage(hospital);

    const isEmergency = !!hospital.contactInfo?.emergencyPhone;
    const locationString = `${hospital.location?.city || ''}${hospital.location?.city && hospital.location?.state ? ', ' : ''}${hospital.location?.state || ''}`;

    return (
        <div
            className="admin-hospital-card"
            onClick={() => navigate(`/admin/hospitals/${hospital._id}`)}
            role="button"
            tabIndex={0}
        >
            {/* Left Side: Image */}
            <div className="admin-card-image-wrapper">
                <img src={image} alt={hospital.name} className="admin-card-image" />
            </div>

            {/* Right Side: Details */}
            <div className="admin-card-details">
                <div>
                    <div className="admin-card-header">
                        <div>
                            <h3 className="admin-hospital-name">{hospital.name}</h3>
                            <div className="admin-location">
                                <MapPin size={14} />
                                <span>{locationString || 'Location not specified'}</span>
                            </div>
                        </div>

                        <div className="admin-badges">
                            {/* Status Badge */}
                            <span className={`status-badge ${hospital.status}`}>
                                {hospital.status}
                            </span>

                            {/* Emergency Indicator */}
                            {isEmergency && (
                                <span className="emergency-badge">
                                    <Siren size={12} /> Emergency
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Specializations */}
                    <div className="admin-specs">
                        {hospital.specializations?.length > 0 ? (
                            hospital.specializations.slice(0, 5).map((spec, index) => (
                                <span key={index} className="spec-chip">{spec}</span>
                            ))
                        ) : (
                            <span className="spec-chip">General</span>
                        )}
                        {hospital.specializations?.length > 5 && (
                            <span className="spec-chip">+{hospital.specializations.length - 5}</span>
                        )}
                    </div>
                </div>

                {/* Footer/CTA hint */}
                <div className="admin-card-footer">
                    <span className="view-details-text">
                        View Details <AlertCircle size={14} />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AdminHospitalCard;
