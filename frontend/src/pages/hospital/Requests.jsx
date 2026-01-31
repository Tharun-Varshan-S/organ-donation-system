import React, { useEffect, useState } from 'react';
import {
    Plus,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Activity,
    AlertTriangle,
    Lock,
    FileText,
    TrendingDown,
    Filter,
    Search,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassCard, SLAMeter, StatusBadge } from './DashboardComponents';
import './Requests.css';

const Requests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDelayModal, setShowDelayModal] = useState(false);
    const [delayReason, setDelayReason] = useState('');
    const [currentRequestForDelay, setCurrentRequestForDelay] = useState(null);
    const [urgencyFilter, setUrgencyFilter] = useState('');
    const [slaBreachFilter, setSlaBreachFilter] = useState('');
    const [organTypeFilter, setOrganTypeFilter] = useState('');

    const [formData, setFormData] = useState({
        patientName: '',
        patientAge: '',
        bloodType: 'A+',
        organType: 'kidney',
        urgencyLevel: 'medium',
        medicalCondition: '',
        notes: ''
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    // Check URL params for filter
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('filter') === 'critical') {
            setUrgencyFilter('critical');
        }
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/hospital/requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateSLA = (createdAt, urgency, slaBreachedAt) => {
        const start = new Date(createdAt).getTime();
        const now = new Date().getTime();
        const elapsedHours = (now - start) / (1000 * 60 * 60);

        // Define SLAs
        const slaMap = {
            'critical': 24, // 24 hours
            'high': 48,
            'medium': 72,
            'low': 168
        };

        const limit = slaMap[urgency] || 72;
        const remaining = limit - elapsedHours;
        const percentage = Math.max(0, Math.min(100, (remaining / limit) * 100));

        if (slaBreachedAt || remaining < 0) {
            return {
                text: 'Breached',
                color: 'red',
                percentage: 0,
                isBreached: true
            };
        }

        return {
            text: `${Math.round(remaining)}h remaining`,
            color: remaining < (limit * 0.2) ? 'red' : remaining < (limit * 0.5) ? 'orange' : 'green',
            percentage,
            isBreached: false
        };
    };

    const handleDelayReasonSubmit = async (e) => {
        e.preventDefault();
        if (!delayReason.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/hospital/requests/${currentRequestForDelay._id}/sla-breach`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ delayReason })
            });

            const data = await response.json();
            if (data.success) {
                fetchRequests();
                setShowDelayModal(false);
                setDelayReason('');
                setCurrentRequestForDelay(null);
            }
        } catch (error) {
            console.error('Error capturing delay reason:', error);
        }
    };

    const handleValidateEligibility = async (requestId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/hospital/requests/${requestId}/validate-eligibility`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                alert('Eligibility Validated!');
                fetchRequests();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error validating eligibility:', error);
        }
    };

    const handleRevealDonor = async (donorId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/hospital/donors/${donorId}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                // Show donor details in a modal or alert for now
                if (data.revealed) {
                    alert(`Donor Revealed:\nName: ${data.data.personalInfo?.firstName || data.data.name}\nPhone: ${data.data.personalInfo?.phone || data.data.phone}`);
                } else {
                    alert('Donor profile is restricted. Confidential data not revealed.');
                }
            }
        } catch (error) {
            console.error('Error revealing donor:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                patient: {
                    name: formData.patientName,
                    age: formData.patientAge,
                    bloodType: formData.bloodType,
                    medicalCondition: formData.medicalCondition,
                    urgencyLevel: formData.urgencyLevel
                },
                organType: formData.organType,
                notes: formData.notes
            };

            const response = await fetch('http://localhost:5000/api/hospital/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.success) {
                fetchRequests();
                setShowModal(false);
                setFormData({
                    patientName: '', patientAge: '', bloodType: 'A+', organType: 'kidney',
                    urgencyLevel: 'medium', medicalCondition: '', notes: ''
                });
            }
        } catch (error) {
            console.error('Error creating request:', error);
        }
    };

    const getUrgencyColor = (level) => {
        switch (level) {
            case 'critical': return 'border-red-500 bg-red-50';
            case 'high': return 'border-orange-500 bg-orange-50';
            default: return 'border-blue-200 bg-white';
        }
    };

    const filteredRequests = requests.filter(request => {
        const matchesUrgency = urgencyFilter ? request.patient.urgencyLevel === urgencyFilter : true;
        const matchesOrgan = organTypeFilter ? request.organType === organTypeFilter : true;
        const sla = calculateSLA(request.createdAt, request.patient.urgencyLevel, request.slaBreachedAt);
        const matchesSLA = slaBreachFilter === 'breached' ? sla.isBreached :
            slaBreachFilter === 'at-risk' ? !sla.isBreached && sla.color === 'red' : true;
        return matchesUrgency && matchesOrgan && matchesSLA;
    });

    return (
        <div className="requests-page">
            <div className="page-header">
                <div>
                    <h2>Organ Requests</h2>
                    <p className="text-gray-500">Manage patient organ needs and track status</p>
                </div>
                <button className="primary-btn" onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    New Request
                </button>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <div className="filter-group">
                    <Filter size={18} />
                    <span className="filter-label">Filters:</span>
                </div>
                <select
                    className="filter-select"
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                >
                    <option value="">All Urgency Levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <select
                    className="filter-select"
                    value={slaBreachFilter}
                    onChange={(e) => setSlaBreachFilter(e.target.value)}
                >
                    <option value="">All SLA Status</option>
                    <option value="breached">SLA Breached</option>
                    <option value="at-risk">At Risk</option>
                </select>
                <select
                    className="filter-select"
                    value={organTypeFilter}
                    onChange={(e) => setOrganTypeFilter(e.target.value)}
                >
                    <option value="">All Organ Types</option>
                    {['heart', 'kidney', 'liver', 'lung', 'pancreas', 'cornea'].map(organ => (
                        <option key={organ} value={organ}>{organ}</option>
                    ))}
                </select>
            </div>

            {/* Emergency Summary Cards */}
            {requests.filter(r => r.patient.urgencyLevel === 'critical' && r.status !== 'completed').length > 0 && (
                <div className="emergency-summary">
                    <h3 className="emergency-summary-title">
                        <AlertTriangle size={20} />
                        Emergency Requests Summary
                    </h3>
                    <div className="emergency-cards">
                        {requests
                            .filter(r => r.patient.urgencyLevel === 'critical' && r.status !== 'completed')
                            .slice(0, 3)
                            .map(req => {
                                const sla = calculateSLA(req.createdAt, req.patient.urgencyLevel, req.slaBreachedAt);
                                return (
                                    <div key={req._id} className="emergency-card">
                                        <div className="emergency-card-header">
                                            <span className="emergency-request-id">{req.requestId}</span>
                                            {req.isEmergency && <Lock size={14} />}
                                        </div>
                                        <p className="emergency-patient">{req.patient.name} - {req.organType}</p>
                                        <div className="emergency-sla">
                                            <span className={`sla-status ${sla.color}`}>{sla.text}</span>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? <p>Loading requests...</p> : filteredRequests.length === 0 ? (
                    <div className="empty-state">No requests match your filters.</div>
                ) : filteredRequests.map(request => {
                    const start = new Date(request.createdAt).getTime();
                    const now = new Date().getTime();
                    const elapsed = (now - start) / (1000 * 60 * 60);
                    const limit = request.patient?.urgencyLevel === 'critical' ? 24 : 72;
                    const remaining = Math.max(0, limit - elapsed);
                    const isEmergency = request.isEmergency || request.patient.urgencyLevel === 'critical';

                    return (
                        <GlassCard
                            key={request._id}
                            urgency={request.patient?.urgencyLevel === 'critical' ? 'critical' : 'normal'}
                            hoverEffect
                            onClick={() => navigate(`/hospital/requests/${request._id}`)}
                            className="relative"
                        >
                            {isEmergency && (
                                <div className="absolute top-4 right-4 p-1.5 bg-rose-600 text-white rounded-lg shadow-lg">
                                    <Lock size={12} />
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${request.patient?.urgencyLevel === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {request.organType === 'heart' ? <Heart size={24} /> : <Activity size={24} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">{request.organType}</h3>
                                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">#{request.requestId?.slice(-6)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <StatusBadge status={request.status} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{request.patient?.bloodType}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Profile</p>
                                    <p className="font-bold text-slate-700">{request.patient?.name} <span className="text-slate-400 ml-1">({request.patient?.age}y)</span></p>
                                </div>

                                <SLAMeter
                                    value={remaining}
                                    max={limit}
                                    label=""
                                />

                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock size={12} /> {request.status === 'matched' ? 'Donor Assigned' : 'Awaiting Match'}
                                    </span>
                                    <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                            </div>
                        </GlassCard>
                    );
                })}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <motion.div className="modal-content">
                        <h2>Create Organ Request</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <h3>Patient Details</h3>
                                <div className="form-row">
                                    <input placeholder="Name" value={formData.patientName} onChange={e => setFormData({ ...formData, patientName: e.target.value })} required />
                                    <input type="number" placeholder="Age" value={formData.patientAge} onChange={e => setFormData({ ...formData, patientAge: e.target.value })} required />
                                </div>
                                <div className="form-row">
                                    <select value={formData.bloodType} onChange={e => setFormData({ ...formData, bloodType: e.target.value })}>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <select value={formData.urgencyLevel} onChange={e => setFormData({ ...formData, urgencyLevel: e.target.value })}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-section">
                                <h3>Organ & Medical</h3>
                                <select value={formData.organType} onChange={e => setFormData({ ...formData, organType: e.target.value })} className="full-width">
                                    {['heart', 'kidney', 'liver', 'lung', 'pancreas', 'cornea'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <textarea
                                    className="full-width mt-2"
                                    placeholder="Medical Condition / Notes"
                                    value={formData.medicalCondition}
                                    onChange={e => setFormData({ ...formData, medicalCondition: e.target.value })}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="submit-btn">Submit Request</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}


            {/* Delay Reason Capture Modal */}
            {showDelayModal && currentRequestForDelay && (
                <div className="modal-overlay" onClick={() => setShowDelayModal(false)}>
                    <motion.div
                        className="modal-content"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Capture Delay Reason</h2>
                            <button onClick={() => setShowDelayModal(false)}>
                                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>
                        <form onSubmit={handleDelayReasonSubmit}>
                            <div className="form-section">
                                <label>Request: {currentRequestForDelay.requestId}</label>
                                <label>Patient: {currentRequestForDelay.patient.name}</label>
                                <textarea
                                    className="full-width mt-2"
                                    placeholder="Please provide the reason for the SLA breach..."
                                    value={delayReason}
                                    onChange={(e) => setDelayReason(e.target.value)}
                                    required
                                    rows={5}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowDelayModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    Submit Delay Reason
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Requests;
