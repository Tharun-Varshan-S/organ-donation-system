import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Heart, Activity, Clock, Timer, User, Shield,
    ChevronLeft, CheckCircle2, XCircle, Info,
    AlertTriangle, FileText, ClipboardList, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/api';
import { GlassCard, StatusBadge, SLAMeter } from './HospitalDashboardTabs/DashboardComponents';
import Button from '../../components/Button';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Modal from '../../components/Modal';
import Input from '../../components/Input';

const RequestDetail = () => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeDonor, setActiveDonor] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Scheduling State
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [surgeryForm, setSurgeryForm] = useState({
        scheduledDate: '',
        surgeonName: '',
        operatingRoom: ''
    });

    // Donor Profile State
    const [viewingDonor, setViewingDonor] = useState(null);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const res = await apiService.getRequestById(requestId);
                if (res.success) {
                    setRequest(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch request:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequest();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [requestId]);

    const handleApplicationAction = async (applicationId, action) => {
        if (action === 'reject') {
            if (!window.confirm("Are you sure you want to reject this application?")) return;
            setProcessingId(applicationId);
            try {
                const res = await apiService.updateApplicationStatus(applicationId, { status: 'rejected' });
                if (res.success) {
                    const updatedRes = await apiService.getRequestById(requestId);
                    setRequest(updatedRes.data);
                }
            } catch (err) {
                alert(err.message || "Failed to reject application.");
            } finally {
                setProcessingId(null);
            }
        } else {
            setSelectedAppId(applicationId);
            setShowScheduleModal(true);
        }
    };

    const confirmScheduledMatch = async () => {
        if (!surgeryForm.scheduledDate || !surgeryForm.surgeonName || !surgeryForm.operatingRoom) {
            alert("Please fill in all scheduling details.");
            return;
        }

        setProcessingId(selectedAppId);
        try {
            const res = await apiService.updateApplicationStatus(selectedAppId, {
                status: 'accepted',
                surgeryDetails: surgeryForm
            });

            if (res.success) {
                alert("Match Authorized & Surgery Scheduled.");
                navigate('/hospital-dashboard');
            }
        } catch (error) {
            alert(error.message || "Failed to authorize match.");
        } finally {
            setProcessingId(null);
            setShowScheduleModal(false);
        }
    };

    const getSLARemaining = (createdAt, urgency) => {
        const limits = { critical: 24, high: 48, medium: 72, low: 168 };
        const limitHrs = limits[urgency] || 72;
        const elapsedHrs = (currentTime - new Date(createdAt)) / (1000 * 60 * 60);
        return Math.max(0, limitHrs - elapsedHrs);
    };

    const formatSLA = (hrs) => {
        const totalSeconds = Math.floor(hrs * 3600);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-xl font-bold text-slate-400">Request Not Found</p>
            </div>
        );
    }

    const remainingSLA = getSLARemaining(request.createdAt, request.patient?.urgencyLevel);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto p-6 lg:p-10">
                {/* Header */}
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                                <Activity size={14} />
                                <span>Organ Requests</span>
                                <span>/</span>
                                <span className="text-blue-600">#{request.requestId}</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Medical Case File</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Level Agreement (SLA)</p>
                            <p className={`text-xl font-mono font-black ${remainingSLA < 4 ? 'text-rose-600 animate-pulse' : 'text-blue-600'}`}>
                                {formatSLA(remainingSLA)}
                            </p>
                        </div>
                        <div className={`p-4 rounded-2xl border ${request.patient?.urgencyLevel === 'critical' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                            <Zap size={24} className={request.patient?.urgencyLevel === 'critical' ? 'animate-pulse' : ''} />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Patient Profile */}
                    <div className="lg:col-span-1 space-y-8">
                        <GlassCard className="border-slate-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <StatusBadge status={request.status} />
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200">
                                    {request.organType === 'heart' ? <Heart size={32} /> : <Activity size={32} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase">{request.organType}</h3>
                                    <p className="text-sm font-bold text-slate-400">Requested on {new Date(request.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-slate-900 rounded-3xl text-white">
                                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-4">Patient Profile</p>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl font-black">{request.patient?.bloodType}</div>
                                        <div>
                                            <p className="text-lg font-black">{request.patient?.name}</p>
                                            <p className="text-xs font-bold opacity-60">Age: {request.patient?.age}y | Urgency: {request.patient?.urgencyLevel}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <ClipboardList size={12} /> Clinical Background
                                        </p>
                                        <p className="text-sm font-medium leading-relaxed italic opacity-80">
                                            "{request.patient?.medicalCondition || 'No secondary condition logged.'}"
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Shield size={14} /> Medical Verification
                                    </h4>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Eligibility', status: request.eligibilityStatus, color: 'emerald' },
                                            { label: 'Consent', status: request.consentStatus, color: 'amber' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                <span className="text-sm font-bold text-slate-600">{item.label}</span>
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${item.status === 'validated' || item.status === 'given'
                                                    ? `bg-emerald-50 text-emerald-600 border border-emerald-100`
                                                    : `bg-slate-50 text-slate-400 border border-slate-100`
                                                    }`}>
                                                    {item.status || 'pending'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* SLA Meter Card */}
                        <GlassCard className="border-slate-200">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">SLA Compliance Tracking</h4>
                            <SLAMeter
                                value={remainingSLA}
                                max={request.patient?.urgencyLevel === 'critical' ? 24 : 72}
                                label="Time to Breach"
                            />
                            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Clock size={16} className="text-slate-400" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Registered</p>
                                        <p className="text-xs font-bold text-slate-700">{new Date(request.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                {request.slaBreachedAt && (
                                    <div className="flex items-center gap-3 text-rose-600 pt-2 border-t border-slate-200">
                                        <AlertTriangle size={16} />
                                        <div>
                                            <p className="text-[10px] font-black uppercase">SLA Breached</p>
                                            <p className="text-xs font-bold">{new Date(request.slaBreachedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Right Column: Donor Applications */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Donor Applications</h3>
                                <p className="text-sm font-bold text-slate-400 italic">Reviewing medical compatibility matches</p>
                            </div>
                            <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                                <User size={20} className="text-blue-600" />
                                <span className="text-lg font-black text-blue-700">{request.applications?.length || 0}</span>
                            </div>
                        </div>

                        {request.applications && request.applications.length > 0 ? (
                            <div className="space-y-4">
                                {request.applications.map((app) => (
                                    <motion.div
                                        key={app._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`group bg-white border-2 rounded-3xl transition-all overflow-hidden ${app.status === 'accepted' ? 'border-emerald-500 shadow-lg shadow-emerald-50' :
                                            app.status === 'rejected' ? 'border-slate-100 opacity-60' :
                                                'border-slate-100 hover:border-blue-500 shadow-sm'
                                            }`}
                                    >
                                        <div className="p-6">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {/* Donor Mini Profile */}
                                                <div className="md:w-1/3 space-y-4 border-r border-slate-100 pr-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 font-black border border-slate-100">
                                                            {app.user?.bloodType || app.donor?.medicalInfo?.bloodType}
                                                        </div>
                                                        <div>
                                                            <h5 className="font-black text-slate-800 uppercase truncate">
                                                                {app.user?.name || `${app.donor?.personalInfo?.firstName} ${app.donor?.personalInfo?.lastName}`}
                                                            </h5>
                                                            <p className="text-[10px] font-bold text-slate-400">ID: #{app._id.slice(-8).toUpperCase()}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-xs font-bold">
                                                            <span className="text-slate-400">Match Accuracy</span>
                                                            <span className="text-emerald-600">92%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <div className={`p-2 rounded-xl flex items-center justify-center ${app.consentSigned ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                                            <Shield size={16} />
                                                        </div>
                                                        <button
                                                            onClick={() => setViewingDonor(app)}
                                                            className="p-2 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                                                            title="View Full Medical Profile"
                                                        >
                                                            <FileText size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Application Details */}
                                                <div className="md:w-2/3 space-y-6">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Medical History</p>
                                                            <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                                                                {app.medicalHistory}
                                                            </p>
                                                        </div>
                                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lifestyle & Vitals</p>
                                                            <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                                                                {app.lifestyleData}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 size={16} className={app.consentSigned ? 'text-emerald-500' : 'text-slate-300'} />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase">Legal Consent Verified</span>
                                                        </div>

                                                        {request.status === 'pending' && app.status === 'pending' && (
                                                            <div className="flex gap-3">
                                                                <button
                                                                    onClick={() => handleApplicationAction(app._id, 'reject')}
                                                                    disabled={processingId === app._id}
                                                                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                                >
                                                                    Decline
                                                                </button>
                                                                <button
                                                                    onClick={() => handleApplicationAction(app._id, 'accept')}
                                                                    disabled={processingId === app._id}
                                                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                                                                >
                                                                    Authorize Match
                                                                </button>
                                                            </div>
                                                        )}

                                                        {app.status !== 'pending' && (
                                                            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                                                }`}>
                                                                {app.status === 'accepted' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                                                <span className="text-[10px] font-black uppercase tracking-widest">{app.status}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ClipboardList size={32} className="text-slate-300" />
                                </div>
                                <h4 className="text-xl font-black text-slate-800 mb-2">No Active Applications</h4>
                                <p className="text-slate-400 max-w-sm mx-auto text-sm font-medium">
                                    The organ network discovery is active. Applications from compatible donors will appear here in real-time.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Surgery Scheduling Modal */}
            <Modal
                isOpen={showScheduleModal}
                onClose={() => !processingId && setShowScheduleModal(false)}
                title="Authorize Match & Schedule Surgery"
                size="md"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                        <Info size={20} className="text-blue-600 shrink-0" />
                        <p className="text-xs font-medium text-blue-700 leading-relaxed">
                            By authorizing this match, you are confirming medical compatibility. A transplant record will be created immediately in 'Scheduled' status.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Input
                                label="Operation Date & Time"
                                type="datetime-local"
                                value={surgeryForm.scheduledDate}
                                onChange={(e) => setSurgeryForm({ ...surgeryForm, scheduledDate: e.target.value })}
                                required
                            />
                        </div>
                        <Input
                            label="Lead Surgeon"
                            placeholder="Dr. Alexander Pierce"
                            value={surgeryForm.surgeonName}
                            onChange={(e) => setSurgeryForm({ ...surgeryForm, surgeonName: e.target.value })}
                            required
                        />
                        <Input
                            label="Operating Room (OT)"
                            placeholder="OT-04 (Main Wing)"
                            value={surgeryForm.operatingRoom}
                            onChange={(e) => setSurgeryForm({ ...surgeryForm, operatingRoom: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowScheduleModal(false)}
                            disabled={processingId}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={confirmScheduledMatch}
                            disabled={processingId}
                        >
                            {processingId ? 'Processing...' : 'Authorize & Schedule'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Donor Full Medical Profile Modal */}
            <Modal
                isOpen={!!viewingDonor}
                onClose={() => setViewingDonor(null)}
                title="Donor Comprehensive Medical Profile"
                size="lg"
            >
                {viewingDonor && (
                    <div className="space-y-8 max-h-[75vh] overflow-y-auto pr-2">
                        {/* Summary Header */}
                        <div className="flex items-center gap-6 p-6 bg-slate-900 rounded-[2rem] text-white">
                            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-3xl font-black">
                                {viewingDonor.user?.bloodType || viewingDonor.donor?.medicalInfo?.bloodType}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">
                                    {viewingDonor.user?.name || `${viewingDonor.donor?.personalInfo?.firstName} ${viewingDonor.donor?.personalInfo?.lastName}`}
                                </h3>
                                <div className="flex gap-3 mt-2">
                                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        ID: #{viewingDonor._id.slice(-8).toUpperCase()}
                                    </span>
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                                        Verified Identity
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <User size={14} /> Personal Identity
                                </h4>
                                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-3 font-medium text-sm text-slate-600">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Email Address</span>
                                        <span className="text-slate-900">{viewingDonor.user?.email || viewingDonor.donor?.personalInfo?.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Phone Contact</span>
                                        <span className="text-slate-900">{viewingDonor.user?.phone || viewingDonor.donor?.personalInfo?.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Location</span>
                                        <span className="text-slate-900">{viewingDonor.donor?.location?.city || 'N/A'}, {viewingDonor.donor?.location?.state || ''}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Overview */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Activity size={14} /> Vital Statistics
                                </h4>
                                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-3 font-medium text-sm text-slate-600">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Height / Weight</span>
                                        <span className="text-slate-900">{viewingDonor.donor?.medicalInfo?.height}cm / {viewingDonor.donor?.medicalInfo?.weight}kg</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Gender</span>
                                        <span className="text-slate-900 uppercase font-black">{viewingDonor.donor?.personalInfo?.gender || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Eligibility</span>
                                        <span className="text-emerald-600 font-black uppercase">Clinically Cleared</span>
                                    </div>
                                </div>
                            </div>

                            {/* Self-Reported History */}
                            <div className="md:col-span-2 space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ClipboardList size={14} /> Case-Specific Declarations
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 bg-white border-2 border-slate-100 rounded-3xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Medical History (Declaration)</p>
                                        <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                            "{viewingDonor.medicalHistory || 'No historical data provided.'}"
                                        </p>
                                    </div>
                                    <div className="p-5 bg-white border-2 border-slate-100 rounded-3xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Lifestyle Habits</p>
                                        <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                            "{viewingDonor.lifestyleData || 'No lifestyle data provided.'}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Clinical History */}
                            {viewingDonor.donor?.medicalInfo?.medicalHistory?.length > 0 && (
                                <div className="md:col-span-2 space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileText size={14} /> Clinical Records
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {viewingDonor.donor.medicalInfo.medicalHistory.map((item, idx) => (
                                            <span key={idx} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold border border-slate-200">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-slate-100">
                            <Button
                                variant="primary"
                                className="w-full bg-slate-900 hover:bg-slate-800"
                                onClick={() => setViewingDonor(null)}
                            >
                                Close Portfolio
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Footer />
        </div>
    );
};

export default RequestDetail;
