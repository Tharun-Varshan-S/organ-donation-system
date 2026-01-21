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
    Stethoscope
} from 'lucide-react';
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
    }, [navigate]);

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
                </header>

                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default HospitalLayout;
