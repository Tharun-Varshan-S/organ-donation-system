import React from 'react';
import { Building2, MapPin, Phone, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/Card';

const AdminHospitalCard = ({ hospital, onApprove, onReject }) => (
    <Card className="mb-6">
        <div className="flex justify-between items-start">
            <div className="flex gap-4">
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                    <Building2 size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#1e293b]">{hospital.name}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                        <MapPin size={14} />
                        <span>{hospital.location?.city}, {hospital.location?.state}</span>
                    </div>
                </div>
            </div>
            <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${hospital.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        hospital.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                    }`}>
                    {hospital.status}
                </span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={16} />
                <span>{hospital.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} />
                <span>{hospital.phone || 'N/A'}</span>
            </div>
        </div>

        {hospital.status === 'PENDING' && (onApprove || onReject) && (
            <div className="flex gap-4 mt-6">
                <button
                    onClick={() => onApprove(hospital._id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                    <CheckCircle size={18} /> Approve
                </button>
                <button
                    onClick={() => onReject(hospital._id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                    <XCircle size={18} /> Reject
                </button>
            </div>
        )}
    </Card>
);

export default AdminHospitalCard;
