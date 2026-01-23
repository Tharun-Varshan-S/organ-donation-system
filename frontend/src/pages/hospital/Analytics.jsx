import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    Clock,
    CheckCircle,
    Users,
    BarChart3,
    Calendar
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import './Analytics.css';

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30');

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/hospital/analytics?period=${period}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAnalytics(data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state">Loading Analytics...</div>;
    if (!analytics) return <div className="error-state">Failed to load analytics</div>;

    const slaComplianceData = [
        { name: 'On Time', value: analytics.slaCompliance.onTime || 0 },
        { name: 'Breached', value: analytics.slaCompliance.breached || 0 }
    ];

    const successRateByOrgan = analytics.successRates?.byOrgan || [];
    const donorConversionData = [
        { name: 'Active/Matched', value: (analytics.donorConversion.active || 0) + (analytics.donorConversion.matched || 0) },
        { name: 'Inactive', value: (analytics.donorConversion.total || 0) - (analytics.donorConversion.active || 0) - (analytics.donorConversion.matched || 0) }
    ];

    const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <div>
                    <h2>Hospital Analytics & Reports</h2>
                    <p className="text-gray-500">Comprehensive performance metrics and compliance reports</p>
                </div>
                <div className="period-selector">
                    <Calendar size={18} />
                    <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="metrics-cards-grid">
                <motion.div
                    className="metric-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="metric-icon sla">
                        <Clock size={24} />
                    </div>
                    <div className="metric-content">
                        <div className="metric-value">{analytics.slaCompliance.rate}%</div>
                        <div className="metric-label">SLA Compliance Rate</div>
                        <div className="metric-details">
                            {analytics.slaCompliance.onTime} on time / {analytics.slaCompliance.total} total
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="metric-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="metric-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="metric-content">
                        <div className="metric-value">{analytics.successRates.overall}%</div>
                        <div className="metric-label">Overall Success Rate</div>
                        <div className="metric-details">
                            Across all organ types
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="metric-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="metric-icon conversion">
                        <Users size={24} />
                    </div>
                    <div className="metric-content">
                        <div className="metric-value">{analytics.donorConversion.rate}%</div>
                        <div className="metric-label">Donor Conversion Rate</div>
                        <div className="metric-details">
                            {analytics.donorConversion.active + analytics.donorConversion.matched} active / {analytics.donorConversion.total} total
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                {/* SLA Compliance Chart */}
                <motion.div
                    className="chart-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="chart-header">
                        <Clock size={20} />
                        <h3>SLA Compliance Breakdown</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={slaComplianceData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {slaComplianceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-footer">
                        <div className="chart-stat">
                            <span className="stat-label">Breached:</span>
                            <span className="stat-value breached">{analytics.slaCompliance.breached}</span>
                        </div>
                        <div className="chart-stat">
                            <span className="stat-label">On Time:</span>
                            <span className="stat-value success">{analytics.slaCompliance.onTime}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Success Rate by Organ */}
                <motion.div
                    className="chart-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="chart-header">
                        <BarChart3 size={20} />
                        <h3>Success Rate by Organ Type</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={successRateByOrgan}>
                            <XAxis dataKey="organType" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Bar dataKey="rate" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="chart-footer">
                        {successRateByOrgan.map((item, idx) => (
                            <div key={idx} className="chart-stat">
                                <span className="stat-label">{item.organType}:</span>
                                <span className="stat-value">{item.rate}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Donor Conversion */}
                <motion.div
                    className="chart-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="chart-header">
                        <TrendingUp size={20} />
                        <h3>Donor Conversion</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={donorConversionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {donorConversionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#94a3b8'} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-footer">
                        <div className="chart-stat">
                            <span className="stat-label">Total Donors:</span>
                            <span className="stat-value">{analytics.donorConversion.total}</span>
                        </div>
                        <div className="chart-stat">
                            <span className="stat-label">Active/Matched:</span>
                            <span className="stat-value success">{analytics.donorConversion.active + analytics.donorConversion.matched}</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Detailed Report Table */}
            <motion.div
                className="report-table-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="table-header">
                    <h3>Success Rate by Organ Type - Detailed</h3>
                </div>
                <table className="analytics-table">
                    <thead>
                        <tr>
                            <th>Organ Type</th>
                            <th>Total Transplants</th>
                            <th>Successful</th>
                            <th>Success Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {successRateByOrgan.length > 0 ? (
                            successRateByOrgan.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="organ-type-cell">{item.organType}</td>
                                    <td>{item.total}</td>
                                    <td>{item.successful}</td>
                                    <td>
                                        <div className="rate-cell">
                                            <span className="rate-value">{item.rate}%</span>
                                            <div className="rate-bar">
                                                <div
                                                    className="rate-fill"
                                                    style={{
                                                        width: `${item.rate}%`,
                                                        backgroundColor: parseFloat(item.rate) >= 90 ? '#22c55e' : parseFloat(item.rate) >= 70 ? '#f59e0b' : '#ef4444'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="no-data">No transplant data available for this period</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
};

export default Analytics;

