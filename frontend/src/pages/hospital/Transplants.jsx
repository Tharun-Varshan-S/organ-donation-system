import React, { useEffect, useState } from 'react';
import {
    CheckCircle,
    Clock,
    Activity,
    ArrowRight,
    FileText,
    TrendingUp,
    AlertCircle,
    Plus,
    Calendar,
    User,
    MapPin,
    Award,
    X,
    ClipboardCheck,
    Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/api';
import { GlassCard, SLAMeter, StatusBadge } from './DashboardComponents';
import './Transplants.css';

const Transplants = () => {
    const [transplants, setTransplants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedTransplant, setSelectedTransplant] = useState(null);
    const [outcomeData, setOutcomeData] = useState({
        success: null,
        complications: [],
        notes: '',
        followUpRequired: true
    });
    const [successMetrics, setSuccessMetrics] = useState(null);
    const [showPrepModal, setShowPrepModal] = useState(false);
    const [prepFormData, setPrepFormData] = useState({
        scheduledDate: '',
        surgeonName: '',
        operatingRoom: ''
    });
    const [doctors, setDoctors] = useState([]);
    const [compInput, setCompInput] = useState('');

    useEffect(() => {
        loadPageData();
    }, []);

    const loadPageData = async () => {
        setLoading(true);
        try {
            const [txRes, profileRes, doctorsRes] = await Promise.all([
                apiService.getHospitalTransplants(),
                apiService.getHospitalProfile(),
                apiService.getDoctors()
            ]);

            if (txRes.success) setTransplants(txRes.data);
            if (profileRes.success && profileRes.data.stats) setSuccessMetrics(profileRes.data.stats);
            if (doctorsRes.success) setDoctors(doctorsRes.data);

        } catch (error) {
            console.error('Error loading page data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await apiService.updateTransplantStatus(id, { status: newStatus });
            if (res.success) {
                setTransplants(prev => prev.map(tx => tx._id === id ? res.data : tx));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const openPrepModal = (transplant) => {
        setSelectedTransplant(transplant);
        setPrepFormData({
            scheduledDate: transplant.surgeryDetails?.scheduledDate ? new Date(transplant.surgeryDetails.scheduledDate).toISOString().slice(0, 16) : '',
            surgeonName: transplant.surgeryDetails?.surgeonName || '',
            operatingRoom: transplant.surgeryDetails?.operatingRoom || ''
        });
        setShowPrepModal(true);
    };

    const handlePrepSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await apiService.updateTransplantStatus(selectedTransplant._id, {
                surgeryDetails: {
                    scheduledDate: prepFormData.scheduledDate,
                    surgeonName: prepFormData.surgeonName,
                    operatingRoom: prepFormData.operatingRoom
                }
            });

            if (res.success) {
                setTransplants(prev => prev.map(tx => tx._id === selectedTransplant._id ? res.data : tx));
                setShowPrepModal(false);
                setSelectedTransplant(null);
            }
        } catch (error) {
            console.error('Error updating preparation:', error);
        }
    };

    const openOutcomeModal = (transplant) => {
        setSelectedTransplant(transplant);
        setOutcomeData({
            success: transplant.outcome?.success ?? null,
            complications: transplant.outcome?.complications || [],
            notes: transplant.outcome?.notes || '',
            followUpRequired: transplant.outcome?.followUpRequired ?? true
        });
        setShowOutcomeModal(true);
    };

    const handleOutcomeSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await apiService.updateTransplantOutcome(selectedTransplant._id, outcomeData);
            if (res.success) {
                setTransplants(prev => prev.map(tx => tx._id === selectedTransplant._id ? res.data : tx));
                setShowOutcomeModal(false);
                setSelectedTransplant(null);
                // Refresh metrics
                const profileRes = await apiService.getHospitalProfile();
                if (profileRes.success) setSuccessMetrics(profileRes.data.stats);
            }
        } catch (error) {
            console.error('Error updating outcome:', error);
        }
    };

    const addComplication = (e) => {
        if (e.key === 'Enter' && compInput.trim()) {
            e.preventDefault();
            if (!outcomeData.complications.includes(compInput.trim())) {
                setOutcomeData({
                    ...outcomeData,
                    complications: [...outcomeData.complications, compInput.trim()]
                });
            }
            setCompInput('');
        }
    };

    const removeComplication = (index) => {
        setOutcomeData({
            ...outcomeData,
            complications: outcomeData.complications.filter((_, i) => i !== index)
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Activity className="animate-spin text-blue-500 mr-2" />
            <span className="font-black text-slate-400 uppercase tracking-widest text-xs">Syncing Operation Data...</span>
        </div>
    );

    return (
        <div className="transplants-page pb-20">
            <header className="page-header mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Operation Control</h2>
                    <p className="text-sm font-bold text-slate-400 tracking-wide mt-1">Surgical Lifecycle & Outcome Monitoring</p>
                </div>

                <div className="success-metrics-grid">
                    <div className="metric-card">
                        <span className="metric-title">Hospital Success Rate</span>
                        <div className="metric-value-container">
                            <span className="metric-value">{successMetrics?.successRate || '0'}%</span>
                            <span className="metric-trend flex items-center gap-1"><TrendingUp size={14} /> +2.4%</span>
                        </div>
                    </div>
                    <div className="metric-card">
                        <span className="metric-title">Total Life-Saves</span>
                        <div className="metric-value-container">
                            <span className="metric-value">{successMetrics?.successfulTransplants || '0'}</span>
                            <Award className="text-amber-500" size={24} />
                        </div>
                    </div>
                </div>
            </header>

            <section className="transplants-grid">
                {transplants.length === 0 ? (
                    <div className="empty-transplants">
                        <Stethoscope size={48} className="mx-auto text-slate-200" />
                        <h3>No active surgical records found</h3>
                    </div>
                ) : (
                    transplants.map(tx => (
                        <GlassCard key={tx._id} className="operation-card p-6" hoverEffect>
                            <div className="patient-profile-snippet">
                                <span className="organ-badge-pill">{tx.organType}</span>
                                <h4 className="recipient-name uppercase">{tx.recipient?.name}</h4>
                                <div className="donor-link">
                                    <User size={14} />
                                    <span>Matched Donor: {tx.donor?.name || 'Authorized Donor'}</span>
                                </div>
                                <div className="text-[10px] font-black text-slate-400 flex items-center gap-1.5 mt-1 uppercase tracking-widest">
                                    <Calendar size={12} />
                                    {tx.surgeryDetails?.scheduledDate ? new Date(tx.surgeryDetails.scheduledDate).toLocaleString() : 'Scheduling Pending'}
                                </div>
                            </div>

                            <div className="workflow-tracker">
                                {[
                                    { id: 'scheduled', label: 'Allocated' },
                                    { id: 'in-progress', label: 'Operative' },
                                    { id: 'completed', label: 'Post-Op' }
                                ].map((step, idx) => {
                                    const allSteps = ['scheduled', 'in-progress', 'completed'];
                                    const currentIdx = allSteps.indexOf(tx.status);
                                    const isPast = currentIdx > idx;
                                    const isCurrent = tx.status === step.id;

                                    return (
                                        <div
                                            key={step.id}
                                            className={`workflow-step ${isPast ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
                                            onClick={() => handleUpdateStatus(tx._id, step.id)}
                                        >
                                            <div className="step-marker">
                                                {isPast ? <CheckCircle size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                            </div>
                                            <span className="step-label">{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="operation-actions">
                                {tx.status === 'completed' ? (
                                    tx.outcome?.success !== null ? (
                                        <div className={`outcome-badge ${tx.outcome.success ? 'success' : 'failed'}`}>
                                            {tx.outcome.success ? <Award size={16} /> : <AlertCircle size={16} />}
                                            {tx.outcome.success ? 'Success' : 'Failed'}
                                        </div>
                                    ) : (
                                        <button className="btn-action-primary" onClick={() => openOutcomeModal(tx)}>
                                            <ClipboardCheck size={16} />
                                            Log Outcome
                                        </button>
                                    )
                                ) : (
                                    <button className="btn-action-outline" onClick={() => openPrepModal(tx)}>
                                        <Calendar size={16} />
                                        Update OT Prep
                                    </button>
                                )}

                                {tx.surgeryDetails?.surgeonName && (
                                    <div className="assignment-capsule">
                                        <div className="capsule-item">
                                            <Stethoscope size={12} />
                                            <span>Dr. {tx.surgeryDetails.surgeonName?.split(' ').pop()}</span>
                                        </div>
                                        <div className="capsule-item border-l border-slate-200 pl-2">
                                            <MapPin size={12} />
                                            <span>{tx.surgeryDetails.operatingRoom || 'OT-X'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    ))
                )}
            </section>

            {/* Preparation Modal */}
            <AnimatePresence>
                {showPrepModal && selectedTransplant && (
                    <div className="modal-overlay">
                        <motion.div
                            className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl"
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Surgical Logistics</h3>
                                <button onClick={() => setShowPrepModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                    <X size={24} className="text-slate-300" />
                                </button>
                            </div>

                            <form onSubmit={handlePrepSubmit} className="space-y-6">
                                <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>Recipient: {selectedTransplant.recipient?.name}</span>
                                        <span>Organ: {selectedTransplant.organType}</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                                        Operation Schedule *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={prepFormData.scheduledDate}
                                        onChange={(e) => setPrepFormData({ ...prepFormData, scheduledDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                                            Lead Surgeon *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter surgeon name"
                                            value={prepFormData.surgeonName}
                                            onChange={(e) => setPrepFormData({ ...prepFormData, surgeonName: e.target.value })}
                                            list="surgeons"
                                            required
                                        />
                                        <datalist id="surgeons">
                                            {doctors.map((doc, idx) => (
                                                <option key={idx} value={doc.name || doc} />
                                            ))}
                                        </datalist>
                                    </div>
                                    <div className="form-group">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                                            Operating Room
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g. OT-4"
                                            value={prepFormData.operatingRoom}
                                            onChange={(e) => setPrepFormData({ ...prepFormData, operatingRoom: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-100 active:scale-95 transition-all mt-4">
                                    Validate & Allocate OT
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Outcome Modal */}
            <AnimatePresence>
                {showOutcomeModal && selectedTransplant && (
                    <div className="modal-overlay">
                        <motion.div
                            className="bg-white rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Clinical Post-Op Log</h3>
                                <button onClick={() => setShowOutcomeModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                    <X size={24} className="text-slate-300" />
                                </button>
                            </div>

                            <form onSubmit={handleOutcomeSubmit} className="space-y-8">
                                <div className="outcome-selector">
                                    <div
                                        className={`outcome-option success ${outcomeData.success === true ? 'selected' : ''}`}
                                        onClick={() => setOutcomeData({ ...outcomeData, success: true })}
                                    >
                                        <div className="outcome-icon-circle">
                                            <Award size={24} />
                                        </div>
                                        <span className="outcome-option-label">Operation Successful</span>
                                    </div>
                                    <div
                                        className={`outcome-option failed ${outcomeData.success === false ? 'selected' : ''}`}
                                        onClick={() => setOutcomeData({ ...outcomeData, success: false })}
                                    >
                                        <div className="outcome-icon-circle">
                                            <AlertCircle size={24} />
                                        </div>
                                        <span className="outcome-option-label">Operation Failed</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                                        Complications Encountereded
                                    </label>
                                    <div className="tag-input-wrapper">
                                        {outcomeData.complications.map((comp, idx) => (
                                            <span key={idx} className="tag-badge">
                                                {comp}
                                                <button type="button" onClick={() => removeComplication(idx)} className="tag-remove-btn">
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            className="tag-field"
                                            placeholder="Type complication and press Enter..."
                                            value={compInput}
                                            onChange={(e) => setCompInput(e.target.value)}
                                            onKeyDown={addComplication}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                                        Clinical Observation Notes
                                    </label>
                                    <textarea
                                        className="form-input min-h-[120px]"
                                        placeholder="Enter detailed operative notes..."
                                        value={outcomeData.notes}
                                        onChange={(e) => setOutcomeData({ ...outcomeData, notes: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <input
                                        type="checkbox"
                                        id="followUp"
                                        className="w-5 h-5 accent-amber-600"
                                        checked={outcomeData.followUpRequired}
                                        onChange={(e) => setOutcomeData({ ...outcomeData, followUpRequired: e.target.checked })}
                                    />
                                    <label htmlFor="followUp" className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                                        Mandatory Follow-up Required
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all ${outcomeData.success === null ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700 active:scale-95'
                                        }`}
                                    disabled={outcomeData.success === null}
                                >
                                    Seal Clinical Record & Close Case
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Transplants;
