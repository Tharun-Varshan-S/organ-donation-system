import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Activity,
    Clock,
    User,
    FileText,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Calendar,
    Stethoscope,
    Building2,
    ShieldCheck,
    ArrowRight,
    Search,
    ClipboardList,
    Heart,
    Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/api';
import { GlassCard, SLAMeter, StatusBadge } from './DashboardComponents';

// --- Local Atomic Components ---
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`bg-white rounded-[2.5rem] shadow-2xl w-full ${sizes[size]} overflow-hidden`}
            >
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <XCircle size={24} className="text-slate-400" />
                    </button>
                </div>
                <div className="p-8">{children}</div>
            </motion.div>
        </div>
    );
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled, loading }) => {
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200',
        secondary: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50',
        danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
        >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : children}
        </button>
    );
};

const Input = ({ label, icon: Icon, value, onChange, type = 'text', placeholder, required, options }) => (
    <div className="space-y-2">
        {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Icon size={18} />
            </div>
            {type === 'select' ? (
                <select
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none"
                >
                    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                />
            )}
        </div>
    </div>
);

const RequestDetail = () => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [viewingDonor, setViewingDonor] = useState(null);

    const [surgeryForm, setSurgeryForm] = useState({
        scheduledDate: '',
        surgeonName: '',
        operatingRoom: ''
    });

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const res = await apiService.getRequestById(requestId);
                if (res.success) setRequest(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
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
                navigate('/hospital/transplants');
            }
        } catch (error) {
            alert(error.message || "Failed to authorize match.");
        } finally {
            setProcessingId(null);
            setShowScheduleModal(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Case File...</p>
            </div>
        </div>
    );

    if (!request) return <div>Case not found</div>;

    // SLA Calculation
    const start = new Date(request.createdAt).getTime();
    const now = new Date().getTime();
    const elapsed = (now - start) / (1000 * 60 * 60);
    const limit = request.patient?.urgencyLevel === 'critical' ? 24 : 72;
    const remaining = Math.max(0, limit - elapsed);

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all active:scale-90">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Medical Case: {request.requestId}</h1>
                                <StatusBadge status={request.status} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 mt-0.5 tracking-wide flex items-center gap-2">
                                <Building2 size={12} /> Institutional Registry • Last Record: {new Date(request.updatedAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* LEFT COLUMN: Patient Profile */}
                    <div className="lg:col-span-2 space-y-10">
                        <GlassCard urgency={request.patient?.urgencyLevel === 'critical' ? 'critical' : 'normal'}>
                            <div className="flex justify-between items-start mb-10">
                                <div className="flex gap-6">
                                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-4xl font-black shadow-sm border border-slate-100 text-slate-800">
                                        {request.patient?.bloodType}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{request.patient?.name}</h2>
                                        <div className="flex gap-4 mt-2">
                                            <span className="text-sm font-bold text-slate-500 uppercase flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                                <User size={14} /> {request.patient?.age} Years
                                            </span>
                                            <span className="text-sm font-bold text-slate-500 uppercase flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                                <Activity size={14} /> {request.organType} UNIT
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Urgency Index</p>
                                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 ${request.patient?.urgencyLevel === 'critical' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-blue-50 border-blue-200 text-blue-600'
                                        }`}>
                                        {request.patient?.urgencyLevel}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-100">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Stethoscope size={14} /> Clinical Background
                                    </h4>
                                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                                            "{request.patient?.medicalCondition || 'No secondary condition logs provided.'}"
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Timer size={14} /> Medical Service Level (SLA)
                                    </h4>
                                    <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm">
                                        <SLAMeter
                                            value={remaining}
                                            max={limit}
                                            label={remaining <= 0 ? 'SLA BREACHED' : 'Operational Window'}
                                        />
                                        <p className="text-[10px] font-black text-slate-400 uppercase mt-4 flex items-center gap-2">
                                            <ShieldCheck size={12} className="text-emerald-500" /> Professional Standard Care Protocol Active
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Donor Applications Registry */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                    <User size={24} className="text-blue-600" /> Candidate Applications
                                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-black">{request.applications?.length || 0}</span>
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {request.applications && request.applications.length > 0 ? (
                                    request.applications.map((app) => (
                                        <motion.div
                                            key={app._id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white border-2 border-slate-100 rounded-3xl p-6 flex items-center justify-between hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-900/5 group"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-xl font-black text-white">
                                                    {(app.user?.bloodType || app.donor?.medicalInfo?.bloodType || '?')}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-800 tracking-tight">
                                                        {app.user?.name || `${app.donor?.personalInfo?.firstName} ${app.donor?.personalInfo?.lastName}`}
                                                    </h4>
                                                    <div className="flex gap-3 mt-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${app.compatibilityScore >= 90 ? 'text-emerald-600' : app.compatibilityScore >= 70 ? 'text-blue-600' : 'text-amber-600'
                                                            }`}>
                                                            Match Index: {app.compatibilityScore || 85}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <Button
                                                    variant="secondary"
                                                    className="py-2.5 px-4 h-auto text-[10px]"
                                                    onClick={() => setViewingDonor(app)}
                                                >
                                                    <FileText size={16} /> File
                                                </Button>
                                                {request.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            variant="danger"
                                                            className="py-2.5 px-4 h-auto text-[10px]"
                                                            onClick={() => handleApplicationAction(app._id, 'reject')}
                                                            loading={processingId === app._id}
                                                        >
                                                            <XCircle size={16} /> Reject
                                                        </Button>
                                                        <Button
                                                            variant="primary"
                                                            className="py-2.5 px-4 h-auto text-[10px] bg-emerald-600 hover:bg-emerald-700"
                                                            onClick={() => handleApplicationAction(app._id, 'accept')}
                                                            loading={processingId === app._id}
                                                        >
                                                            <CheckCircle2 size={16} /> Authorize Match
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] py-20 text-center">
                                        <div className="w-16 h-16 bg-white rounded-2.5xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                            <Search className="text-slate-200" size={32} />
                                        </div>
                                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Awaiting Candidate Submissions</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Audit & Lifecycle */}
                    <div className="space-y-10">
                        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight mb-8 flex items-center gap-3">
                                <ClipboardList size={20} className="text-blue-600" /> Institutional Timeline
                            </h3>

                            <div className="space-y-8 relative">
                                <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100" />
                                {request.lifecycle?.map((event, idx) => (
                                    <div key={idx} className="relative pl-10">
                                        <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-50 border-2 border-white" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(event.timestamp).toLocaleString()}</p>
                                            <p className="text-sm font-black text-slate-700 mt-1 uppercase tracking-tight">{event.stage?.replace('_', ' ')}</p>
                                            <p className="text-xs text-slate-500 mt-1 italic font-medium">"{event.notes || 'Automated entry log.'}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {request.delayReason && (
                            <div className="bg-rose-50 border-2 border-rose-100 rounded-[2rem] p-6 text-rose-800">
                                <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <AlertTriangle size={14} /> Breach Justification
                                </h4>
                                <p className="text-sm font-bold leading-relaxed italic">"{request.delayReason}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Surgery Scheduling Modal */}
            <Modal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                title="Authorize Match & Schedule Surgery"
                size="md"
            >
                <div className="space-y-8">
                    <div className="flex items-center gap-4 p-5 bg-blue-50 border border-blue-100 rounded-3xl text-blue-800">
                        <AlertTriangle className="text-blue-600 shrink-0" />
                        <p className="text-xs font-bold leading-relaxed uppercase tracking-wide">
                            Matching authorization will lock the donor to this patient and create a clinical transplant record. Precision scheduling is required for logistic coordination.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Operation Date & Time *"
                                icon={Calendar}
                                type="datetime-local"
                                value={surgeryForm.scheduledDate}
                                onChange={(e) => setSurgeryForm({ ...surgeryForm, scheduledDate: e.target.value })}
                            />
                            <Input
                                label="Lead Surgeon Name *"
                                icon={User}
                                placeholder="Dr. Alexander Smith"
                                value={surgeryForm.surgeonName}
                                onChange={(e) => setSurgeryForm({ ...surgeryForm, surgeonName: e.target.value })}
                            />
                        </div>
                        <Input
                            label="Operating Room (OT) #"
                            icon={Building2}
                            placeholder="OT-402, Cardiac Wing"
                            value={surgeryForm.operatingRoom}
                            onChange={(e) => setSurgeryForm({ ...surgeryForm, operatingRoom: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-slate-100">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowScheduleModal(false)}
                        >
                            Discard Draft
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            onClick={confirmScheduledMatch}
                            loading={processingId === selectedAppId}
                        >
                            Finalize Match
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
        </div>
    );
};

export default RequestDetail;
