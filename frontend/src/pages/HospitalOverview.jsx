import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Phone, Mail, Clock, ShieldCheck,
    Activity, Bed, Truck, AlertCircle, ChevronLeft,
    Users, Heart, Zap, CheckCircle2, TrendingUp, History
} from 'lucide-react';
import Navbar from '../landing/components/Navbar';
import apiService from '../services/api';
import { getHospitalImage } from '../utils/mockImages';
import './HospitalOverview.css';

const HospitalOverview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hospital, setHospital] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Admin detailed endpoint
                const response = await apiService.getHospitalDetails(id);
                if (response.success) {
                    setHospital(response.data.hospital);
                    setStats(response.data.stats);
                    setRecentActivity(response.data.recentActivity || []);
                }
            } catch (err) {
                setError('Failed to load hospital details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="overview-loading">Loading hospital intelligence...</div>;
    if (!hospital) return <div className="overview-error">Hospital not found in ecosystem</div>;

    const image = getHospitalImage(hospital);

    return (
        <div className="hospital-overview-page">
            <Navbar />

            {/* Hero Banner */}
            <div className="overview-hero" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${image})` }}>
                <div className="hero-content-wrapper">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} /> Return to Dashboard
                    </button>

                    <div className="hospital-identity">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#1e293b] text-2xl font-black shadow-xl">
                                {hospital.name?.charAt(0)}
                            </div>
                            <div>
                                <h1 className="leading-none mb-2">{hospital.name}</h1>
                                <div className="hero-location opacity-80">
                                    <MapPin size={16} />
                                    {hospital.location?.city}, {hospital.location?.state}
                                </div>
                            </div>
                        </div>
                        <div className="hero-badges">
                            <span className="hero-badge verified"><ShieldCheck size={16} /> Verified Partner</span>
                            <span className={`hero-badge ${hospital.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}>
                                {hospital.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overview-layout max-w-[1400px] mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Stats Column */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Analytics Snapshot */}
                        <section className="detail-section">
                            <h2 className="text-2xl font-black text-[#1e293b] mb-6 flex items-center gap-3">
                                <Zap className="text-yellow-500" /> Activity Ecosystem
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="hospital-stat-card p-6 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col items-center text-center">
                                    <Users className="text-blue-600 mb-2" size={32} />
                                    <p className="text-3xl font-black text-[#1e293b]">{stats?.donorCount || 0}</p>
                                    <p className="text-xs font-bold text-blue-800 uppercase tracking-widest">Managed Donors</p>
                                </div>
                                <div className="hospital-stat-card p-6 bg-green-50 rounded-3xl border border-green-100 flex flex-col items-center text-center">
                                    <Heart className="text-green-600 mb-2" size={32} />
                                    <p className="text-3xl font-black text-[#1e293b]">{stats?.transplantStats?.successful || 0}</p>
                                    <p className="text-xs font-bold text-green-800 uppercase tracking-widest">Lives Saved</p>
                                </div>
                                <div className="hospital-stat-card p-6 bg-purple-50 rounded-3xl border border-purple-100 flex flex-col items-center text-center">
                                    <TrendingUp className="text-purple-600 mb-2" size={32} />
                                    <p className="text-3xl font-black text-[#1e293b]">{stats?.transplantStats?.successRate || 0}%</p>
                                    <p className="text-xs font-bold text-purple-800 uppercase tracking-widest">Success Rate</p>
                                </div>
                            </div>
                        </section>

                        {/* Recent Activity Timeline */}
                        <section className="detail-section">
                            <h2 className="text-2xl font-black text-[#1e293b] mb-6 flex items-center gap-3">
                                <History className="text-gray-500" /> Recent Activity Timeline
                            </h2>
                            <div className="space-y-4">
                                {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                                    <div key={i} className="flex gap-6 p-4 bg-white rounded-2xl border border-gray-100 items-center">
                                        <div className={`w-2 h-10 rounded-full ${activity.type === 'Request' ? 'bg-orange-400' : 'bg-green-400'}`}></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="font-black text-[#1e293b]">{activity.description}</p>
                                                <span className="text-[10px] font-bold text-[#94a3b8] uppercase">{new Date(activity.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-[#64748b]">Case ID: #{activity.id?.slice(-8).toUpperCase()} • Status: <span className="font-bold text-[#1e293b]">{activity.status}</span></p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                                        <p className="text-[#94a3b8] font-bold">No recent activities logged for this center.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Infrastructure Section */}
                        <section className="detail-section">
                            <h2 className="text-2xl font-black text-[#1e293b] mb-6">Medical Capacity</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Beds</p>
                                    <p className="text-xl font-black text-[#1e293b]">{hospital.capacity?.totalBeds || 0}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Available</p>
                                    <p className="text-xl font-black text-[#10b981]">{hospital.capacity?.availableBeds || 0}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ICU Units</p>
                                    <p className="text-xl font-black text-[#1e293b]">{hospital.capacity?.icuBeds || 0}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ventilators</p>
                                    <p className="text-xl font-black text-[#1e293b]">{hospital.capacity?.ventilators || 0}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Information */}
                    <div className="space-y-8">
                        <div className="bg-[#1e293b] text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                            <h3 className="text-lg font-black mb-6">Hospital Credentials</h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-white/10 rounded-xl"><Mail size={18} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Email Endpoint</p>
                                        <p className="text-sm font-bold truncate max-w-[180px]">{hospital.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="p-3 bg-white/10 rounded-xl"><Phone size={18} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Contact Lines</p>
                                        <p className="text-sm font-bold">{hospital.contactInfo?.phone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="p-3 bg-white/10 rounded-xl"><Activity size={18} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">License Number</p>
                                        <p className="text-sm font-bold">{hospital.licenseNumber}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-black text-[#1e293b] mb-4">Specializations</h3>
                            <div className="flex flex-wrap gap-2">
                                {hospital.specializations?.map((spec, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-gray-100 text-[#64748b] text-[10px] font-black uppercase rounded-lg">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalOverview;
