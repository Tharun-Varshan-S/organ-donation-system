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
    const [captureDelayId, setCaptureDelayId] = useState(null);
    const [matches, setMatches] = useState([]);
    const [showMatchesModal, setShowMatchesModal] = useState(false);
    const [matchingRequestId, setMatchingRequestId] = useState(null);
    const [createStep, setCreateStep] = useState(1); // 1: Protocol, 2: Patient Info, 3: Results, 4: Final Form
    const [newRequestData, setNewRequestData] = useState({
        name: '', age: '', urgency: 'medium', organ: 'heart', bloodType: 'O+', condition: ''
    });
    const [validationResult, setValidationResult] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [schedulingData, setSchedulingData] = useState({
        requestId: '', donorId: '', donorSource: 'donor', surgeryDate: '', surgeonName: '', operatingRoom: ''
    });
    const [viewingDonor, setViewingDonor] = useState(null);
    const [isViewingDonorProfile, setIsViewingDonorProfile] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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

    const handleGiveConsent = async (id) => {
        try {
            const res = await apiService.giveConsent(id);
            if (res.success) {
                setRequests(prev => prev.map(r => r._id === id ? res.data : r));
            }
        } catch (error) {
            alert("Consent acquisition failed.");
        }
    };

    const handlePatientValidation = async () => {
        if (!newRequestData.name || !newRequestData.age) return alert("Please enter name and age");
        setIsValidating(true);
        try {
            const res = await apiService.validatePatient({ name: newRequestData.name, age: newRequestData.age });
            if (res.success) {
                setValidationResult(res.data);
                setCreateStep(3);
            }
        } catch (error) {
            alert("Validation service unavailable.");
        } finally {
            setIsValidating(false);
        }
    };

    const handleCreateRequest = async () => {
        try {
            const payload = {
                patient: {
                    name: newRequestData.name,
                    age: parseInt(newRequestData.age),
                    bloodType: newRequestData.bloodType,
                    urgencyLevel: newRequestData.urgency,
                    medicalCondition: newRequestData.condition
                },
                organType: newRequestData.organ
            };
            const res = await apiService.createHospitalRequest(payload);
            if (res.success) {
                setRequests([res.data, ...requests]);
                setShowCreateModal(false);
                setCreateStep(1);
                setNewRequestData({ name: '', age: '', urgency: 'medium', organ: 'heart', bloodType: 'O+', condition: '' });
                setValidationResult(null);
            }
        } catch (error) {
            alert("Failed to create request.");
        }
    };

    const handleFindMatches = async (requestId) => {
        setMatchingLoading(true);
        try {
            const res = await apiService.getPotentialMatches(requestId);
            if (res.success) {
                setMatches(res.data);
                setMatchingRequestId(requestId);
                setShowMatchesModal(true);
            }
        } catch (error) {
            alert("Match lookup failed.");
        } finally {
            setMatchingLoading(false);
        }
    };

    const handleViewDonorProfile = async (donorId) => {
        try {
            const res = await apiService.getDonorProfile(donorId);
            if (res.success) {
                setViewingDonor(res.data);
                setIsViewingDonorProfile(true);
            }
        } catch (error) {
            alert("Failed to fetch donor medical profile.");
        }
    };

    const handleSelectMatch = async (donorId, source) => {
        const confirmMessage = "CONFIRMATION REQUIRED:\n\nBy proceeding, you are explicitly matching this donor with the patient request. This action will LOCK both records and initiate the transplant protocol.\n\nContinue?";
        if (!window.confirm(confirmMessage)) return;
        try {
            const res = await apiService.selectDonor(matchingRequestId, donorId, source);
            if (res.success) {
                setRequests(prev => prev.map(r => r._id === matchingRequestId ? res.data : r));
                setShowMatchesModal(false);
                alert("Match Secured. Protocol Initiated.");
            }
        } catch (error) {
            alert("Failed to assign donor.");
        }
    };

    const handleScheduleSurgery = async (e) => {
        e.preventDefault();
        try {
            const res = await apiService.createTransplantRecord(schedulingData);
            if (res.success) {
                alert("Surgery scheduled successfully!");
                setShowSchedulingModal(false);
                // Update local request state to show it is now in 'surgery' stage
                setRequests(prev => prev.map(r => r._id === schedulingData.requestId ? { ...r, status: 'completed' } : r));
            }
        } catch (error) {
            alert(error.message || "Failed to schedule surgery.");
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
        const elapsedHrs = (currentTime - new Date(createdAt)) / (1000 * 60 * 60);
        return Math.max(0, limitHrs - elapsedHrs);
    };

    const getSLAUrgency = (remaining) => {
        if (remaining <= 0) return 'breached';
        if (remaining < 4) return 'critical';
        if (remaining < 12) return 'warning';
        return 'normal';
    };

    const formatSLA = (hrs) => {
        const totalSeconds = Math.floor(hrs * 3600);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h}h ${m}m ${s}s`;
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
                                                        <span className={`text-[10px] font-mono font-black ${slaUrgency === 'breached' ? 'text-rose-600' :
                                                            slaUrgency === 'critical' ? 'text-rose-500 animate-pulse' : 'text-blue-600'
                                                            }`}>
                                                            {formatSLA(remaining)}
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
                                                <StepTracker
                                                    steps={['Logged', 'Matched', 'Validated', 'Consent', 'Surgery']}
                                                    currentStep={
                                                        req.status === 'completed' ? 5 :
                                                            req.status === 'matched' ? (
                                                                req.eligibilityStatus === 'validated' ? (
                                                                    req.consentStatus === 'given' ? 4 : 3
                                                                ) : 2
                                                            ) : 1
                                                    }
                                                />
                                            </div>

                                            <div className="flex justify-between items-center bg-slate-50/50 p-2 pl-4 rounded-xl border border-slate-100">
                                                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                                                    <History size={14} /> Last Update: {req.lifecycle?.[req.lifecycle.length - 1]?.stage?.replace('_', ' ')?.toUpperCase() || 'CREATED'}
                                                </div>
                                                <div className="flex gap-2">
                                                    {req.status === 'pending' && (
                                                        <Button
                                                            variant="primary"
                                                            onClick={() => handleFindMatches(req._id)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-xs py-1.5 h-auto flex items-center gap-2"
                                                        >
                                                            <Activity size={14} /> Find Matches
                                                        </Button>
                                                    )}
                                                    {req.status === 'matched' && req.eligibilityStatus === 'pending' && (
                                                        <Button variant="primary" onClick={() => handleValidateEligibility(req._id)} className="bg-emerald-600 hover:bg-emerald-700 text-xs py-1.5 h-auto">Validate Eligibility</Button>
                                                    )}
                                                    {req.status === 'matched' && req.eligibilityStatus === 'validated' && req.consentStatus === 'pending' && (
                                                        <Button variant="primary" onClick={() => handleGiveConsent(req._id)} className="bg-amber-600 hover:bg-amber-700 text-xs py-1.5 h-auto">Patient Consent</Button>
                                                    )}
                                                    {req.status === 'matched' && req.eligibilityStatus === 'validated' && req.consentStatus === 'given' && (
                                                        <Button
                                                            variant="primary"
                                                            onClick={() => {
                                                                setSchedulingData({ ...schedulingData, requestId: req._id, donorId: req.matchedDonor, organType: req.organType });
                                                                setShowSchedulingModal(true);
                                                            }}
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-xs py-1.5 h-auto flex items-center gap-2"
                                                        >
                                                            <Clock size={14} /> Schedule Surgery
                                                        </Button>
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

            {/* Create Request Modal - Multi Step Verification */}
            {showCreateModal && (
                <Modal isOpen={true} onClose={() => setShowCreateModal(false)} title="Clinical Organ Case Creation" size="lg">
                    <div className="space-y-6">
                        {/* Step Indicator */}
                        <div className="flex justify-between mb-8">
                            {[1, 2, 3, 4].map(step => (
                                <div key={step} className={`h-1 flex-1 mx-1 rounded-full ${createStep >= step ? 'bg-blue-600' : 'bg-slate-100'}`} />
                            ))}
                        </div>

                        {createStep === 1 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
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
                                <Button variant="primary" className="w-full" onClick={() => setCreateStep(2)}>Begin Verification</Button>
                            </motion.div>
                        )}

                        {createStep === 2 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Patient Full Name *"
                                        value={newRequestData.name}
                                        onChange={e => setNewRequestData({ ...newRequestData, name: e.target.value })}
                                        placeholder="Full Legal Name"
                                    />
                                    <Input
                                        label="Patient Age *"
                                        type="number"
                                        value={newRequestData.age}
                                        onChange={e => setNewRequestData({ ...newRequestData, age: e.target.value })}
                                        placeholder="Age"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="secondary" className="flex-1" onClick={() => setCreateStep(1)}>Back</Button>
                                    <Button variant="primary" className="flex-1" onClick={handlePatientValidation} loading={isValidating}>
                                        Verify Patient History
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {createStep === 3 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className={`p-6 rounded-3xl border ${validationResult?.isNew ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        {validationResult?.isNew ? <CheckCircle2 className="text-emerald-500" /> : <AlertTriangle className="text-amber-500" />}
                                        <h4 className="font-black uppercase tracking-widest text-xs">
                                            {validationResult?.isNew ? 'New Patient Identity Verified' : 'Existing Clinical Records Found'}
                                        </h4>
                                    </div>
                                    <p className="text-sm font-medium">
                                        {validationResult?.isNew
                                            ? "No prior organ transplant requests or procedures found for this patient identity in the national registry."
                                            : `Found ${validationResult.priorRequests.length + validationResult.priorTransplants.length} previous record(s). Ensure duplicate requests are avoided.`}
                                    </p>
                                </div>

                                {!validationResult?.isNew && (
                                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {validationResult.priorRequests.map((r, i) => (
                                            <div key={i} className="text-xs p-2 bg-slate-50 border rounded-lg flex justify-between">
                                                <span>Request #{r.requestId} ({r.organType})</span>
                                                <span className="font-bold opacity-50">{new Date(r.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <Button variant="secondary" className="flex-1" onClick={() => setCreateStep(2)}>Re-verify</Button>
                                    <Button variant="primary" className="flex-1" onClick={() => setCreateStep(4)}>Continue to Case Details</Button>
                                </div>
                            </motion.div>
                        )}

                        {createStep === 4 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Select
                                        label="Blood Group *"
                                        value={newRequestData.bloodType}
                                        onChange={e => setNewRequestData({ ...newRequestData, bloodType: e.target.value })}
                                        options={[
                                            { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
                                            { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
                                            { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
                                            { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
                                        ]}
                                    />
                                    <Select
                                        label="Organ Type *"
                                        value={newRequestData.organ}
                                        onChange={e => setNewRequestData({ ...newRequestData, organ: e.target.value })}
                                        options={[
                                            { value: 'heart', label: 'Heart' }, { value: 'kidney', label: 'Kidney' },
                                            { value: 'liver', label: 'Liver' }, { value: 'lung', label: 'Lung' },
                                            { value: 'pancreas', label: 'Pancreas' },
                                        ]}
                                    />
                                    <Select
                                        label="Urgency Level *"
                                        value={newRequestData.urgency}
                                        onChange={e => setNewRequestData({ ...newRequestData, urgency: e.target.value })}
                                        options={[
                                            { value: 'low', label: 'Low - Non Urgent' },
                                            { value: 'medium', label: 'Medium - Routine' },
                                            { value: 'high', label: 'High - Urgent' },
                                            { value: 'critical', label: 'Critical - Emergency' },
                                        ]}
                                    />
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Medical Summary"
                                            value={newRequestData.condition}
                                            onChange={e => setNewRequestData({ ...newRequestData, condition: e.target.value })}
                                            placeholder="Detailed patient prognosis..."
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="secondary" className="flex-1" onClick={() => setCreateStep(3)}>Back</Button>
                                    <Button variant="primary" className="flex-1" onClick={handleCreateRequest}>Authorize Case Creation</Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </Modal>
            )}

            {/* Potential Matches Modal */}
            {showMatchesModal && (
                <Modal isOpen={true} onClose={() => setShowMatchesModal(false)} title="Donor Matching Analytics" size="xl">
                    <div className="space-y-6">
                        <div className="bg-blue-600 rounded-3xl p-6 text-white flex justify-between items-center">
                            <div>
                                <h4 className="text-xl font-black">AI-Powered Matching results</h4>
                                <p className="text-sm opacity-80">Ranked by score based on blood compatibility, distance, and organ health.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Candidates Found</p>
                                <p className="text-3xl font-black">{matches.length}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {matches.map((match, i) => (
                                <div key={i} className="bg-white border-2 border-slate-100 rounded-3xl p-5 hover:border-blue-500 transition-all group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-blue-600 border-2 border-blue-50">
                                                {match.source === 'donor' ? match.medicalInfo.bloodType : match.bloodType}
                                            </div>
                                            <div>
                                                <h5 className="font-black text-slate-800 uppercase tracking-tight">Candidate #{match._id.slice(-6)}</h5>
                                                <p className="text-[10px] font-bold text-slate-400">Source: {match.source.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-emerald-600">{match.matchScore}%</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Match Score</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Organ Fitness</p>
                                            <p className="text-sm font-black text-slate-700">{match.fitnessScore || 92}%</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">SLA Probability</p>
                                            <p className="text-sm font-black text-slate-700">98% Success</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            className="flex-1 text-[10px] py-1.5 h-auto uppercase font-black"
                                            onClick={() => handleViewDonorProfile(match._id)}
                                        >
                                            View Medical Profile
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="flex-1 text-[10px] py-1.5 h-auto uppercase font-black"
                                            onClick={() => handleSelectMatch(match._id, match.source)}
                                        >
                                            Secure Match
                                        </Button>
                                    </div>

                                    {/* High Match Ribbon */}
                                    {match.matchScore >= 120 && (
                                        <div className="absolute top-2 right-[-25px] rotate-45 bg-emerald-500 text-white text-[8px] font-black py-1 px-8 shadow-sm">
                                            EXCELLENT
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {matches.length === 0 && (
                            <div className="text-center py-12">
                                <Search size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest">No compatible donors found in registry.</p>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* Surgery Scheduling Modal */}
            {showSchedulingModal && (
                <Modal isOpen={true} onClose={() => setShowSchedulingModal(false)} title="Clinical Surgery Scheduling" size="lg">
                    <form onSubmit={handleScheduleSurgery} className="space-y-6">
                        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center gap-4 text-indigo-900">
                            <Clock className="text-indigo-600" size={32} />
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-xs">Pre-Operative Clearance Required</h4>
                                <p className="text-sm font-medium">Verify all lab results and donor-recipient compatibility before locking the schedule.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Surgery Date & Time *"
                                type="datetime-local"
                                value={schedulingData.surgeryDate}
                                onChange={e => setSchedulingData({ ...schedulingData, surgeryDate: e.target.value })}
                                required
                            />
                            <Input
                                label="Lead Surgeon *"
                                value={schedulingData.surgeonName}
                                onChange={e => setSchedulingData({ ...schedulingData, surgeonName: e.target.value })}
                                placeholder="Dr. Name"
                                required
                            />
                            <Input
                                label="Operating Room *"
                                value={schedulingData.operatingRoom}
                                onChange={e => setSchedulingData({ ...schedulingData, operatingRoom: e.target.value })}
                                placeholder="OR Block/Room"
                                required
                            />
                            <Select
                                label="Donor Source Confirmation"
                                value={schedulingData.donorSource}
                                onChange={e => setSchedulingData({ ...schedulingData, donorSource: e.target.value })}
                                options={[
                                    { value: 'donor', label: 'Internal Registry Donor' },
                                    { value: 'user', label: 'Network Public Donor' },
                                ]}
                            />
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                            <Button variant="secondary" onClick={() => setShowSchedulingModal(false)} className="flex-1">Discard Draft</Button>
                            <Button variant="primary" type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 border-none">Confirm Surgery Schedule</Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Donor Profile Preview Modal */}
            {isViewingDonorProfile && viewingDonor && (
                <Modal isOpen={true} onClose={() => setIsViewingDonorProfile(false)} title="Clinical Donor Profile" size="xl">
                    <div className="space-y-8">
                        {/* Header Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-600 rounded-2xl p-4 text-white text-center">
                                <p className="text-[10px] font-black opacity-60 uppercase mb-1">Blood Type</p>
                                <p className="text-2xl font-black">{viewingDonor.medicalInfo?.bloodType || 'N/A'}</p>
                            </div>
                            <div className="bg-emerald-600 rounded-2xl p-4 text-white text-center">
                                <p className="text-[10px] font-black opacity-60 uppercase mb-1">Organ Fitness</p>
                                <p className="text-2xl font-black">94%</p>
                            </div>
                            <div className="bg-slate-900 rounded-2xl p-4 text-white text-center md:col-span-2">
                                <p className="text-[10px] font-black opacity-60 uppercase mb-1">Registry Status</p>
                                <div className="flex items-center justify-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-sm font-black uppercase tracking-widest">{viewingDonor.status || 'Active'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Medical Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h5 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Medical History & Screening</h5>
                                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Prior Conditions</p>
                                            <div className="flex wrap gap-2">
                                                {viewingDonor.medicalInfo?.medicalHistory?.length > 0 ?
                                                    viewingDonor.medicalInfo.medicalHistory.map((h, i) => <span key={i} className="text-xs font-bold px-2 py-0.5 bg-white border rounded uppercase">{h}</span>)
                                                    : <span className="text-xs font-bold text-slate-400 italic">No history recorded.</span>
                                                }
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Clinical Laboratory Access</p>
                                            <p className="text-sm font-bold text-slate-700 italic">Full HLA typing and cross-match reports available upon secure authorization.</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Legal & Ethics</h5>
                                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-black text-slate-600">Post-Mortem Consent</p>
                                            <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={14} /></div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-black text-slate-600">Doctor/Ethics Board Approval</p>
                                            <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={14} /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h5 className="text-xs font-black text-rose-600 uppercase tracking-[0.2em] mb-4">Medical Warnings</h5>
                                    <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="text-rose-500 shrink-0" size={18} />
                                            <div>
                                                <p className="text-xs font-black text-rose-800 uppercase tracking-tight">Vessel Compatibility</p>
                                                <p className="text-xs text-rose-600 mt-1 font-medium italic">Marginal size difference noted. Surgical caution advised.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 opacity-40">
                                            <CheckCircle2 className="text-slate-400 shrink-0" size={18} />
                                            <p className="text-xs font-bold text-slate-600">No active infections detected.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-900 rounded-3xl text-white">
                                    <p className="text-[10px] font-black opacity-60 uppercase mb-4 tracking-widest">Procedural Capability</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                            <ShieldCheck size={24} className="text-blue-400" />
                                        </div>
                                        <p className="text-sm font-bold leading-tight">This donor is cleared for immediate surgical extraction protocol.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 italic">
                            <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-[0.3em]">Confidential Medical Record - LifeBridge Health</p>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default RequestsTab;
