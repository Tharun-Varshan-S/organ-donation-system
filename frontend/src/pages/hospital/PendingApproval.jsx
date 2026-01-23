import React from 'react';
import { Clock, XCircle, AlertTriangle } from 'lucide-react';

const PendingApproval = () => {
    const hospital = JSON.parse(localStorage.getItem('hospital') || '{}');
    const status = hospital.status || 'pending';

    const renderContent = () => {
        switch (status) {
            case 'rejected':
                return {
                    title: 'Registration Rejected',
                    message: 'Your application has been rejected by the administrator. Please contact support for more details.',
                    color: '#ef4444',
                    bg: '#fef2f2',
                    Icon: XCircle
                };
            case 'suspended':
                return {
                    title: 'Account Suspended',
                    message: 'Your hospital account has been suspended due to compliance issues.',
                    color: '#ef4444',
                    bg: '#fef2f2',
                    Icon: AlertTriangle
                };
            default:
                return {
                    title: 'Registration Pending',
                    message: 'Your hospital registration has been submitted and is currently under review by the Administration. You will be notified upon approval.',
                    color: '#ea580c',
                    bg: '#fff7ed',
                    Icon: Clock
                };
        }
    };

    const content = renderContent();
    const Icon = content.Icon;

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
                    background: content.bg,
                    padding: '1rem',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    marginBottom: '1.5rem'
                }}>
                    <Icon size={48} color={content.color} />
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>{content.title}</h1>
                <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 2rem' }}>
                    {content.message}
                </p>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                    Application ID: {hospital.id || 'N/A'}
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
