import React, { useState, useEffect } from 'react';
import {
    Search, Filter, Plus, User, MapPin, Activity, Droplet,
    ChevronRight, ShieldCheck, History, Eye, EyeOff,
    FileText, CheckCircle2, AlertCircle, Phone, Mail, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, StatusBadge } from './DashboardComponents';
import apiService from '../../../services/api';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';

const DonorsTab = ({ donors: initialDonors, onEdit, onDelete }) => {
    const [activeSegment, setActiveSegment] = useState('active'); // 'active' | 'discovery'
    const [searchTerm, setSearchTerm] = useState('');
    const [donors, setDonors] = useState(initialDonors || []);
    const [discoveryDonors, setDiscoveryDonors] = useState([]);
    const [loadingDiscovery, setLoadingDiscovery] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState(null);
    const [donorTimeline, setDonorTimeline] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [revealLoading, setRevealLoading] = useState(null);

    useEffect(() => {
        setDonors(initialDonors || []);
    }, [initialDonors]);

    const handleSegmentChange = (segment) => {
        setActiveSegment(segment);
        if (segment === 'discovery') {
            fetchDiscoveryDonors();
        }
    };

    const fetchDiscoveryDonors = async () => {
        setLoadingDiscovery(true);
        try {
            const res = await apiService.getPublicDonors();
            if (res.success) {
                setDiscoveryDonors(res.data);
            }
        } catch (error) {
            console.error("Discovery error:", error);
        } finally {
            setLoadingDiscovery(false);
        }
    };

    const handleViewTimeline = async (donor) => {
        setSelectedDonor(donor);
        try {
            const res = await apiService.getDonorTimeline(donor._id);
            if (res.success) {
                setDonorTimeline(res.data);
            }
        } catch (error) {
            console.error("Timeline error:", error);
        }
    };

    const handleRevealIdentity = async (donorId) => {
        setRevealLoading(donorId);
        try {
            const res = await apiService.getDonorProfile(donorId);
            if (res.success && res.revealed) {
                // Update specific donor in discovery list with revealed data
                setDiscoveryDonors(prev => prev.map(d =>
                    d._id === donorId ? { ...d, ...res.data, isRevealed: true } : d
                ));
            } else {
                alert("Identity reveal requires a validated match and donor consent.");
            }
        } catch (error) {
            alert("Reveal failed: Access denied by medical protocol.");
        } finally {
            setRevealLoading(null);
        }
    };

    const getFilteredDonors = () => {
        const source = activeSegment === 'active' ? donors : discoveryDonors;
        return source.filter(d => {
            const name = d.personalInfo ? `${d.personalInfo.firstName} ${d.personalInfo.lastName}` : (d.name || 'Anonymized Donor');
            const organs = d.donationPreferences?.organTypes?.join(', ') || d.organ || '';
            const searchLower = searchTerm.toLowerCase();
            return name.toLowerCase().includes(searchLower) || organs.toLowerCase().includes(searchLower);
        });
    };

    const filteredDonors = getFilteredDonors();

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full lg:w-auto">
                    <button
                        onClick={() => handleSegmentChange('active')}
                        className={`flex-1 lg:flex-none px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeSegment === 'active' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <ShieldCheck size={18} />
                        Internal Registry
                    </button>
                    <button
                        onClick={() => handleSegmentChange('discovery')}
                        className={`flex-1 lg:flex-none px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeSegment === 'discovery' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Sparkles size={18} />
                        Cross-Hospital Network
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
                    <div className="relative flex-1 sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Universal search (Organs, Blood, Name)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setShowRegisterModal(true)}
                        className="flex items-center justify-center gap-2 px-6 shadow-lg shadow-blue-200"
                    >
                        <Plus size={20} />
                        Acquire New Donor
                    </Button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredDonors.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-20 text-center"
                        >
                            <User size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-medium">No donor records matched your search criteria.</p>
                        </motion.div>
                    ) : (
                        filteredDonors.map((donor, idx) => (
                            <motion.div
                                key={donor._id || idx}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="group"
                            >
                                <GlassCard className="h-full border-slate-200 hover:border-blue-400 transition-colors p-0 overflow-hidden">
                                    {/* Medical Grade Header */}
                                    <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 font-black text-xl border border-slate-200">
                                                {donor.medicalInfo?.bloodType || donor.bloodType || '??'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
                                                    {(donor.personalInfo ? `${donor.personalInfo.firstName} ${donor.personalInfo.lastName}` : (donor.name || 'Anonymized Profile'))}
                                                </h3>
                                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest truncate max-w-[150px]">
                                                    ID: {donor._id?.slice(-8).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <StatusBadge status={donor.status || 'Active'} />
                                    </div>

                                    {/* Stats & Medical Detail */}
                                    <div className="p-6 space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            {(donor.donationPreferences?.organTypes || [donor.organ]).map(org => (
                                                <span key={org} className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg uppercase border border-blue-100">
                                                    {org}
                                                </span>
                                            ))}
                                            {donor.donationPreferences?.isLivingDonor && (
                                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg uppercase border border-emerald-100">
                                                    Living
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="bg-slate-50 p-3 rounded-2xl">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                                                <p className="font-bold text-slate-700 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Clinical Priority
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-2xl">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Reg. Date</p>
                                                <p className="font-bold text-slate-700 font-mono">
                                                    {new Date(donor.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center text-xs text-slate-500 gap-2">
                                            <MapPin size={14} className="text-slate-400" />
                                            <span className="truncate">{donor.location?.city || 'Region Access Restricted'}, {donor.location?.state || 'HQ'}</span>
                                        </div>
                                    </div>

                                    {/* Dynamic Action Area */}
                                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                                        {activeSegment === 'active' ? (
                                            <>
                                                <button
                                                    onClick={() => handleViewTimeline(donor)}
                                                    className="flex-1 py-2 text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl border border-blue-200 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <History size={14} /> Timeline
                                                </button>
                                                <button
                                                    onClick={() => onEdit(donor)}
                                                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-colors"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleRevealIdentity(donor._id)}
                                                disabled={revealLoading === donor._id || donor.isRevealed}
                                                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl border transition-all flex items-center justify-center gap-2 ${donor.isRevealed
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                                                    : 'text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white'
                                                    }`}
                                            >
                                                {revealLoading === donor._id ? (
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin" />
                                                ) : donor.isRevealed ? (
                                                    <><Eye size={14} /> Identity Revealed</>
                                                ) : (
                                                    <><EyeOff size={14} /> Reveal Identity</>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Timeline Modal */}
            {selectedDonor && (
                <Modal
                    isOpen={true}
                    onClose={() => { setSelectedDonor(null); setDonorTimeline(null); }}
                    title="Donor Lifecycle Log"
                    size="md"
                >
                    {!donorTimeline ? (
                        <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" /></div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-slate-900 rounded-2xl p-6 text-white mb-6">
                                <h4 className="text-xl font-black mb-1">{donorTimeline.donor.name}</h4>
                                <p className="text-slate-400 text-xs font-bold opacity-60 uppercase tracking-widest">Medical Record #{donorTimeline.donor.id.slice(-6)}</p>
                            </div>

                            <div className="relative pl-4 space-y-8">
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
                                {donorTimeline.timeline.map((event, i) => (
                                    <div key={i} className="relative pl-8">
                                        <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${event.type === 'transplant' ? 'bg-emerald-500' : 'bg-blue-500'
                                            }`} />
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                                            {new Date(event.timestamp).toLocaleString()}
                                        </p>
                                        <h5 className="font-black text-slate-800 leading-none">{event.title}</h5>
                                        <p className="text-sm text-slate-500 mt-2 font-medium">{event.details}</p>
                                        {event.status && (
                                            <span className="mt-2 inline-block px-2 py-0.5 bg-slate-100 text-[10px] font-bold rounded uppercase border border-slate-200">
                                                {event.status}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Modal>
            )}

            {/* Register New Donor Modal */}
            {showRegisterModal && (
                <Modal
                    isOpen={true}
                    onClose={() => setShowRegisterModal(false)}
                    title="Formal Medical Registration"
                    size="lg"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 flex items-center gap-3 p-4 bg-blue-50 text-blue-800 rounded-2xl border border-blue-100 mb-2">
                            <AlertCircle className="text-blue-500" />
                            <p className="text-xs font-bold uppercase tracking-wide">Enter valid medical credentials only. All entries are cryptographically logged for audit.</p>
                        </div>
                        <Input label="Legal First Name" placeholder="Required" />
                        <Input label="Legal Last Name" placeholder="Required" />
                        <Select label="Blood Type" options={[
                            { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
                            { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
                            { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
                            { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
                        ]} />
                        <Input label="Professional Email" type="email" />
                        <div className="md:col-span-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Organ Preservation Group</p>
                            <div className="flex flex-wrap gap-3">
                                {['heart', 'kidney', 'liver', 'lung', 'cornea'].map(org => (
                                    <label key={org} className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-white border hover:border-blue-500 rounded-xl cursor-pointer transition-all">
                                        <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm font-bold capitalize text-slate-700">{org}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <FileText size={14} /> Identity Verification (PDF/JPG)
                                </label>
                                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-blue-500 transition-colors cursor-pointer bg-white">
                                    <Plus size={24} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-[10px] font-bold text-slate-400">UPLOAD GOVERNMENT ID / PASSPORT</p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-end">
                                <label className="flex items-start gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 cursor-pointer">
                                    <input type="checkbox" className="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" required />
                                    <div className="text-xs font-bold text-emerald-800 leading-relaxed">
                                        I hereby certify that all medical documentation has been verified and donor consent is physically archived.
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="md:col-span-2 pt-6 border-t border-slate-100 flex gap-4">
                            <Button variant="secondary" onClick={() => setShowRegisterModal(false)} className="flex-1">Discard Draft</Button>
                            <Button variant="primary" className="flex-1">Commit to Registry</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default DonorsTab;
