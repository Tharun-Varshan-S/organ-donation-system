import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Activity, ArrowRight, FileText, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import './Transplants.css';

const Transplants = () => {
    const [transplants, setTransplants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedTransplant, setSelectedTransplant] = useState(null);
    const [outcomeData, setOutcomeData] = useState({
        success: null,
        complications: [],
        notes: '',
        followUpRequired: true
    });
    const [successMetrics, setSuccessMetrics] = useState(null);

    useEffect(() => {
        fetchTransplants();
        fetchSuccessMetrics();
    }, []);

    const fetchSuccessMetrics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/hospital/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.data.stats) {
                setSuccessMetrics(data.data.stats);
            }
        } catch (error) {
            console.error('Error fetching success metrics:', error);
        }
    };

    const fetchTransplants = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/hospital/transplants', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setTransplants(data.data);
            }
        } catch (error) {
            console.error('Error fetching transplants:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/hospital/transplants/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchTransplants();
            fetchSuccessMetrics();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const openOutcomeModal = (transplant) => {
        setSelectedTransplant(transplant);
        setOutcomeData({
            success: transplant.outcome?.success ?? null,
            complications: transplant.outcome?.complications || [],
            notes: transplant.outcome?.notes || '',
            followUpRequired: transplant.outcome?.followUpRequired ?? true
        });
        setShowOutcomeModal(true);
    };

    const handleOutcomeSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/hospital/transplants/${selectedTransplant._id}/outcome`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(outcomeData)
            });

            const data = await response.json();
            if (data.success) {
                fetchTransplants();
                fetchSuccessMetrics();
                setShowOutcomeModal(false);
                setSelectedTransplant(null);
            }
        } catch (error) {
            console.error('Error updating outcome:', error);
        }
    };

    const addComplication = (complication) => {
        if (complication && !outcomeData.complications.includes(complication)) {
            setOutcomeData({
                ...outcomeData,
                complications: [...outcomeData.complications, complication]
            });
        }
    };

    const removeComplication = (index) => {
        setOutcomeData({
            ...outcomeData,
            complications: outcomeData.complications.filter((_, i) => i !== index)
        });
    };

    if (loading) return <div>Loading operations...</div>;

    return (
        <div className="transplants-page">
            <div className="page-header">
                <div>
                    <h2>Transplant Operations</h2>
                    <p className="text-gray-500">Track and log post-transplant outcomes</p>
                </div>
                {successMetrics && (
                    <div className="success-metrics-card">
                        <div className="metric-item">
                            <TrendingUp size={20} />
                            <div>
                                <span className="metric-label">Success Rate</span>
                                <span className="metric-value">{successMetrics.successRate || 0}%</span>
                            </div>
                        </div>
                        <div className="metric-item">
                            <CheckCircle size={20} />
                            <div>
                                <span className="metric-label">Successful</span>
                                <span className="metric-value">{successMetrics.successfulTransplants || 0}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="transplants-list">
                {transplants.length === 0 ? <div className="empty-state">No active transplant records</div> :
                    transplants.map(tx => (
                        <div key={tx._id} className="transplant-row">
                            <div className="tx-info">
                                <div className="tx-main">
                                    <span className="organ-tag">{tx.organType || 'Organ'}</span>
                                    <h4>{tx.recipient?.name || 'Recipient'}</h4>
                                </div>
                                <div className="tx-details">
                                    <span>Donor: {tx.donor?.personalInfo?.firstName || 'N/A'}</span>
                                    <span>Date: {tx.surgeryDate ? new Date(tx.surgeryDate).toLocaleDateString() : tx.surgeryDetails?.scheduledDate ? new Date(tx.surgeryDetails.scheduledDate).toLocaleDateString() : 'TBD'}</span>
                                </div>
                            </div>

                            <div className="tx-status-flow">
                                {['scheduled', 'in-progress', 'completed'].map((step, idx) => {
                                    const isCurrent = tx.status === step;
                                    const isPast = ['scheduled', 'in-progress', 'completed'].indexOf(tx.status) > idx;

                                    return (
                                        <div
                                            key={step}
                                            className={`status-step ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}
                                            onClick={() => updateStatus(tx._id, step)}
                                        >
                                            {step.replace('-', ' ')}
                                        </div>
                                    );
                                })}
                            </div>

                            {tx.status === 'completed' && (
                                <div className="tx-outcome-section">
                                    {tx.outcome?.success !== null ? (
                                        <div className={`outcome-display ${tx.outcome.success ? 'success' : 'failed'}`}>
                                            <CheckCircle size={16} />
                                            <span>Outcome: {tx.outcome.success ? 'Successful' : 'Failed'}</span>
                                            {tx.outcome.complications && tx.outcome.complications.length > 0 && (
                                                <span className="complications-count">
                                                    {tx.outcome.complications.length} complication(s)
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            className="log-outcome-btn"
                                            onClick={() => openOutcomeModal(tx)}
                                        >
                                            <FileText size={14} />
                                            Log Outcome
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                }
            </div>

            {/* Outcome Logging Modal */}
            {showOutcomeModal && selectedTransplant && (
                <div className="modal-overlay" onClick={() => setShowOutcomeModal(false)}>
                    <motion.div
                        className="modal-content"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Log Post-Transplant Outcome</h2>
                            <button onClick={() => setShowOutcomeModal(false)}>
                                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>
                        <form onSubmit={handleOutcomeSubmit}>
                            <div className="form-section">
                                <h3>Transplant Details</h3>
                                <p><strong>ID:</strong> {selectedTransplant.transplantId}</p>
                                <p><strong>Organ:</strong> {selectedTransplant.organType}</p>
                                <p><strong>Recipient:</strong> {selectedTransplant.recipient?.name || 'N/A'}</p>
                                <p><strong>Age:</strong> {selectedTransplant.recipient?.age || 'N/A'}</p>
                                <p><strong>Blood Type:</strong> {selectedTransplant.recipient?.bloodType || 'N/A'}</p>
                            </div>

                            <div className="form-section">
                                <h3>Outcome</h3>
                                <div className="outcome-radio-group">
                                    <label className="outcome-radio">
                                        <input
                                            type="radio"
                                            name="success"
                                            value="true"
                                            checked={outcomeData.success === true}
                                            onChange={() => setOutcomeData({ ...outcomeData, success: true })}
                                        />
                                        <CheckCircle size={20} />
                                        <span>Successful</span>
                                    </label>
                                    <label className="outcome-radio">
                                        <input
                                            type="radio"
                                            name="success"
                                            value="false"
                                            checked={outcomeData.success === false}
                                            onChange={() => setOutcomeData({ ...outcomeData, success: false })}
                                        />
                                        <AlertCircle size={20} />
                                        <span>Failed</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Complications</h3>
                                <div className="complications-input">
                                    <input
                                        type="text"
                                        placeholder="Add complication..."
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addComplication(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>
                                {outcomeData.complications.length > 0 && (
                                    <div className="complications-list">
                                        {outcomeData.complications.map((comp, idx) => (
                                            <span key={idx} className="complication-tag">
                                                {comp}
                                                <button
                                                    type="button"
                                                    onClick={() => removeComplication(idx)}
                                                    className="remove-tag"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="form-section">
                                <h3>Notes</h3>
                                <textarea
                                    className="full-width"
                                    rows={4}
                                    placeholder="Additional notes about the outcome..."
                                    value={outcomeData.notes}
                                    onChange={(e) => setOutcomeData({ ...outcomeData, notes: e.target.value })}
                                />
                            </div>

                            <div className="form-section">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={outcomeData.followUpRequired}
                                        onChange={(e) => setOutcomeData({ ...outcomeData, followUpRequired: e.target.checked })}
                                    />
                                    Follow-up required
                                </label>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowOutcomeModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn" disabled={outcomeData.success === null}>
                                    Save Outcome
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Transplants;
