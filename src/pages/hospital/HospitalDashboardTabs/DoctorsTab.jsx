import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Stethoscope, Activity, CheckCircle,
    Trash2, Edit2, AlertCircle, Phone, Mail, Award, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../../services/api';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';

const DoctorsTab = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        specialization: '',
        licenseNumber: '',
        email: '',
        phone: '',
        availability: 'available',
        experience: ''
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const res = await apiService.getDoctors();
            if (res.success) {
                setDoctors(res.data);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (doctor = null) => {
        if (doctor) {
            setEditingDoctor(doctor);
            setFormData({
                name: doctor.name,
                specialization: doctor.specialization,
                licenseNumber: doctor.licenseNumber,
                email: doctor.email,
                phone: doctor.phone || '',
                availability: doctor.availability,
                experience: doctor.experience || ''
            });
        } else {
            setEditingDoctor(null);
            setFormData({
                name: '',
                specialization: '',
                licenseNumber: '',
                email: '',
                phone: '',
                availability: 'available',
                experience: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDoctor) {
                await apiService.updateDoctor(editingDoctor._id, formData);
            } else {
                await apiService.addDoctor(formData);
            }
            setShowModal(false);
            fetchDoctors();
        } catch (error) {
            alert(error.message || 'Failed to save doctor');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this doctor from the registry?')) {
            try {
                await apiService.removeDoctor(id);
                fetchDoctors();
            } catch (error) {
                alert('Failed to remove doctor');
            }
        }
    };

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-emerald-500';
            case 'on-call': return 'bg-amber-500';
            case 'busy': return 'bg-rose-500';
            default: return 'bg-slate-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, specialization, or license..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="primary" onClick={() => handleOpenModal()} className="w-full md:w-auto flex items-center gap-2">
                    <Plus size={20} />
                    Register New Surgeon
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredDoctors.map((doc, index) => (
                            <motion.div
                                key={doc._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                            <Stethoscope size={28} />
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(doc)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(doc._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{doc.name}</h3>
                                        <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider">{doc.specialization}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className={`w-2 h-2 rounded-full ${getStatusColor(doc.availability)}`} />
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight capitalize">{doc.availability}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="text-center p-3 bg-slate-50 rounded-2xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Success</p>
                                            <p className="text-lg font-black text-emerald-600">{doc.stats?.successRate || 0}%</p>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 rounded-2xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cases</p>
                                            <p className="text-lg font-black text-slate-700">{doc.stats?.totalSurgeries || 0}</p>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 rounded-2xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Exp.</p>
                                            <p className="text-lg font-black text-slate-700">{doc.experience || 0}y</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-3 text-slate-500 text-sm">
                                            <Award size={16} className="text-slate-400" />
                                            <span className="font-medium"># {doc.licenseNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500 text-sm">
                                            <Mail size={16} className="text-slate-400" />
                                            <span className="truncate">{doc.email}</span>
                                        </div>
                                        {doc.phone && (
                                            <div className="flex items-center gap-3 text-slate-500 text-sm">
                                                <Phone size={16} className="text-slate-400" />
                                                <span>{doc.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {showModal && (
                <Modal
                    isOpen={true}
                    onClose={() => setShowModal(false)}
                    title={editingDoctor ? "Update Surgeon Profile" : "Register Consultant Surgeon"}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Full Name *"
                                placeholder="Dr. John Smith"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Select
                                label="Specialization *"
                                value={formData.specialization}
                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                required
                                options={[
                                    { value: 'Cardiac Transplant', label: 'Cardiac Transplant' },
                                    { value: 'Renal Transplant', label: 'Renal Transplant' },
                                    { value: 'Hepatic Transplant', label: 'Hepatic Transplant' },
                                    { value: 'Pulmonary Transplant', label: 'Pulmonary Transplant' },
                                    { value: 'Pancreatic Transplant', label: 'Pancreatic Transplant' },
                                    { value: 'Corneal Transplant', label: 'Corneal Transplant' },
                                ]}
                            />
                            <Input
                                label="Medical License Number *"
                                placeholder="MC-123456"
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                required
                                disabled={!!editingDoctor}
                            />
                            <Input
                                label="Years of Experience"
                                type="number"
                                placeholder="10"
                                value={formData.experience}
                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            />
                            <Input
                                label="Professional Email *"
                                type="email"
                                placeholder="surgeon@hospital.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <Input
                                label="Direct Phone"
                                placeholder="+1 234 567 890"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <Select
                                label="Status/Availability"
                                value={formData.availability}
                                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                options={[
                                    { value: 'available', label: 'Available' },
                                    { value: 'on-call', label: 'On-Call' },
                                    { value: 'busy', label: 'Busy/In Surgery' },
                                    { value: 'away', label: 'Away' },
                                ]}
                            />
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                            <Button variant="primary" type="submit" className="flex-1">
                                {editingDoctor ? "Update Registry" : "Complete Registration"}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default DoctorsTab;
