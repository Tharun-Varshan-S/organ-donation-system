import React, { useState, useEffect } from 'react';
import {
  Users, Activity, Heart, Search, CheckCircle2, Clock,
  XCircle, Filter, Home, LayoutDashboard, ClipboardList,
  UserCircle, Settings, LogOut, Bell, Menu, X, ShieldAlert, Stethoscope, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';

// New Enhanced Tabs
import OverviewTab from './hospital/HospitalDashboardTabs/OverviewTab';
import DonorsTab from './hospital/HospitalDashboardTabs/DonorsTab';
import RequestsTab from './hospital/HospitalDashboardTabs/RequestsTab';
import TransplantsTab from './hospital/HospitalDashboardTabs/TransplantsTab';
import ProfileTab from './hospital/HospitalDashboardTabs/ProfileTab';
import DoctorsTab from './hospital/HospitalDashboardTabs/DoctorsTab';
import { EmergencyBanner, GlassCard } from './hospital/HospitalDashboardTabs/DashboardComponents';

const HospitalDashboard = () => {
  const { user, logout, showApprovalMessage, setShowApprovalMessage } = useAuth();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [transplants, setTransplants] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Modal states from original code
  const [editingDonor, setEditingDonor] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Navigation Items
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'donors', label: 'Donor Management', icon: Users },
    { id: 'requests', label: 'Organ Requests', icon: ShieldAlert },
    { id: 'transplants', label: 'Transplants', icon: ClipboardList },
    { id: 'doctors', label: 'Doctor Management', icon: Stethoscope },
    { id: 'profile', label: 'Hospital Profile', icon: UserCircle },
  ];

  // Data Fetching
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Parallel fetching for performance
        const [statsRes, donorsRes, requestsRes, transplantsRes, notifyRes] = await Promise.all([
          apiService.getHospitalStats().catch(() => ({ success: false })),
          apiService.getHospitalDonors().catch(() => ({ success: false })),
          apiService.getHospitalRequests().catch(() => ({ success: false })),
          apiService.getHospitalTransplants().catch(() => ({ success: false })),
          apiService.getHospitalNotifications().catch(() => ({ success: false }))
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (donorsRes.success) setDonors(donorsRes.data);
        if (requestsRes.success) setRequests(requestsRes.data);
        if (transplantsRes.success) setTransplants(transplantsRes.data);
        if (notifyRes.success) setNotifications(notifyRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.status === 'APPROVED' || user?.status === 'approved') {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Original Logic Handlers (Enhanced)
  const handleEditDonor = (donor) => {
    setEditingDonor(donor);
    setEditFormData({ ...donor });
  };

  const handleSaveEdit = async () => {
    try {
      const res = await apiService.updateHospitalDonor(editingDonor.id, editFormData);
      if (res.success) {
        setDonors(prev => prev.map(d => d.id === editingDonor.id ? res.data : d));
        setEditingDonor(null);
      }
    } catch (err) {
      alert("Failed to update donor");
    }
  };

  const handleDeleteDonor = async (id) => {
    if (window.confirm('Are you sure you want to delete this donor? This action is permanent and medical records will be archived.')) {
      try {
        await apiService.deleteHospitalDonor(id);
        setDonors(prev => prev.filter(d => d.id !== id));
      } catch (err) {
        alert("Failed to delete donor");
      }
    }
  };

  // Status Check
  const hospitalStatus = user?.status?.toUpperCase() || 'PENDING';
  const isApproved = hospitalStatus === 'APPROVED';
  const isRejected = hospitalStatus === 'REJECTED';

  // --- Sub-screens (Pending/Rejected) ---

  if (isRejected) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar user={user} onLogout={logout} />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <GlassCard className="max-w-md text-center py-12 px-8 border-red-200">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={48} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Revoked</h1>
              <p className="text-slate-500 mb-8 lowercase first-letter:uppercase">
                Your hospital registration has been rejected by the medical board. Please contact the administrator for more information.
              </p>
              <Button variant="primary" onClick={logout} className="w-full">Return to Exit</Button>
            </GlassCard>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar user={user} onLogout={logout} />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <GlassCard className="max-w-lg text-center py-16 px-10 border-blue-200">
              <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
                <Clock size={48} className="animate-spin-slow" style={{ animationDuration: '8s' }} />
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-3xl animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-4">Verification in Progress</h1>
              <p className="text-slate-500 text-lg mb-2">Establishing secure medical credentials...</p>
              <p className="text-slate-400 text-sm mb-10">This usually takes 24-48 business hours for accreditation.</p>
              <div className="flex gap-4">
                <Button variant="secondary" onClick={logout} className="flex-1">Cancel Application</Button>
                <Button variant="primary" onClick={() => window.location.reload()} className="flex-1">Check Status</Button>
              </div>
            </GlassCard>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 shadow-xl lg:shadow-none`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Heart size={24} fill="currentColor" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">LifeBridge</h1>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest -mt-1">Medical Portal</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                  {item.label}
                  {activeTab === item.id && (
                    <motion.div layoutId="nav-indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-8 pt-4 space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white">
                  {user?.name?.charAt(0) || 'H'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 truncate uppercase">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
              >
                <LogOut size={14} />
                Secure Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : ''}`}>

        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden">
            <Menu size={24} />
          </button>

          <div className="flex-1 px-4 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Universal medical search..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl text-sm transition-all focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative">
                <Bell size={20} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                )}
              </button>

              {/* Notifications Dropdown */}
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-4">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
                  <h4 className="font-black text-xs uppercase tracking-widest text-slate-800">Alert Center</h4>
                  <span className="text-[10px] font-bold text-blue-600">Mark all as read</span>
                </div>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n._id} className={`p-3 rounded-xl border transition-all cursor-pointer ${n.read ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-blue-100 shadow-sm shadow-blue-50'}`}>
                        <div className="flex gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'EMERGENCY' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                          <div>
                            <p className="text-xs font-bold text-slate-800 leading-tight">{n.title}</p>
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-xs text-slate-400 font-medium italic">No new transmissions.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('requests')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all active:scale-95 group"
            >
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Emergency Hub
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-6 lg:p-10 max-w-7xl mx-auto">

          {/* Emergency Banner (Conditional) */}
          <AnimatePresence>
            {stats?.criticalRequests?.length > 0 && (
              <EmergencyBanner
                message={`${stats.criticalRequests[0].patient.name} (${stats.criticalRequests[0].organType?.toUpperCase()}) - ALPHA MATCH REQUIRED`}
                count={stats.criticalRequests.length}
                onClick={() => {
                  const firstCriticalId = stats.criticalRequests[0]._id;
                  navigate(`/hospital/requests/${firstCriticalId}`);
                }}
              />
            )}
          </AnimatePresence>

          <header className="mb-10">
            <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
              <Home size={14} />
              <span>/</span>
              <span>Portal</span>
              <span>/</span>
              <span className="text-blue-600">{activeTab}</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
          </header>

          <div className="min-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {activeTab === 'overview' && <OverviewTab stats={stats} />}
                  {activeTab === 'donors' && (
                    <DonorsTab
                      donors={donors}
                      onEdit={handleEditDonor}
                      onDelete={handleDeleteDonor}
                      onAdd={() => alert("Redirect to Add Donor module")}
                    />
                  )}
                  {activeTab === 'requests' && <RequestsTab requests={requests} />}
                  {activeTab === 'transplants' && <TransplantsTab transplants={transplants} />}
                  {activeTab === 'doctors' && <DoctorsTab />}
                  {activeTab === 'profile' && <ProfileTab hospital={user} />}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* Legacy Edit Modal (Kept as per requirement to not break functionality) */}
      {editingDonor && (
        <Modal isOpen={true} onClose={() => setEditingDonor(null)} title="Modify Donor Record" size="md">
          <div className="space-y-4 p-2">
            <Input
              label="FullName"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            />
            <Input
              label="Location/Address"
              value={editFormData.address}
              onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Organ"
                value={editFormData.organ}
                onChange={(e) => setEditFormData({ ...editFormData, organ: e.target.value })}
                options={[
                  { value: 'Kidney', label: 'Kidney' },
                  { value: 'Liver', label: 'Liver' },
                  { value: 'Heart', label: 'Heart' },
                  { value: 'Lung', label: 'Lung' },
                ]}
              />
              <Input
                label="Age"
                type="number"
                value={editFormData.age}
                onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
              />
            </div>
            <div className="flex gap-4 mt-8">
              <Button variant="secondary" onClick={() => setEditingDonor(null)} className="flex-1">Discard</Button>
              <Button variant="primary" onClick={handleSaveEdit} className="flex-1 shadow-lg shadow-blue-100">Commit Changes</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HospitalDashboard;
