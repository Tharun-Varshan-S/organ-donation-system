import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getHospitalImage } from '../utils/mockImages';
import './HospitalCard.css';

const HospitalCard = ({ hospital }) => {
    const navigate = useNavigate();
    const image = getHospitalImage(hospital);

    return (
        <div className="hospital-card">
            {/* IMAGE SECTION */}
            <div className="card-image-container">
                <img src={image} alt={hospital.name} className="card-image" />
                <div className="card-badge-top-right">
                    <span className="badge-top">Approved Hospital</span>
                </div>
            </div>

            {/* TITLE + CAPACITY TAG */}
            <div className="card-title-section">
                <h3 className="card-title">{hospital.name}</h3>
                <span className="capacity-tag">{hospital.capacity?.totalBeds || 0} Beds</span>
            </div>

            {/* LOCATION */}
            <div className="card-location">
                📍 {hospital.location?.city}, {hospital.location?.state}
            </div>
            <div className="card-address">
                {hospital.location?.address}
            </div>

            {/* TWO-COLUMN INFRASTRUCTURE */}
            <div className="card-infrastructure">
                <div className="infra-left">
                    <div className="infra-item">• {hospital.capacity?.totalBeds || 0} Total Beds</div>
                    <div className="infra-item">• {hospital.capacity?.icuBeds || 0} ICU Beds</div>
                    <div className="infra-item">• {hospital.capacity?.otRooms || 0} OT Rooms</div>
                </div>
                <div className="infra-right">
                    <div className="infra-item">• Emergency: 24/7</div>
                    <div className="infra-item">• Ambulances: Available</div>
                    <div className="infra-item">• Parking Available</div>
                </div>
            </div>

            {/* CHECKMARK SPECIALIZATIONS */}
            <div className="card-specializations">
                {hospital.specializations?.slice(0, 4).map((spec, index) => (
                    <div key={index} className="spec-item">
                        <CheckCircle2 size={16} className="check-icon" />
                        <span>{spec}</span>
                    </div>
                ))}
                {hospital.specializations?.length > 4 && (
                    <div className="spec-item more">
                        +{hospital.specializations.length - 4} more specializations
                    </div>
                )}
            </div>

            {/* TRUST INFO */}
            <div className="card-trust-info">
                <p>Approved on {hospital.approvedAt ? new Date(hospital.approvedAt).toLocaleDateString() : 'Jan 2026'}</p>
                <p>Joint Commission Accredited</p>
                <p>Emergency Hotline: {hospital.contactInfo?.emergencyPhone || '911-XXX-XXXX'}</p>
            </div>

            {/* VIEW BUTTON */}
            <button
                className="view-hospital-btn"
                onClick={() => navigate(`/hospitals/${hospital._id}`)}
            >
                View Hospital
            </button>
        </div>
    );
};

export default HospitalCard;
