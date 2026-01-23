import React, { useEffect, useState } from 'react';
import {
    Users,
    Activity,
    CheckCircle,
    AlertTriangle,
    ArrowUpRight,
    Heart,
    Clock,
    Shield,
    TrendingUp,
    AlertCircle as AlertCircleIcon,
    Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';
import './Dashboard.css';

const HospitalDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
        // Refresh every 30 seconds for real-time updates
        const interval = setInterval(fetchDashboardStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/hospital/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state">Loading Dashboard...</div>;
    if (!stats) return <div className="error-state">Failed to load stats</div>;

    const kpiData = [
        {
            title: 'Critical Alerts',
            value: stats.requests.emergency,
            icon: AlertTriangle,
            color: 'red',
            sub: `${stats.requests.emergencyLocked || 0} Locked`,
            trend: stats.requests.emergency > 0 ? 'Action Required' : 'Clear',
            alert: stats.requests.emergency > 0
        },
        {
            title: 'Active Requests',
            value: stats.requests.active,
            icon: Activity,
            color: 'indigo',
            sub: `${stats.requests.slaBreached || 0} SLA Breached`,
            trend: stats.requests.slaBreached > 0 ? 'Risk' : 'Stable',
            alert: stats.requests.slaBreached > 0
        },
        {
            title: 'Donors',
            value: stats.donors.total,
            icon: Users,
            color: 'blue',
            sub: `${stats.donors.active} Active, ${stats.donors.emergencyEligible || 0} Emergency`,
            trend: `${stats.donors.unavailable || 0} Unavailable`
        },
        {
            title: 'Success Rate',
            value: `${stats.transplants.successRate || 0}%`,
            icon: CheckCircle,
            color: 'green',
            sub: `${stats.transplants.successful || 0}/${stats.transplants.completed || 0} Successful`,
            trend: stats.transplants.successRate >= 90 ? 'Excellent' : stats.transplants.successRate >= 70 ? 'Good' : 'Needs Improvement'
        }
    ];

    const slaHealthStatus = stats.slaHealth?.complianceRate >= 90 ? 'excellent' : 
                           stats.slaHealth?.complianceRate >= 70 ? 'good' : 'critical';

    const donorStatusData = [
        { name: 'Active', value: stats.donors.active, color: '#0ea5e9' },
        { name: 'Unavailable', value: stats.donors.unavailable || 0, color: '#f59e0b' },
        { name: 'Deceased', value: stats.donors.deceased, color: '#64748b' }
    ];

    const urgencyData = [
        { name: 'Normal/High', value: stats.requests.active - stats.requests.emergency, color: '#818cf8' },
        { name: 'Critical', value: stats.requests.emergency, color: '#ef4444' }
    ];

    return (
        <div className="hospital-dashboard">
            {/* Emergency Focus Banner */}
            {stats.requests.emergency > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="emergency-banner"
                >
                    <div className="emergency-banner-content">
                        <div className="emergency-icon-wrapper">
                            <AlertTriangle size={28} />
                        </div>
                        <div className="emergency-text">
                            <h2 className="emergency-title">EMERGENCY PROTOCOL ACTIVE</h2>
                            <p className="emergency-description">
                                {stats.requests.emergency} critical request(s) locked to emergency mode. 
                                {stats.requests.emergencyLocked > 0 && ` ${stats.requests.emergencyLocked} auto-escalated to Admin.`}
                            </p>
                            {stats.criticalRequests && stats.criticalRequests.length > 0 && (
                                <div className="emergency-requests-list">
                                    {stats.criticalRequests.slice(0, 3).map((req, idx) => (
                                        <span key={idx} className="emergency-request-tag">
                                            {req.requestId || req._id.slice(-6)}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button 
                            className="emergency-action-btn"
                            onClick={() => window.location.href = '#/hospital/requests'}
                        >
                            View All
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Operational Readiness Widget */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="operational-readiness-widget"
            >
                <div className="readiness-header">
                    <Shield size={20} />
                    <h3>Operational Readiness</h3>
                </div>
                <div className="readiness-grid">
                    <div className={`readiness-item ${stats.operationalReadiness?.emergencyReady ? 'ready' : 'not-ready'}`}>
                        <Zap size={16} />
                        <span>Emergency Ready: {stats.operationalReadiness?.emergencyReady ? 'Yes' : 'No'}</span>
                    </div>
                    <div className={`readiness-item ${stats.operationalReadiness?.slaHealth === 'excellent' ? 'ready' : stats.operationalReadiness?.slaHealth === 'good' ? 'warning' : 'not-ready'}`}>
                        <TrendingUp size={16} />
                        <span>SLA Health: {stats.operationalReadiness?.slaHealth || 'unknown'}</span>
                    </div>
                    <div className={`readiness-item ${stats.operationalReadiness?.donorAvailability === 'available' ? 'ready' : 'not-ready'}`}>
                        <Users size={16} />
                        <span>Donor Availability: {stats.operationalReadiness?.donorAvailability || 'unknown'}</span>
                    </div>
                </div>
            </motion.div>

            {/* SLA Health Indicator */}
            {stats.slaHealth && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sla-health-indicator"
                >
                    <div className="sla-header">
                        <Clock size={20} />
                        <h3>SLA Health Monitor</h3>
                    </div>
                    <div className="sla-content">
                        <div className="sla-compliance">
                            <div className="sla-compliance-value">
                                {stats.slaHealth.complianceRate}%
                            </div>
                            <div className="sla-compliance-label">Compliance Rate</div>
                        </div>
                        <div className="sla-breakdown">
                            <div className="sla-stat">
                                <span className="sla-stat-label">Active Requests</span>
                                <span className="sla-stat-value">{stats.slaHealth.totalActive}</span>
                            </div>
                            <div className="sla-stat">
                                <span className="sla-stat-label">Breached</span>
                                <span className="sla-stat-value breached">{stats.slaHealth.breached}</span>
                            </div>
                            <div className="sla-stat">
                                <span className="sla-stat-label">At Risk</span>
                                <span className="sla-stat-value at-risk">{stats.slaHealth.atRisk}</span>
                            </div>
                        </div>
                    </div>
                    <div className="sla-progress-bar">
                        <div 
                            className={`sla-progress-fill ${slaHealthStatus}`}
                            style={{ width: `${stats.slaHealth.complianceRate}%` }}
                        />
                    </div>
                </motion.div>
            )}

            <motion.div
                className="kpi-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {kpiData.map((kpi, index) => (
                    <div key={index} className={`kpi-card ${kpi.alert ? 'alert-card' : ''} ${kpi.color}`}>
                        <div className="kpi-header">
                            <span className="kpi-title">{kpi.title}</span>
                            <div className={`kpi-icon-wrapper bg-${kpi.color}-100`}>
                                <kpi.icon size={20} className={`text-${kpi.color}-600`} />
                            </div>
                        </div>
                        <div className="kpi-body">
                            <h2 className="kpi-value">{kpi.value}</h2>
                            <div className="kpi-meta">
                                <span className="kpi-sub">{kpi.sub}</span>
                                <span className={`kpi-trend ${kpi.alert ? 'text-red-500' : 'text-green-500'}`}>
                                    {kpi.alert && <AlertTriangle size={12} style={{ marginRight: 4 }} />}
                                    {kpi.trend}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>

            <div className="charts-section">
                <motion.div
                    className="chart-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h3>Donor Statistics</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={donorStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {donorStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div
                    className="chart-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h3>Request Urgency</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={urgencyData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8">
                                {urgencyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            <div className="charts-section">
                <motion.div
                    className="notifications-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3>Recent Alerts</h3>
                    <div className="notification-list">
                        {stats.requests.emergency > 0 && (
                            <div className="notification-item critical">
                                <AlertTriangle size={18} />
                                <div>
                                    <h4>Critical Request Pending</h4>
                                    <p>You have {stats.requests.emergency} request(s) marked as critical.</p>
                                </div>
                            </div>
                        )}
                        {stats.donors.total === 0 && (
                            <div className="notification-item info">
                                <Heart size={18} />
                                <div>
                                    <h4>Start Registering Donors</h4>
                                    <p>Your donor database is empty. Register donors to begin.</p>
                                </div>
                            </div>
                        )}
                        {!stats.requests.emergency && stats.donors.total > 0 && (
                            <div className="notification-item success">
                                <CheckCircle size={18} />
                                <div>
                                    <h4>All Systems Nominal</h4>
                                    <p>Operations are running smoothly.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    className="recent-activity-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3>Recent Activity</h3>
                    {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                        <div className="activity-list">
                            {stats.recentActivity.map((activity, index) => (
                                <div key={index} className="activity-item">
                                    <div className="activity-icon">
                                        <Activity size={16} />
                                    </div>
                                    <div className="activity-content">
                                        <h4>{activity.details}</h4>
                                        <p>{activity.actionType} • {activity.entityType}</p>
                                    </div>
                                    <span className="activity-time">
                                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-activity">No recent activity</div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default HospitalDashboard;
