import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Activity, ArrowRight, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import './Transplants.css';

const Transplants = () => {
    const [transplants, setTransplants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successMetrics, setSuccessMetrics] = useState(null);

    useEffect(() => {
        fetchTransplants();
    }, []);

    const fetchTransplants = async () => {
        try {
            const token = localStorage.getItem('token');
            const [transplantsRes, dashboardRes] = await Promise.all([
                fetch('http://localhost:5000/api/hospital/transplants', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:5000/api/hospital/dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);
            
            const transplantsData = await transplantsRes.json();
            const dashboardData = await dashboardRes.json();
            
            if (transplantsData.success) {
                setTransplants(transplantsData.data);
            }
            
            if (dashboardData.success && dashboardData.data.transplants) {
                setSuccessMetrics(dashboardData.data.transplants);
            }
        } catch (error) {
            console.error('Error fetching transplants:', error);
        } finally {
            setLoading(false);
        }
    };

    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);
    const [outcomeData, setOutcomeData] = useState({
        success: true,
        survivalStatus: 'alive',
        organFunction: 'good',
        complications: [],
        followUpRequired: true,
        notes: ''
    });
    
    const complicationsOptions = [
        'Rejection', 'Infection', 'Bleeding', 'Thrombosis', 
        'Wound complications', 'Other'
    ];

    const updateStatus = async (id, newStatus) => {
        if (newStatus === 'completed') {
            const tx = transplants.find(t => t._id === id);
            setSelectedTx(tx);
            setShowOutcomeModal(true);
            return;
        }
        await performStatusUpdate(id, { status: newStatus });
    };

    const performStatusUpdate = async (id, payload) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/hospital/transplants/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            fetchTransplants();
            setShowOutcomeModal(false);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleOutcomeSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            status: 'completed',
            outcome: outcomeData
        };
        await performStatusUpdate(selectedTx._id, payload);
    };

    const handleComplicationToggle = (complication) => {
        setOutcomeData(prev => ({
            ...prev,
            complications: prev.complications.includes(complication)
                ? prev.complications.filter(c => c !== complication)
                : [...prev.complications, complication]
        }));
    };

    if (loading) return <div className="loading-state">Loading operations...</div>;

    return (
        <div className="transplants-page">
            <div className="page-header">
                <div>
                    <h2>Transplant Operations</h2>
                    <p className="text-gray-500">Manage transplant procedures and log outcomes</p>
                </div>
            </div>

            {/* Success Metrics Widget */}
            {successMetrics && (
                <div className="success-metrics-widget">
                    <div className="metrics-header">
                        <TrendingUp size={20} />
                        <h3>Hospital Success Metrics</h3>
                    </div>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <div className="metric-value">{successMetrics.successRate || 0}%</div>
                            <div className="metric-label">Success Rate</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-value">{successMetrics.successful || 0}</div>
                            <div className="metric-label">Successful</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-value">{successMetrics.completed || 0}</div>
                            <div className="metric-label">Total Completed</div>
                        </div>
                    </div>
                </div>
            )}
            <div className="transplants-list">
                {transplants.length === 0 ? <div className="empty-state">No active transplant records</div> :
                    transplants.map(tx => (
                        <div key={tx._id} className="transplant-row">
                            <div className="tx-info">
                                <div className="tx-main">
                                    <span className="organ-tag">{tx.organType || 'Organ'}</span>
                                    <h4>{tx.recipient?.name || tx.recipient?.patient?.name || 'Recipient'}</h4>
                                </div>
                                <div className="tx-details">
                                    <span>Donor: {tx.donor?.personalInfo?.firstName || 'N/A'}</span>
                                    <span>Date: {tx.surgeryDetails?.actualDate 
                                        ? new Date(tx.surgeryDetails.actualDate).toLocaleDateString()
                                        : tx.surgeryDetails?.scheduledDate 
                                        ? new Date(tx.surgeryDetails.scheduledDate).toLocaleDateString()
                                        : 'TBD'}</span>
                                    {tx.status === 'completed' && tx.outcome && (
                                        <div className="outcome-details">
                                            <span className={`outcome-badge ${tx.outcome.success ? 'success' : 'failure'}`}>
                                                {tx.outcome.success ? 'Success' : 'Failed'}
                                            </span>
                                            {tx.outcome.survivalStatus && (
                                                <span className="survival-status">
                                                    {tx.outcome.survivalStatus}
                                                </span>
                                            )}
                                            {tx.outcome.organFunction && (
                                                <span className="organ-function">
                                                    Function: {tx.outcome.organFunction}
                                                </span>
                                            )}
                                        </div>
                                    )}
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
                        </div>
                    ))
                }
            </div>

            {showOutcomeModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Log Transplant Outcome</h3>
                        <form onSubmit={handleOutcomeSubmit}>
                            <div className="form-group mb-4">
                                <label className="block mb-1 font-medium">Surgery Success *</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={outcomeData.success}
                                    onChange={e => setOutcomeData({ ...outcomeData, success: e.target.value === 'true' })}
                                    required
                                >
                                    <option value="true">Successful</option>
                                    <option value="false">Failed</option>
                                </select>
                            </div>
                            <div className="form-group mb-4">
                                <label className="block mb-1 font-medium">Patient Survival Status *</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={outcomeData.survivalStatus}
                                    onChange={e => setOutcomeData({ ...outcomeData, survivalStatus: e.target.value })}
                                    required
                                >
                                    <option value="alive">Alive & Stable</option>
                                    <option value="critical">Critical</option>
                                    <option value="deceased">Deceased</option>
                                </select>
                            </div>
                            <div className="form-group mb-4">
                                <label className="block mb-1 font-medium">Organ Function *</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={outcomeData.organFunction}
                                    onChange={e => setOutcomeData({ ...outcomeData, organFunction: e.target.value })}
                                    required
                                >
                                    <option value="good">Good Function</option>
                                    <option value="Fair">Fair / Delayed</option>
                                    <option value="poor">Poor Function</option>
                                    <option value="failed">Non-Functional</option>
                                </select>
                            </div>
                            <div className="form-group mb-4">
                                <label className="block mb-1 font-medium">Complications</label>
                                <div className="complications-grid">
                                    {complicationsOptions.map(comp => (
                                        <label key={comp} className="complication-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={outcomeData.complications.includes(comp)}
                                                onChange={() => handleComplicationToggle(comp)}
                                            />
                                            <span>{comp}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group mb-4">
                                <label className="complication-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={outcomeData.followUpRequired}
                                        onChange={e => setOutcomeData({ ...outcomeData, followUpRequired: e.target.checked })}
                                    />
                                    <span>Follow-up Required</span>
                                </label>
                            </div>
                            <div className="form-group mb-4">
                                <label className="block mb-1 font-medium">Clinical Notes</label>
                                <textarea
                                    className="w-full p-2 border rounded"
                                    rows="4"
                                    value={outcomeData.notes}
                                    onChange={e => setOutcomeData({ ...outcomeData, notes: e.target.value })}
                                    placeholder="Enter detailed post-op notes, observations, and recommendations..."
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" className="px-4 py-2 border rounded" onClick={() => {
                                    setShowOutcomeModal(false);
                                    setOutcomeData({
                                        success: true,
                                        survivalStatus: 'alive',
                                        organFunction: 'good',
                                        complications: [],
                                        followUpRequired: true,
                                        notes: ''
                                    });
                                }}>Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Finalize Outcome Log</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transplants;
