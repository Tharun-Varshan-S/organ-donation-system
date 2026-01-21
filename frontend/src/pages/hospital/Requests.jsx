import React, { useEffect, useState } from 'react';
import {
    Plus,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import './Requests.css';

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

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

    const calculateSLA = (createdAt, urgency) => {
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

        if (remaining < 0) return { text: 'Breached', color: 'red' };
        return { text: `${Math.round(remaining)}h remaining`, color: remaining < 5 ? 'orange' : 'green' };
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
                    const sla = calculateSLA(request.createdAt, request.patient.urgencyLevel);

                    return (
                        <motion.div
                            key={request._id}
                            className={`request-card ${getUrgencyColor(request.patient.urgencyLevel)}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
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

                            <div className="sla-timer" style={{ color: sla.color === 'red' ? '#ef4444' : sla.color === 'orange' ? '#f97316' : '#22c55e' }}>
                                <Clock size={14} />
                                <span>{sla.text}</span>
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
        </div>
    );
};

export default Requests;
