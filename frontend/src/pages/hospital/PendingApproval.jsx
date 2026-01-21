import React from 'react';
import { Clock } from 'lucide-react';

const PendingApproval = () => {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <div style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '24px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    background: '#fff7ed',
                    padding: '1rem',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    marginBottom: '1.5rem'
                }}>
                    <Clock size={48} color="#ea580c" />
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>Registration Pending</h1>
                <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 2rem' }}>
                    Your hospital registration has been submitted and is currently under review by the Administration.
                    You will receive an email notification once your account is approved.
                </p>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                    Application ID: {localStorage.getItem('hospital') ? JSON.parse(localStorage.getItem('hospital')).id : '---'}
                </div>
                <button
                    onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                    style={{
                        marginTop: '2rem',
                        background: 'none',
                        border: '1px solid #e2e8f0',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default PendingApproval;
