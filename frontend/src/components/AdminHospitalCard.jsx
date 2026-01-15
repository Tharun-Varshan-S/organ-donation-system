import React from 'react';
import { MapPin, Check, Star, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { getHospitalImage } from '../utils/mockImages';
import './AdminHospitalCard.css';

const AdminHospitalCard = ({ hospital, onApprove, onReject, onClick }) => {
    const [actionLoading, setActionLoading] = React.useState(null); // 'approve' or 'reject'
    const image = getHospitalImage(hospital);

    const isEmergency = !!hospital.contactInfo?.emergencyPhone;
    const locationLine = `${hospital.location?.city || ''}${hospital.location?.city && hospital.location?.state ? ', ' : ''}${hospital.location?.state || ''}`;

    const handleAction = async (e, action) => {
        e.stopPropagation();
        if (action === 'reject' && !window.confirm('Are you sure you want to reject this request?')) return;

        try {
            setActionLoading(action);
            if (action === 'approve') await onApprove(hospital._id);
            else await onReject(hospital._id);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div
            className={`admin-hospital-card group ${hospital.status === 'pending' ? 'pending-request' : ''}`}
            role="button"
            tabIndex={0}
        >
            {/* Deal/Tag Overlay */}
            {hospital.status === 'approved' && (
                <div className="card-badge-overlay flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified Partner
                </div>
            )}

            {/* Top Image */}
            <div className="admin-card-image-wrapper">
                <img src={image} alt={hospital.name} className="admin-card-image" />
                {hospital.status === 'pending' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white font-bold text-xs uppercase tracking-widest">Review Request</p>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="admin-card-details">
                {/* Header */}
                <div className="admin-card-header">
                    <h3 className="admin-hospital-name">{hospital.name}</h3>
                    <div className="flex flex-col items-end">
                        <span className="duration-badge">{hospital.location?.state || 'REGION'}</span>
                    </div>
                </div>

                {/* Location */}
                <div className="admin-location">
                    <MapPin size={12} />
                    <span>{locationLine || 'Location N/A'}</span>
                </div>

                {/* Mini Stats Badges - ENHANCED with Backend Data */}
                <div className="flex gap-2 my-2">
                    <div className="flex-1 bg-gray-50 p-2 rounded-xl text-center border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Donors</p>
                        <p className="text-sm font-black text-[#1e293b]">{hospital.quickStats?.donorCount || 0}</p>
                    </div>
                    <div className="flex-1 bg-gray-50 p-2 rounded-xl text-center border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Requests</p>
                        <p className="text-sm font-black text-blue-600">{hospital.quickStats?.requestCount || 0}</p>
                    </div>
                    <div className="flex-1 bg-gray-50 p-2 rounded-xl text-center border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Success</p>
                        <p className="text-sm font-black text-green-600">{hospital.quickStats?.successRate || 0}%</p>
                    </div>
                </div>

                {/* Green Check Features */}
                <div className="feature-list">
                    {hospital.specializations?.slice(0, 2).map((spec, i) => (
                        <div key={i} className="feature-item">
                            <CheckCircle2 size={12} className="check-icon" />
                            {spec}
                        </div>
                    ))}
                </div>

                {/* Footer / Actions */}
                <div className="admin-card-footer mt-auto">
                    {hospital.status === 'pending' && (onApprove || onReject) ? (
                        <div className="flex gap-2 w-full mt-2">
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${actionLoading === 'approve' ? 'bg-gray-100 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                onClick={(e) => handleAction(e, 'approve')}
                                disabled={!!actionLoading}
                            >
                                {actionLoading === 'approve' ? <span className="animate-spin text-lg">◌</span> : <><Check size={14} /> Approve</>}
                            </button>
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all border ${actionLoading === 'reject' ? 'bg-gray-100 text-gray-400' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                                onClick={(e) => handleAction(e, 'reject')}
                                disabled={!!actionLoading}
                            >
                                {actionLoading === 'reject' ? <span className="animate-spin text-lg">◌</span> : <><X size={14} /> Reject</>}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="status-badge-container">
                                <span className={`status-badge ${hospital.status}`}>{hospital.status}</span>
                            </div>
                            <div className="text-right">
                                <div className="footer-price">{hospital.rating || '4.8'}/5</div>
                                <div className="footer-label">Quality Score</div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminHospitalCard;
