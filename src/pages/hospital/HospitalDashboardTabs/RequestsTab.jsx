import React, { useState, useEffect } from 'react';
import {
    Clock, AlertCircle, ArrowRight, Shield, Heart, Activity,
    Filter, Search, UserCheck, Timer, History, Lock, AlertTriangle,
    CheckCircle2, Plus, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, StatusBadge, StepTracker, SLAMeter } from './DashboardComponents';
import apiService from '../../../services/api';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';

const RequestsTab = ({ requests: initialRequests = [] }) => {
    const [requests, setRequests] = useState(initialRequests || []);
    const [filter, setFilter] = useState({ organ: 'all', urgency: 'all', status: 'all' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [delayReason, setDelayReason] = useState('');
    const [captureDelayId, setCaptureDelayId] = useState(null);

    useEffect(() => {
        setRequests(initialRequests || []);
    }, [initialRequests]);

    const handleCaptureDelay = async (e) => {
        e.preventDefault();
        try {
            const res = await apiService.captureSLABreach(captureDelayId, delayReason);
            if (res.success) {
                setRequests(prev => prev.map(r => r._id === captureDelayId ? res.data : r));
                setCaptureDelayId(null);
                setDelayReason('');
            }
        } catch (error) {
            alert("Failed to log delay reason.");
        }
    };

    const handleValidateEligibility = async (id) => {
        try {
            const res = await apiService.validateEligibility(id);
            if (res.success) {
                setRequests(prev => prev.map(r => r._id === id ? res.data : r));
            }
        } catch (error) {
            alert("Eligibility validation failed.");
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = (req.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.requestId?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesOrgan = filter.organ === 'all' || req.organType === filter.organ;
        const matchesUrgency = filter.urgency === 'all' || req.patient?.urgencyLevel === filter.urgency;
        const matchesStatus = filter.status === 'all' || req.status === filter.status;
        return matchesSearch && matchesOrgan && matchesUrgency && matchesStatus;
    });

    const getSLARemaining = (createdAt, urgency) => {
        const limits = { critical: 24, high: 48, medium: 72, low: 168 };
        const limitHrs = limits[urgency] || 72;
        const elapsedHrs = (new Date() - new Date(createdAt)) / (1000 * 60 * 60);
        return Math.max(0, limitHrs - elapsedHrs);
    };

    const getSLAUrgency = (remaining) => {
        if (remaining <= 0) return 'breached';
        if (remaining < 6) return 'critical';
        if (remaining < 12) return 'warning';
        return 'normal';
    };

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by Patient Name or Request ID..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <Select
                        value={filter.organ}
                        onChange={(e) => setFilter({ ...filter, organ: e.target.value })}
                        options={[
                            { value: 'all', label: 'All Organs' },
                            { value: 'heart', label: 'Heart' },
                            { value: 'kidney', label: 'Kidney' },
                            { value: 'liver', label: 'Liver' },
                            { value: 'lung', label: 'Lung' }
                        ]}
                    />
                    <Select
                        value={filter.urgency}
                        onChange={(e) => setFilter({ ...filter, urgency: e.target.value })}
                        options={[
                            { value: 'all', label: 'All Urgency' },
                            { value: 'critical', label: 'Critical' },
                            { value: 'high', label: 'High' },
                            { value: 'medium', label: 'Medium' }
                        ]}
                    />
                    <Button variant="primary" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
                        <Plus size={18} /> New Request
                    </Button>
                </div>
            </div>

            {/* Request Cards */}
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                    {filteredRequests.map((req) => {
                        const remaining = getSLARemaining(req.createdAt, req.patient?.urgencyLevel);
                        const slaUrgency = getSLAUrgency(remaining);
                        const currentStep = req.lifecycle?.length || 0;

                        return (
                            <motion.div
                                key={req._id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="group"
                            >
                                <GlassCard urgency={req.patient?.urgencyLevel === 'critical' ? 'critical' : 'normal'} className="hover:shadow-lg transition-all border-slate-200 relative">
                                    <div className="flex flex-col xl:flex-row gap-8">
                                        {/* Left Side: Medical Case Layout */}
                                        <div className="xl:w-1/3">
                                            <div className="flex items-start gap-4 mb-6">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${req.patient?.urgencyLevel === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {req.organType === 'heart' ? <Heart size={32} /> : <Activity size={32} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">{req.organType}</h3>
                                                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">#{req.requestId}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <StatusBadge status={req.status} />
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded uppercase border border-blue-100">
                                                            {req.patient?.bloodType}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                                                        <UserCheck size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Profile</p>
                                                        <p className="text-sm font-black text-slate-700">{req.patient?.name} <span className="text-slate-400 ml-1">({req.patient?.age}y)</span></p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium italic line-clamp-2">
                                                    "{req.patient?.medicalCondition || 'No secondary condition logged.'}"
                                                </p>
                                            </div>
                                        </div>

                                        {/* Middle: Lifecycle & SLA */}
                                        <div className="xl:w-2/3 flex flex-col justify-between space-y-8">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex-1 max-w-md">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                            <Timer size={14} /> Medical Service Level (SLA)
                                                        </h4>
                                                        <span className={`text-xs font-black ${slaUrgency === 'breached' ? 'text-rose-600' :
                                                                slaUrgency === 'critical' ? 'text-rose-500' : 'text-blue-600'
                                                            }`}>
                                                            {remaining.toFixed(1)} Hours Remaining
                                                        </span>
                                                    </div>
                                                    <SLAMeter value={remaining} max={req.patient?.urgencyLevel === 'critical' ? 24 : 72} label="" />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {req.isEmergency && <div className="p-2 bg-rose-600 text-white rounded-xl shadow-lg ring-4 ring-rose-100 pulse-critical"><Shield size={20} /></div>}
                                                    {req.slaBreachedAt && <div onClick={() => setSelectedRequest(req)} className="cursor-pointer p-2 bg-amber-100 text-amber-700 rounded-xl border border-amber-200"><AlertTriangle size={20} /></div>}
                                                </div>
                                            </div>

                                            <div className="bg-white/40 border border-slate-100 rounded-2xl p-6 py-8">
                                                <StepTracker steps={['Logged', 'Matched', 'Validated', 'Consent', 'Surgery']} currentStep={req.status === 'matched' ? (req.eligibilityStatus === 'validated' ? (req.consentStatus === 'given' ? 4 : 3) : 2) : 1} />
                                            </div>

                                            <div className="flex justify-between items-center bg-slate-50/50 p-2 pl-4 rounded-xl border border-slate-100">
                                                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                                                    <History size={14} /> Last Update: {req.lifecycle?.[req.lifecycle.length - 1]?.stage?.replace('_', ' ')?.toUpperCase() || 'CREATED'}
                                                </div>
                                                <div className="flex gap-2">
                                                    {req.status === 'matched' && req.eligibilityStatus === 'pending' && (
                                                        <Button variant="primary" onClick={() => handleValidateEligibility(req._id)} className="bg-emerald-600 hover:bg-emerald-700 text-xs py-1.5 h-auto">Validate Eligibility</Button>
                                                    )}
                                                    {remaining <= 0 && !req.delayReason && (
                                                        <Button variant="secondary" onClick={() => setCaptureDelayId(req._id)} className="border-rose-200 text-rose-600 text-xs py-1.5 h-auto">Log SLA Breach</Button>
                                                    )}
                                                    <Button variant="secondary" onClick={() => setSelectedRequest(req)} className="text-xs py-1.5 h-auto flex items-center gap-2">
                                                        Clinical History <ArrowRight size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Locks */}
                                    {req.patient?.urgencyLevel === 'critical' && (
                                        <div className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
                                            <Lock size={12} />
                                        </div>
                                    )}
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* SLA Breach Capture Modal */}
            {captureDelayId && (
                <Modal isOpen={true} onClose={() => setCaptureDelayId(null)} title="SLA Breach Protocol" size="md">
                    <form onSubmit={handleCaptureDelay} className="space-y-6">
                        <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-800 rounded-2xl border border-rose-100">
                            <AlertTriangle className="text-rose-500" />
                            <p className="text-xs font-bold uppercase tracking-wide">Critical delay detected. Institutional reporting requires mandatory justification for the medical board.</p>
                        </div>
                        <Select
                            label="Primary Delay Reason *"
                            value={delayReason}
                            onChange={(e) => setDelayReason(e.target.value)}
                            required
                            options={[
                                { value: '', label: 'Select Reason' },
                                { value: 'Resource Constraint', label: 'Resource Constraint (Staff/OT)' },
                                { value: 'Logistical Failure', label: 'Logistical Failure (Transport)' },
                                { value: 'Patient Condition', label: 'Patient Condition Change' },
                                { value: 'Match Validation', label: 'Extended Cross-Match Period' },
                                { value: 'Technical Issues', label: 'Technical/Equipment Failure' },
                                { value: 'Other', label: 'Other (Specify in notes)' }
                            ]}
                        />
                        <div className="flex gap-4">
                            <Button variant="secondary" onClick={() => setCaptureDelayId(null)} className="flex-1">Cancel</Button>
                            <Button variant="primary" type="submit" className="flex-1 bg-rose-600 hover:bg-rose-700 border-none shadow-lg shadow-rose-200">Commit Reason</Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Request Detail Modal */}
            {selectedRequest && (
                <Modal isOpen={true} onClose={() => setSelectedRequest(null)} title={`Request Log: ${selectedRequest.requestId}`} size="lg">
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-900 rounded-3xl p-6 text-white col-span-2">
                                <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4">Patient Information</p>
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-3xl font-black">{selectedRequest.patient?.bloodType}</div>
                                    <div>
                                        <h4 className="text-2xl font-black tracking-tight">{selectedRequest.patient?.name}</h4>
                                        <div className="flex gap-3 mt-2">
                                            <span className="text-xs font-bold px-2 py-0.5 bg-white/10 rounded uppercase">Age: {selectedRequest.patient?.age}</span>
                                            <span className="text-xs font-bold px-2 py-0.5 bg-white/10 rounded uppercase">Sex: M</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-blue-600 rounded-3xl p-6 text-white text-center flex flex-col justify-center items-center">
                                <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-2">Organ Unit</p>
                                <Heart size={32} className="mb-2" />
                                <h4 className="text-xl font-black uppercase">{selectedRequest.organType}</h4>
                            </div>
                        </div>

                        <div>
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <History size={16} /> Forensic Audit Timeline
                            </h5>
                            <div className="relative pl-6 space-y-10">
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100" />
                                {selectedRequest.lifecycle?.map((log, i) => (
                                    <div key={i} className="relative pl-8">
                                        <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white" />
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded uppercase border border-blue-100 italic">
                                                {log.stage?.replace('_', ' ')}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700 leading-tight">Institutional Event Log Entry</p>
                                        <p className="text-sm text-slate-500 mt-2 font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100 italic">
                                            "{log.notes || 'Automated system entry logged.'}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedRequest.delayReason && (
                            <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl">
                                <div className="flex items-center gap-3 text-rose-800 mb-2">
                                    <AlertTriangle size={20} />
                                    <h5 className="font-black text-sm uppercase tracking-wider">Breach Justification</h5>
                                </div>
                                <p className="text-sm text-rose-600 font-bold">{selectedRequest.delayReason}</p>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* Create Request Modal */}
            {showCreateModal && (
                <Modal isOpen={true} onClose={() => setShowCreateModal(false)} title="Clinical Organ Case Creation" size="lg">
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Info size={16} /> Pre-Check Protocol
                            </h4>
                            <ul className="space-y-3">
                                {[
                                    'Patient identification verified with government documentation.',
                                    'Medical urgency level cross-checked by two consultant surgeons.',
                                    'Blood group compatibility is verified in local registry.',
                                    'Institutional board approval for organ acquisition is obtained.'
                                ].map((check, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                        <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle2 size={12} /></div>
                                        {check}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Patient Full Name *" placeholder="Required" />
                            <Input label="Patient Age *" type="number" placeholder="Required" />
                            <Select label="Urgency Level *" options={[
                                { value: 'medium', label: 'Medium - Routine' },
                                { value: 'high', label: 'High - Urgent' },
                                { value: 'critical', label: 'Critical - Emergency' },
                            ]} />
                            <Select label="Organ Type Required *" options={[
                                { value: 'heart', label: 'Heart' },
                                { value: 'kidney', label: 'Kidney' },
                                { value: 'liver', label: 'Liver' },
                                { value: 'lung', label: 'Lung' },
                            ]} />
                            <div className="md:col-span-2">
                                <Input label="Secondary Medical Condition" placeholder="Describe patient history or comorbidities..." />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                            <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">Cancel Case</Button>
                            <Button variant="primary" className="flex-1">Create Case Summary</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default RequestsTab;
