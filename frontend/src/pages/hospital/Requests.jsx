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
    TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import './Requests.css';

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showTimeline, setShowTimeline] = useState(false);
    const [showDelayModal, setShowDelayModal] = useState(false);
    const [delayReason, setDelayReason] = useState('');
    const [currentRequestForDelay, setCurrentRequestForDelay] = useState(null);

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

            <div className="requests-grid">
                {loading ? <p>Loading requests...</p> : requests.map(request => {
                    const sla = calculateSLA(request.createdAt, request.patient.urgencyLevel, request.slaBreachedAt);
                    const isEmergency = request.isEmergency || request.patient.urgencyLevel === 'critical';

                    return (
                        <motion.div
                            key={request._id}
                            className={`request-card ${getUrgencyColor(request.patient.urgencyLevel)} ${isEmergency ? 'emergency-locked' : ''}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => {
                                setSelectedRequest(request);
                                setShowTimeline(true);
                            }}
                        >
                            {isEmergency && (
                                <div className="emergency-lock-badge">
                                    <Lock size={12} />
                                    Emergency Mode
                                </div>
                            )}

                            <div className="request-header">
                                <span className="organ-badge">{request.organType}</span>
                                <span className={`urgency-badge ${request.patient.urgencyLevel}`}>
                                    {request.patient.urgencyLevel}
                                </span>
                            </div>

                            <div className="patient-info">
                                <h3>{request.patient.name}</h3>
                                <div className="patient-meta">
                                    <span>{request.patient.age} yrs</span>
                                    <span>•</span>
                                    <span className="blood-type">{request.patient.bloodType}</span>
                                </div>
                            </div>

                            {/* SLA Countdown Bar */}
                            <div className="sla-countdown-container">
                                <div className="sla-countdown-header">
                                    <Clock size={14} />
                                    <span className="sla-text">{sla.text}</span>
                                </div>
                                <div className="sla-progress-bar">
                                    <div 
                                        className={`sla-progress-fill ${sla.color}`}
                                        style={{ width: `${sla.percentage}%` }}
                                    />
                                </div>
                                {sla.isBreached && !request.delayReason && (
                                    <button
                                        className="capture-delay-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentRequestForDelay(request);
                                            setShowDelayModal(true);
                                        }}
                                    >
                                        <FileText size={12} />
                                        Capture Delay Reason
                                    </button>
                                )}
                                {request.delayReason && (
                                    <div className="delay-reason-display">
                                        <AlertCircle size={12} />
                                        <span>Delay: {request.delayReason}</span>
                                    </div>
                                )}
                            </div>

                            <div className="request-footer">
                                <span className={`status-text ${request.status}`}>
                                    {request.status === 'pending' && <Clock size={14} />}
                                    {request.status === 'matched' && <CheckCircle2 size={14} />}
                                    {request.status}
                                </span>
                                <span className="req-id">#{request.requestId?.slice(-6) || '---'}</span>
                            </div>
                        </motion.div>
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

            {/* Lifecycle Timeline Modal */}
            {showTimeline && selectedRequest && (
                <div className="modal-overlay" onClick={() => setShowTimeline(false)}>
                    <motion.div
                        className="modal-content timeline-modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Request Lifecycle: {selectedRequest.requestId}</h2>
                            <button onClick={() => setShowTimeline(false)}>
                                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>
                        <div className="request-timeline-container">
                            {selectedRequest.lifecycle && selectedRequest.lifecycle.length > 0 ? (
                                selectedRequest.lifecycle.map((event, index) => (
                                    <div key={index} className="timeline-item">
                                        <div className="timeline-marker">
                                            {event.stage === 'created' && <Plus size={16} />}
                                            {event.stage === 'matched' && <CheckCircle2 size={16} />}
                                            {event.stage === 'completed' && <CheckCircle2 size={16} />}
                                        </div>
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <h4>{event.stage.replace('_', ' ').toUpperCase()}</h4>
                                                <span className="timeline-date">
                                                    {new Date(event.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            {event.notes && <p className="timeline-details">{event.notes}</p>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-timeline">
                                    <p>No lifecycle events recorded yet.</p>
                                </div>
                            )}
                        </div>
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
