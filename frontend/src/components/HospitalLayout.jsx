import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Activity,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Stethoscope,
    Bell,
    BarChart3
} from 'lucide-react';
import apiService from '../services/api';
import { motion } from 'framer-motion';
import './HospitalLayout.css';

const HospitalLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [hospital, setHospital] = useState(null);

    useEffect(() => {
        const storedHospital = localStorage.getItem('hospital');
        const token = localStorage.getItem('token'); // Assuming generic token key or 'hospitalToken'

        if (!storedHospital || !token) {
            navigate('/login');
            return;
        }

        const parsedHospital = JSON.parse(storedHospital);
        setHospital(parsedHospital);

        if (parsedHospital.status !== 'approved') {
            navigate('/hospital/pending-approval');
        }

        fetchNotifications();
        // Poll for notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [navigate]);

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const data = await apiService.getHospitalNotifications();
            if (data.success) {
                // Sort notifications: critical/unread first, then by date
                const sorted = data.data.sort((a, b) => {
                    // Critical alerts first
                    if (a.priority === 'critical' && b.priority !== 'critical') return -1;
                    if (b.priority === 'critical' && a.priority !== 'critical') return 1;
                    // Unread first
                    if (!a.read && b.read) return -1;
                    if (a.read && !b.read) return 1;
                    // Then by date
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                setNotifications(sorted);
                const unread = sorted.filter(n => !n.read);
                const criticalUnread = unread.filter(n => n.priority === 'critical' || n.type === 'EMERGENCY');
                setUnreadCount(unread.length);
                // Persist critical unread alerts count
                if (criticalUnread.length > 0) {
                    localStorage.setItem('criticalAlertsCount', criticalUnread.length.toString());
                }
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await apiService.markNotificationRead(id);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('hospital');
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!hospital) return null; // Or loading spinner

    const navItems = [
        { name: 'Dashboard', path: '/hospital/dashboard', icon: LayoutDashboard },
        { name: 'Donor Management', path: '/hospital/donors', icon: Users },
        { name: 'Organ Requests', path: '/hospital/requests', icon: Activity }, // Activity or HeartPulse
        { name: 'Transplants', path: '/hospital/transplants', icon: Stethoscope },
        { name: 'Analytics', path: '/hospital/analytics', icon: BarChart3 },
        { name: 'Profile & Settings', path: '/hospital/profile', icon: Settings },
    ];

    return (
        <div className="hospital-layout">
            {/* Mobile Overlay */}
            {!sidebarOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                className={`hospital-sidebar ${sidebarOpen ? 'open' : 'closed'}`}
                initial={{ x: -250 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="sidebar-header">
                    <div className="logo-area">
                        <Activity className="logo-icon" size={28} />
                        <span className="logo-text">LifeBridge</span>
                    </div>
                    <button className="close-btn" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <div className="hospital-info-card">
                    <div className="hospital-avatar">
                        {hospital.name.charAt(0)}
                    </div>
                    <div className="hospital-details">
                        <p className="name">{hospital.name}</p>
                        <span className="status-badge approved">Approved</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                                {isActive && <motion.div layoutId="active-pill" className="active-pill" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="hospital-main">
                <header className="top-header">
                    <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <Menu size={24} />
                    </button>
                    <h1 className="page-title">
                        {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
                    </h1>

                    <div className="header-actions">
                        <div className="notification-wrapper">
                            <button
                                className="notification-btn"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                            </button>

                            {showNotifications && (
                                <div className="notification-dropdown">
                                    <div className="notification-header">
                                        <h3>Notifications</h3>
                                        <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                                    </div>
                                    <div className="notification-body">
                                        {notifications.length === 0 ? (
                                            <p className="no-notifications">No notifications</p>
                                        ) : (
                                            <>
                                                {/* Critical/Emergency Notifications */}
                                                {notifications.filter(n => (n.priority === 'critical' || n.type === 'EMERGENCY') && !n.read).length > 0 && (
                                                    <div className="notification-category">
                                                        <h4 className="category-title critical">Critical Alerts</h4>
                                                        {notifications
                                                            .filter(n => (n.priority === 'critical' || n.type === 'EMERGENCY') && !n.read)
                                                            .map(n => (
                                                                <div key={n._id} className="notification-card critical unread">
                                                                    <div className="notif-content">
                                                                        <div className="notif-header">
                                                                            <h4>{n.title}</h4>
                                                                            <span className="notif-type-badge critical">{n.type}</span>
                                                                        </div>
                                                                        <p>{n.message}</p>
                                                                        <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                                                                    </div>
                                                                    <button
                                                                        className="mark-read-btn"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleMarkAsRead(n._id);
                                                                        }}
                                                                        title="Mark as read"
                                                                    >
                                                                        <div className="dot" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}
                                                
                                                {/* Other Notifications */}
                                                {notifications.filter(n => !((n.priority === 'critical' || n.type === 'EMERGENCY') && !n.read)).length > 0 && (
                                                    <div className="notification-category">
                                                        {notifications.filter(n => (n.priority === 'critical' || n.type === 'EMERGENCY') && !n.read).length > 0 && (
                                                            <h4 className="category-title">Other Notifications</h4>
                                                        )}
                                                        {notifications
                                                            .filter(n => !((n.priority === 'critical' || n.type === 'EMERGENCY') && !n.read))
                                                            .map(n => (
                                                                <div key={n._id} className={`notification-card ${!n.read ? 'unread' : ''} ${n.type?.toLowerCase() || 'info'}`}>
                                                                    <div className="notif-content">
                                                                        <div className="notif-header">
                                                                            <h4>{n.title}</h4>
                                                                            <span className={`notif-type-badge ${n.type?.toLowerCase() || 'info'}`}>{n.type || 'INFO'}</span>
                                                                        </div>
                                                                        <p>{n.message}</p>
                                                                        <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                                                                    </div>
                                                                    {!n.read && (
                                                                        <button
                                                                            className="mark-read-btn"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleMarkAsRead(n._id);
                                                                            }}
                                                                            title="Mark as read"
                                                                        >
                                                                            <div className="dot" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default HospitalLayout;
