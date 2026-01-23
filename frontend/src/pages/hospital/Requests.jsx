import React, { useEffect, useState } from 'react';
import {
    Plus,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Activity,
    AlertTriangle,
    FileText,
    ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import './Requests.css';

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDelayModal, setShowDelayModal] = useState(false);
    const [delayReason, setDelayReason] = useState('');
    const [viewingRequest, setViewingRequest] = useState(null);

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

    const calculateSLA = (request) => {
        if (!request.slaDueDate) {
            // Calculate SLA if not set
            const start = new Date(request.createdAt).getTime();
            const now = new Date().getTime();
            const elapsedHours = (now - start) / (1000 * 60 * 60);
            const slaMap = {
                'critical': 4, 'high': 24, 'medium': 48, 'low': 168
            };
            const limit = slaMap[request.patient?.urgencyLevel] || 48;
            const remaining = limit - elapsedHours;
            const total = limit;
            const percent = Math.min(100, (elapsedHours / total) * 100);
            
            if (remaining < 0) return { 
                text: 'Breached', 
                color: 'red', 
                percent: 100,
                remaining: 0,
                breached: true
            };
            return { 
                text: `${Math.round(remaining)}h remaining`, 
                color: remaining < (total * 0.1) ? 'red' : remaining < (total * 0.3) ? 'orange' : 'green',
                percent,
                remaining,
                breached: false
            };
        } else {
            // Use actual SLA due date
            const now = new Date().getTime();
            const due = new Date(request.slaDueDate).getTime();
            const created = new Date(request.createdAt).getTime();
            const total = due - created;
            const remaining = due - now;
            const elapsed = now - created;
            const percent = total > 0 ? Math.min(100, (elapsed / total) * 100) : 100;
            
            if (remaining < 0 || request.slaBreached) {
                return {
                    text: 'Breached',
                    color: 'red',
                    percent: 100,
                    remaining: 0,
                    breached: true
                };
            }
            
            const hoursRemaining = remaining / (1000 * 60 * 60);
            const hoursTotal = total / (1000 * 60 * 60);
            
            return {
                text: `${Math.round(hoursRemaining)}h remaining`,
                color: hoursRemaining < (hoursTotal * 0.1) ? 'red' : hoursRemaining < (hoursTotal * 0.3) ? 'orange' : 'green',
                percent,
                remaining: hoursRemaining,
                breached: false
            };
        }
    };

    const handleDelayReasonSubmit = async (e) => {
        e.preventDefault();
        if (!delayReason.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/hospital/requests/${viewingRequest._id}/delay-reason`, {
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
                setViewingRequest(null);
            }
        } catch (error) {
            console.error('Error submitting delay reason:', error);
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

            <div className="requests-grid">
                {loading ? <p>Loading requests...</p> : requests.map(request => {
                    const sla = calculateSLA(request);
                    const isLocked = request.patient.urgencyLevel === 'critical' || request.isEmergencyLocked;
                    
                    // Lifecycle stages
                    const lifecycleStages = [
                        { key: 'pending', label: 'Request', icon: FileText },
                        { key: 'matched', label: 'Matched', icon: CheckCircle2 },
                        { key: 'completed', label: 'Done', icon: CheckCircle2 }
                    ];
                    
                    const currentStageIndex = lifecycleStages.findIndex(s => s.key === request.status);

                    return (
                        <motion.div
                            key={request._id}
                            className={`request-card ${getUrgencyColor(request.patient.urgencyLevel)} ${isLocked ? 'locked-request' : ''}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {isLocked && (
                                <div className="absolute top-2 right-2 text-red-600 bg-white/80 rounded-full p-1 shadow-sm" title="Locked: Emergency Protocol">
                                    <AlertCircle size={16} />
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
                            <div className="sla-container mt-3 mb-2">
                                <div className="sla-header-row">
                                    <span className="sla-label">SLA Tracking</span>
                                    <span className={`sla-status ${sla.breached ? 'breached' : ''}`} style={{ color: sla.color === 'red' ? '#ef4444' : sla.color === 'orange' ? '#f59e0b' : '#22c55e' }}>
                                        {sla.breached && <AlertTriangle size={12} style={{ marginRight: 4, display: 'inline' }} />}
                                        {sla.text}
                                    </span>
                                </div>
                                <div className="sla-progress-bar-container">
                                    <div
                                        className={`sla-progress-bar ${sla.breached ? 'breached' : ''}`}
                                        style={{
                                            width: `${sla.percent}%`,
                                            backgroundColor: sla.color === 'red' ? '#ef4444' : sla.color === 'orange' ? '#f59e0b' : '#22c55e'
                                        }}
                                    />
                                </div>
                                {request.slaBreached && request.delayReason && (
                                    <div className="delay-reason-display">
                                        <AlertCircle size={12} />
                                        <span>Delay: {request.delayReason}</span>
                                    </div>
                                )}
                                {request.slaBreached && !request.delayReason && (
                                    <button 
                                        className="add-delay-reason-btn"
                                        onClick={() => {
                                            setViewingRequest(request);
                                            setShowDelayModal(true);
                                        }}
                                    >
                                        <FileText size={12} />
                                        Add Delay Reason
                                    </button>
                                )}
                            </div>

                            {/* Visual Lifecycle Timeline */}
                            <div className="lifecycle-timeline">
                                {lifecycleStages.map((stage, idx) => {
                                    const isCompleted = idx < currentStageIndex || (idx === currentStageIndex && request.status === stage.key);
                                    const isCurrent = idx === currentStageIndex;
                                    const StageIcon = stage.icon;
                                    
                                    return (
                                        <div key={stage.key} className="lifecycle-step-wrapper">
                                            <div className={`lifecycle-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                                                <StageIcon size={14} />
                                                <span className="lifecycle-label">{stage.label}</span>
                                            </div>
                                            {idx < lifecycleStages.length - 1 && (
                                                <div className={`lifecycle-connector ${isCompleted ? 'completed' : ''}`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Lifecycle Events Detail */}
                            {request.lifecycle && request.lifecycle.length > 0 && (
                                <details className="lifecycle-details">
                                    <summary className="lifecycle-summary">
                                        <Activity size={12} />
                                        View Timeline ({request.lifecycle.length} events)
                                    </summary>
                                    <div className="lifecycle-events">
                                        {request.lifecycle.slice().reverse().map((event, idx) => (
                                            <div key={idx} className="lifecycle-event">
                                                <div className="lifecycle-event-time">
                                                    {new Date(event.timestamp).toLocaleString()}
                                                </div>
                                                <div className="lifecycle-event-content">
                                                    <strong>{event.status}</strong>
                                                    <p>{event.details}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}

                            <div className="request-footer mt-2 pt-2 border-t border-gray-100">
                                <span className={`status-text ${request.status} text-xs font-semibold flex items-center gap-1`}>
                                    {request.status === 'pending' && <Clock size={12} />}
                                    {request.status === 'matched' && <CheckCircle2 size={12} />}
                                    {request.status.toUpperCase()}
                                </span>
                                <span className="req-id text-xs text-gray-400">#{request.requestId?.slice(-6) || '---'}</span>
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

            {/* Delay Reason Modal */}
            {showDelayModal && (
                <div className="modal-overlay">
                    <motion.div 
                        className="modal-content"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <div className="modal-header">
                            <h2>Capture Delay Reason</h2>
                            <button onClick={() => {
                                setShowDelayModal(false);
                                setDelayReason('');
                                setViewingRequest(null);
                            }}>
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleDelayReasonSubmit}>
                            <div className="form-section">
                                <label>Request ID: {viewingRequest?.requestId || viewingRequest?._id.slice(-6)}</label>
                                <label>Delay Reason *</label>
                                <textarea
                                    className="full-width"
                                    rows="4"
                                    placeholder="Explain the reason for SLA breach (e.g., Donor unavailability, Medical complications, Transport delays, etc.)"
                                    value={delayReason}
                                    onChange={(e) => setDelayReason(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="cancel-btn" 
                                    onClick={() => {
                                        setShowDelayModal(false);
                                        setDelayReason('');
                                        setViewingRequest(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">Submit</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Requests;
