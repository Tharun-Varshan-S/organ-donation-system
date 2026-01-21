import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Activity, ArrowRight } from 'lucide-react';
import './Transplants.css';

const Transplants = () => {
    const [transplants, setTransplants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransplants();
    }, []);

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
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) return <div>Loading operations...</div>;

    return (
        <div className="transplants-page">
            <h2>Transplant Operations</h2>
            <div className="transplants-list">
                {transplants.length === 0 ? <div className="empty-state">No active transplant records</div> :
                    transplants.map(tx => (
                        <div key={tx._id} className="transplant-row">
                            <div className="tx-info">
                                <div className="tx-main">
                                    <span className="organ-tag">{tx.organType || 'Organ'}</span>
                                    <h4>{tx.recipient?.patient?.name || 'Recipient'}</h4>
                                </div>
                                <div className="tx-details">
                                    <span>Donor: {tx.donor?.personalInfo?.firstName}</span>
                                    <span>Date: {new Date(tx.surgeryDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="tx-status-flow">
                                {['scheduled', 'in_progress', 'completed'].map((step, idx) => {
                                    const isCurrent = tx.status === step;
                                    const isPast = ['scheduled', 'in_progress', 'completed'].indexOf(tx.status) > idx;

                                    return (
                                        <div
                                            key={step}
                                            className={`status-step ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}
                                            onClick={() => updateStatus(tx._id, step)}
                                        >
                                            {step.replace('_', ' ')}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default Transplants;
