import React, { useState, useEffect } from 'react';
import {
    FileText, CheckCircle2, XCircle, MoreVertical, Calendar, User,
    ClipboardList, Clock, Activity, AlertTriangle, ShieldCheck,
    Search, Filter, ChevronRight, Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, StatusBadge } from './DashboardComponents';
import apiService from '../../../services/api';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';

const TransplantsTab = ({ transplants: initialTransplants = [] }) => {
    const [transplants, setTransplants] = useState(initialTransplants || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTransplant, setSelectedTransplant] = useState(null);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [outcomeData, setOutcomeData] = useState({
        success: true,
        complications: '',
        notes: '',
        followUpRequired: true,
        actualDuration: ''
    });

    useEffect(() => {
        setTransplants(initialTransplants || []);
    }, [initialTransplants]);

    const handleOpenOutcome = (transplant) => {
        setSelectedTransplant(transplant);
        setOutcomeData({
            success: transplant.outcome?.success ?? true,
            complications: transplant.outcome?.complications?.join(', ') || '',
            notes: transplant.outcome?.notes || '',
            followUpRequired: transplant.outcome?.followUpRequired ?? true,
            actualDuration: transplant.surgeryDetails?.duration || ''
        });
        setShowOutcomeModal(true);
    };

    const handleSubmitOutcome = async (e) => {
        e.preventDefault();
        try {
            const formattedData = {
                ...outcomeData,
                complications: outcomeData.complications.split(',').map(c => c.trim()).filter(Boolean)
            };
            const res = await apiService.updateTransplantOutcome(selectedTransplant._id, formattedData);
            if (res.success) {
                setTransplants(prev => prev.map(t => t._id === selectedTransplant._id ? res.data : t));
                setShowOutcomeModal(false);
            }
        } catch (error) {
            alert("Failed to update transplant record.");
        }
    };

    const filteredTransplants = transplants.filter(tx =>
        tx.transplantId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.recipient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.organType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Logbook Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <ClipboardList className="text-blue-600" />
                        Clinical Transplant Registry
                    </h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Official Medical Records Archive</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search Registry..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Transplant Grid */}
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {filteredTransplants.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                            <Activity size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest">No matching procedural records.</p>
                        </div>
                    ) : (
                        filteredTransplants.map((tx, idx) => (
                            <motion.div
                                key={tx._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <GlassCard className="p-0 border-slate-200 group hover:border-blue-300 transition-all overflow-hidden">
                                    <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-slate-100">
                                        {/* Status & ID */}
                                        <div className="xl:w-64 p-6 bg-slate-50/50 flex flex-col justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registry ID</p>
                                                <h4 className="text-lg font-black text-slate-800 font-mono tracking-tighter">{tx.transplantId}</h4>
                                                <StatusBadge status={tx.status} className="mt-3" />
                                            </div>
                                            <div className="mt-6">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Scheduled Date</p>
                                                <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {new Date(tx.surgeryDetails?.scheduledDate || tx.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Procedure Details */}
                                        <div className="flex-1 p-6">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                                                    {tx.recipient?.bloodType || '??'}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{tx.organType} Transplant</h3>
                                                    <p className="text-sm font-bold text-slate-400 italic">Recipient: {tx.recipient?.name || 'Access Restricted'}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1 flex items-center gap-1"><Stethoscope size={10} /> Lead Surgeon</p>
                                                    <p className="text-xs font-black text-slate-700 truncate">{tx.surgeryDetails?.surgeonName || 'Unassigned'}</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1 flex items-center gap-1"><Clock size={10} /> Duration</p>
                                                    <p className="text-xs font-black text-slate-700">{tx.surgeryDetails?.duration || 'NC'} Min</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1 flex items-center gap-1"><Activity size={10} /> Theatre</p>
                                                    <p className="text-xs font-black text-slate-700">{tx.surgeryDetails?.operatingRoom || 'NA'}</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1 flex items-center gap-1"><ShieldCheck size={10} /> Clinical Success</p>
                                                    <p className={`text-xs font-black ${tx.outcome?.success ? 'text-emerald-600' : tx.outcome?.success === false ? 'text-rose-600' : 'text-slate-400'}`}>
                                                        {tx.outcome?.success ? 'CONFIRMED' : tx.outcome?.success === false ? 'FAILED' : 'PENDING'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="xl:w-48 p-6 flex flex-col justify-center gap-3 bg-slate-50/30">
                                            <Button
                                                variant="primary"
                                                onClick={() => handleOpenOutcome(tx)}
                                                className="w-full text-xs font-black uppercase tracking-widest py-2 h-auto"
                                            >
                                                Log Outcome
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                className="w-full text-xs font-black uppercase tracking-widest py-2 h-auto"
                                            >
                                                Medical Report
                                            </Button>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Outcome Modal */}
            {selectedTransplant && (
                <Modal isOpen={showOutcomeModal} onClose={() => setShowOutcomeModal(false)} title={`Post-Op Clinical Audit: ${selectedTransplant.transplantId}`} size="lg">
                    <form onSubmit={handleSubmitOutcome} className="space-y-8">
                        <div className="bg-slate-900 rounded-3xl p-6 text-white text-center">
                            <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4">Procedure Outcome Verification</p>
                            <div className="flex justify-center gap-12">
                                <label className="cursor-pointer group">
                                    <input
                                        type="radio" className="hidden" name="success" checked={outcomeData.success}
                                        onChange={() => setOutcomeData({ ...outcomeData, success: true })}
                                    />
                                    <div className={`p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${outcomeData.success ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 opacity-30 group-hover:opacity-100'}`}>
                                        <CheckCircle2 size={40} className={outcomeData.success ? 'text-emerald-500' : 'text-white'} />
                                        <span className="font-black uppercase tracking-widest text-xs">Success</span>
                                    </div>
                                </label>
                                <label className="cursor-pointer group">
                                    <input
                                        type="radio" className="hidden" name="success" checked={!outcomeData.success}
                                        onChange={() => setOutcomeData({ ...outcomeData, success: false })}
                                    />
                                    <div className={`p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${!outcomeData.success ? 'border-rose-500 bg-rose-500/10' : 'border-white/10 opacity-30 group-hover:opacity-100'}`}>
                                        <XCircle size={40} className={!outcomeData.success ? 'text-rose-500' : 'text-white'} />
                                        <span className="font-black uppercase tracking-widest text-xs">Failure</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Actual Procedure Duration (Min)"
                                type="number"
                                value={outcomeData.actualDuration}
                                onChange={(e) => setOutcomeData({ ...outcomeData, actualDuration: e.target.value })}
                            />
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <div>
                                    <p className="text-sm font-black text-slate-800">Compulsory Follow-up</p>
                                    <p className="text-[10px] font-bold text-slate-400">Flag patient for mandatory monitoring</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-6 h-6 rounded-lg text-blue-600"
                                    checked={outcomeData.followUpRequired}
                                    onChange={(e) => setOutcomeData({ ...outcomeData, followUpRequired: e.target.checked })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    label="Clinical Complications (Comma separated)"
                                    placeholder="e.g. Minor hemorrhaging, Rejection concerns, Infection"
                                    value={outcomeData.complications}
                                    onChange={(e) => setOutcomeData({ ...outcomeData, complications: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Surgical Clinical Notes</label>
                                <textarea
                                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-blue-100 font-medium text-sm transition-all"
                                    placeholder="Enter detailed postoperative analysis..."
                                    value={outcomeData.notes}
                                    onChange={(e) => setOutcomeData({ ...outcomeData, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                            <Button variant="secondary" onClick={() => setShowOutcomeModal(false)} className="flex-1">Discard Entry</Button>
                            <Button variant="primary" type="submit" className="flex-1 shadow-lg shadow-blue-200">Authorize Record Lock</Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default TransplantsTab;
