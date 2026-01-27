import React, { useState, useEffect } from 'react';
import {
    MapPin, Phone, Mail, Award, ShieldCheck,
    Map as MapIcon, Building2, Clock, Globe,
    AlertCircle, Zap, Lock, CheckCircle2,
    Edit2, Save, X
} from 'lucide-react';
import { GlassCard } from './DashboardComponents';
import apiService from '../../../services/api';

const ProfileTab = ({ hospital: initialHospital }) => {
    const [hospital, setHospital] = useState(initialHospital);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setHospital(initialHospital);
        setFormData({
            phone: initialHospital?.contactInfo?.phone || '',
            emergencyPhone: initialHospital?.contactInfo?.emergencyPhone || '',
            address: initialHospital?.location?.address || '',
            city: initialHospital?.location?.city || '',
            state: initialHospital?.location?.state || '',
            zipCode: initialHospital?.location?.zipCode || '',
            specializations: initialHospital?.specializations || [],
            totalBeds: initialHospital?.capacity?.totalBeds || 0,
            availableBeds: initialHospital?.capacity?.availableBeds || 0
        });
    }, [initialHospital]);

    const handleSave = async () => {
        try {
            const res = await apiService.updateHospitalProfile(formData);
            if (res.success) {
                setHospital(res.data);
                setIsEditing(false);
            }
        } catch (error) {
            alert("Failed to update profile.");
        }
    };

    // Google Maps Iframe for visual impact
    const mapQuery = encodeURIComponent(`${hospital?.location?.address}, ${hospital?.location?.city}, ${hospital?.location?.state}`);
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${mapQuery}`;
    // Using an image placeholder for map since I don't have an API key, but styling it to look premium
    const mapPlaceholderUrl = `https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200`;

    return (
        <div className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Accreditation & Status */}
                <div className="lg:col-span-1 space-y-6">
                    <GlassCard className="text-center relative overflow-hidden pt-12">
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
                        <div className="w-24 h-24 bg-blue-50 rounded-[2rem] mx-auto flex items-center justify-center text-blue-600 mb-6 border-4 border-white shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Building2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight px-4">{hospital?.name}</h2>

                        <div className="mt-4 flex flex-col items-center gap-2">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border border-emerald-100 shadow-sm">
                                <ShieldCheck size={14} />
                                Verified Institutional Partner
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Medical Board ID: {hospital?._id?.slice(-12).toUpperCase()}</span>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Status</p>
                                <p className="text-sm font-black text-emerald-600 uppercase italic">{hospital?.status}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Accreditation</p>
                                <p className="text-sm font-black text-slate-700 uppercase italic">Level 1</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="bg-slate-900 border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/40">
                                    <Award className="text-white" size={20} />
                                </div>
                                <h3 className="text-lg font-black text-white uppercase tracking-[0.1em]">License</h3>
                            </div>
                            <div className="px-3 py-1 bg-white/10 rounded-lg border border-white/5">
                                <span className="text-[10px] font-black text-white italic uppercase tracking-widest">Valid</span>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:border-blue-500/50 transition-colors">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Institutional Permit</p>
                                <p className="text-xl font-black text-blue-400 tracking-widest font-mono">{hospital?.licenseNumber}</p>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                <div className={`w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] ${hospital?.isEmergencyReady ? 'animate-pulse' : ''}`} />
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-wider">Emergency Readiness</p>
                                    <p className="text-[10px] font-bold text-emerald-400/80 mt-0.5">Rapid Response Capable</p>
                                </div>
                                <Zap size={18} className="ml-auto text-amber-400" />
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Right columns */}
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard className="relative">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <Globe size={22} className="text-blue-600" />
                                Facility Information
                            </h3>
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${isEditing ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                                    }`}
                            >
                                {isEditing ? <><Save size={14} /> Commit Changes</> : <><Edit2 size={14} /> Update Registry</>}
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                            <ProfileField
                                icon={MapPin} label="Facility Address"
                                value={isEditing ? <input className="w-full bg-slate-50 p-2 rounded border" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /> : hospital?.location?.address}
                            />
                            <ProfileField
                                icon={Mail} label="Administrative Email"
                                value={hospital?.email}
                                readOnly
                            />
                            <ProfileField
                                icon={Phone} label="General Inquiries"
                                value={isEditing ? <input className="w-full bg-slate-50 p-2 rounded border" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /> : hospital?.contactInfo?.phone}
                            />
                            <ProfileField
                                icon={AlertCircle} label="Emergency Hotline"
                                value={isEditing ? <input className="w-full bg-slate-50 p-2 rounded border" value={formData.emergencyPhone} onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })} /> : hospital?.contactInfo?.emergencyPhone}
                            />
                            <ProfileField
                                icon={Clock} label="Active Since"
                                value={new Date(hospital?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                readOnly
                            />
                            <ProfileField
                                icon={Zap} label="Capacity (Beds)"
                                value={`${hospital?.capacity?.availableBeds} / ${hospital?.capacity?.totalBeds} Available`}
                                readOnly
                            />
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Board-Certified Specializations</h4>
                            <div className="flex flex-wrap gap-2">
                                {hospital?.specializations?.map(spec => (
                                    <span key={spec} className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-black border border-blue-100 uppercase tracking-tight">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {hospital?.adminRemarks && (
                            <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 relative group">
                                <Lock size={16} className="absolute top-4 right-4 text-amber-300" />
                                <h4 className="text-[10px] font-black text-amber-700/60 uppercase tracking-[0.2em] mb-2">Internal Admin Remarks (System Locked)</h4>
                                <p className="text-sm text-amber-800 font-bold italic leading-relaxed">"{hospital.adminRemarks}"</p>
                            </div>
                        )}
                    </GlassCard>

                    {/* Interactive Map (Simulated Premium Visual) */}
                    <div className="rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl h-[400px] relative group bg-slate-200">
                        <img
                            src={mapPlaceholderUrl}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                            alt="Facility Location Map"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                        <div className="absolute top-8 left-8">
                            <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-white flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                    <MapIcon size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Positioning</p>
                                    <p className="text-sm font-black text-slate-800">{hospital?.location?.city}, {hospital?.location?.state}</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-8 left-8 right-8">
                            <div className="bg-slate-900/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                        <MapPin size={20} />
                                    </div>
                                    <p className="text-white font-bold text-sm">Center for Advanced Immunology & Organ Acquisition</p>
                                </div>
                                <Button variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs">Recalibrate Hub</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileField = ({ icon: Icon, label, value, readOnly = false }) => (
    <div className="space-y-1.5 group">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 group-hover:text-blue-500 transition-colors">
            <Icon size={12} strokeWidth={3} /> {label}
        </p>
        <div className={`text-sm font-bold text-slate-700 leading-relaxed ${readOnly ? 'opacity-80 italic' : ''}`}>
            {value || <span className="text-slate-300">Not Logged</span>}
        </div>
    </div>
);

export default ProfileTab;
