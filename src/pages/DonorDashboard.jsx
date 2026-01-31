import React, { useState } from 'react';
import {
  Users, Activity, Settings, BookOpen, Clock, Shield,
  ChevronDown, ChevronUp, LogOut, User, Phone, Eye, EyeOff, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api'; // Import API service
import './DonorDashboard.css';

const DonorDashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isVisible, setIsVisible] = useState(user?.visibilityStatus !== 'private');
  const [isActiveDonor, setIsActiveDonor] = useState(user?.availabilityStatus !== 'Inactive');
  const [phoneError, setPhoneError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [donationHistory, setDonationHistory] = useState([]); // State for history
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [liveRequests, setLiveRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [applyingTo, setApplyingTo] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    medicalHistory: '',
    lifestyleData: '',
    consentSigned: false
  });

  // Fetch Data on Tab Change
  React.useEffect(() => {
    if (activeTab === 'history') {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          const res = await apiService.getUserHistory();
          if (res.success) {
            setDonationHistory(res.data);
          }
        } catch (err) {
          console.error("Failed to load history", err);
        } finally {
          setLoadingHistory(false);
        }
      };
      if (user?.donations) setDonationHistory(user.donations);
      fetchHistory();
    }

    if (activeTab === 'requests') {
      const fetchRequests = async () => {
        setLoadingRequests(true);
        try {
          const res = await apiService.getPublicRequests();
          if (res.success) {
            setLiveRequests(res.data);
          }
        } catch (err) {
          console.error("Failed to load requests", err);
        } finally {
          setLoadingRequests(false);
        }
      };
      fetchRequests();
    }
  }, [activeTab, user]);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    // Simple 10-digit validation
    if (value && !/^\d{10}$/.test(value.replace(/\D/g, ''))) {
      setPhoneError('Please enter a valid 10-digit phone number');
    } else {
      setPhoneError('');
    }
  };

  const handleSaveProfile = async () => {
    if (phoneError) return;

    try {
      setSaveStatus('saving');
      await updateProfile({
        phone,
        visibilityStatus: isVisible ? 'public' : 'private',
        availabilityStatus: isActiveDonor ? 'Active' : 'Inactive'
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('error');
    }
  };

  const handleApply = async (requestId) => {
    if (!applicationForm.consentSigned) {
      alert("You must sign the consent to apply.");
      return;
    }

    try {
      const res = await apiService.applyToRequest(requestId, applicationForm);
      if (res.success) {
        alert("Application submitted successfully! The hospital will review your medical profile.");
        setApplyingTo(null);
        setApplicationForm({ medicalHistory: '', lifestyleData: '', consentSigned: false });
        // Refresh requests or mark as applied
      }
    } catch (error) {
      alert(error.message || "Failed to submit application.");
    }
  };

  return (
    <div className="donor-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>LIFEBRIDGE<br />DONOR PORTAL</h1>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'profile', icon: Users, label: 'My Profile' },
            { id: 'requests', icon: Activity, label: 'Live Requests' },
            { id: 'history', icon: Clock, label: 'Donation History' },
            { id: 'education', icon: BookOpen, label: 'Education Center' },
            { id: 'settings', icon: Settings, label: 'Privacy & Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button onClick={logout} className="logout-btn w-full justify-center">
            <LogOut size={14} /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="top-bar">
          <div className="system-identity">
            <Shield size={16} className="text-[#10b981]" />
            <span>SECURE DONOR ENVIRONMENT</span>
          </div>

          <div className="top-bar-actions">
            <button className="profile-btn">
              <User size={14} className="text-[#64748b]" />
              <span>{user?.name || 'Donor'}</span>
            </button>
          </div>
        </div>

        <div className="dashboard-content-area">
          {/* PROFILE SECTION */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <h2 className="section-title">My Donor Profile</h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ID Card */}
                <div className="content-card lg:col-span-1">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-gray-400">
                      {user?.name?.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold text-[#1e293b]">{user?.name}</h3>
                    <p className="text-sm text-[#64748b]">{user?.email}</p>
                    <div className="mt-4 inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                      Verified Donor
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-[#94a3b8] uppercase">Blood Type</span>
                      <span className="font-bold text-[#1e293b] text-lg">{user?.bloodType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#94a3b8] uppercase">Registered Organ</span>
                      <span className="font-bold text-[#1e293b]">{user?.organ || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Extended Details Form */}
                <div className="content-card lg:col-span-2">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-[#1e293b]">Extended Information</h3>
                    {saveStatus === 'success' && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Saved</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="tel"
                        className={`form-input pl-10 ${phoneError ? 'border-red-500' : ''}`}
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={handlePhoneChange}
                      />
                    </div>
                    {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hospital Visibility</label>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isVisible ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                          {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#1e293b]">Allow Hospital Access</p>
                          <p className="text-xs text-[#64748b]">
                            {isVisible
                              ? "Your profile is visible to approved hospitals."
                              : "You are hidden from hospital searches."}
                          </p>
                        </div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={(e) => setIsVisible(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <label className="form-label">Availability Status</label>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActiveDonor ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                          <Activity size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#1e293b]">Donor Availability</p>
                          <p className="text-xs text-[#64748b]">
                            {isActiveDonor
                              ? "You are listed as an ACTIVE donor."
                              : "You are temporarily INACTIVE."}
                          </p>
                        </div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={isActiveDonor}
                          onChange={(e) => setIsActiveDonor(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="text-right mt-6">
                    <button
                      onClick={handleSaveProfile}
                      className={`btn-primary ${saveStatus === 'saving' || phoneError ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={saveStatus === 'saving' || !!phoneError}
                    >
                      {saveStatus === 'saving' ? 'Saving...' : 'Update Profile'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REQUESTS SECTION */}
          {activeTab === 'requests' && (
            <div className="animate-fade-in">
              <h2 className="section-title">Live Organ Requests</h2>
              <p className="text-sm text-slate-500 mb-6 italic">Browse real-time requests from hospitals. Your medical profile will be shared upon application.</p>

              {loadingRequests ? (
                <div className="text-center py-12">
                  <div className="loading-spinner mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">Scanning Medical Network...</p>
                </div>
              ) : liveRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {liveRequests.map(req => (
                    <div key={req._id} className="content-card hover:border-blue-500 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <Activity size={24} />
                          </div>
                          <div>
                            <h3 className="font-black text-[#1e293b] uppercase">{req.organType} Match Needed</h3>
                            <p className="text-[10px] font-bold text-slate-400">REQ ID: #{req.requestId}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${req.patient?.urgencyLevel === 'critical' ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-blue-100 text-blue-600'
                          }`}>
                          {req.patient?.urgencyLevel}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Blood Type</p>
                              <p className="font-bold text-slate-800">{req.patient?.bloodType}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Patient Age</p>
                              <p className="font-bold text-slate-800">{req.patient?.age}y</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Hospital</p>
                              <p className="font-bold text-slate-800 truncate">{req.hospital?.name}</p>
                            </div>
                          </div>
                        </div>

                        {applyingTo === req._id ? (
                          <div className="animate-fade-in space-y-4 border-t pt-4">
                            <div className="form-group">
                              <label className="text-xs font-black text-slate-500 uppercase mb-2 block">Personal Medical Summary</label>
                              <textarea
                                className="form-input text-sm h-24"
                                placeholder="Briefly describe your medical history (e.g. Prior surgeries, chronic conditions...)"
                                value={applicationForm.medicalHistory}
                                onChange={(e) => setApplicationForm({ ...applicationForm, medicalHistory: e.target.value })}
                              />
                            </div>
                            <div className="form-group">
                              <label className="text-xs font-black text-slate-500 uppercase mb-2 block">Lifestyle & Habits</label>
                              <input
                                className="form-input text-sm"
                                placeholder="e.g. Non-smoker, Regular exercise, No alcohol..."
                                value={applicationForm.lifestyleData}
                                onChange={(e) => setApplicationForm({ ...applicationForm, lifestyleData: e.target.value })}
                              />
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                              <input
                                type="checkbox"
                                className="w-5 h-5"
                                checked={applicationForm.consentSigned}
                                onChange={(e) => setApplicationForm({ ...applicationForm, consentSigned: e.target.checked })}
                              />
                              <p className="text-[10px] font-bold text-amber-800 leading-tight">
                                I hereby give legal consent for my medical profile to be shared with {req.hospital?.name} for matching purposes.
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setApplyingTo(null)} className="btn-secondary py-2 text-xs flex-1">Abandom</button>
                              <button onClick={() => handleApply(req._id)} className="btn-primary py-2 text-xs flex-1">Submit Analysis</button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setApplyingTo(req._id)}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                          >
                            Begin Application
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                  <Activity size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold">No active requests found for your profile criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* EDUCATION SECTION */}
          {activeTab === 'education' && (
            <div className="animate-fade-in">
              <h2 className="section-title">Donor Education Center</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="edu-card">
                  <div className="edu-title"><Activity size={20} className="text-blue-500" /> How Organ Donation Works</div>
                  <p className="edu-content">
                    Organ donation is the process of surgically removing an organ or tissue from one person (the organ donor) and placing it into another person (the recipient). Transplantation is necessary because the recipient’s organ has failed or has been damaged by disease or injury.
                  </p>
                </div>

                <div className="edu-card">
                  <div className="edu-title"><AlertCircle size={20} className="text-amber-500" /> Common Myths Debunked</div>
                  <ul className="edu-content list-disc pl-5 space-y-2">
                    <li><strong>Myth:</strong> If I'm a donor, doctors won't work as hard to save my life.</li>
                    <li><strong>Fact:</strong> Your life always comes first. Donation is only considered after death is declared.</li>
                    <li><strong>Myth:</strong> I'm too old to donate.</li>
                    <li><strong>Fact:</strong> There is no strict age limit. Suitability is based on medical condition.</li>
                  </ul>
                </div>

                <div className="edu-card">
                  <div className="edu-title"><Shield size={20} className="text-[#10b981]" /> Your Rights & Consent</div>
                  <p className="edu-content">
                    As a donor, you have the right to withdraw your consent at any time before the procedure. Your medical information is protected by strict privacy laws (HIPAA/GDPR equivalent). You will never be charged for costs related to donation.
                  </p>
                </div>

                <div className="edu-card">
                  <div className="edu-title"><BookOpen size={20} className="text-[#8b5cf6]" /> Frequently Asked Questions</div>
                  <div className="space-y-4 mt-2">
                    <details className="group">
                      <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-sm text-[#1e293b]">
                        <span>Does donation disfigure the body?</span>
                        <span className="transition group-open:rotate-180"><ChevronDown size={16} /></span>
                      </summary>
                      <p className="text-xs text-[#64748b] mt-2 pl-2 border-l-2 border-gray-200">
                        No. Donation does not disfigure the body. An open casket funeral is still possible.
                      </p>
                    </details>
                    <details className="group">
                      <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-sm text-[#1e293b]">
                        <span>Can I choose who gets my organs?</span>
                        <span className="transition group-open:rotate-180"><ChevronDown size={16} /></span>
                      </summary>
                      <p className="text-xs text-[#64748b] mt-2 pl-2 border-l-2 border-gray-200">
                        In directed donation (living donors), yes. For deceased donation, organs are matched based on medical compatibility and urgency via the national waitlist.
                      </p>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HISTORY SECTION */}
          {activeTab === 'history' && (
            <div className="animate-fade-in">
              <h2 className="section-title">Donation History</h2>

              <div className="content-card">
                {donationHistory.length > 0 ? (
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Organ</th>
                        <th>Hospital Involved</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donationHistory.map((item, idx) => (
                        <tr key={idx}>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                          <td className="font-bold">{item.organ}</td>
                          <td>{item.hospital}</td>
                          <td>
                            <span className={`status-badge status-${item.status}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <Clock size={48} className="mx-auto text-gray-200 mb-4" />
                    <h3 className="text-gray-400 font-bold mb-1">No Donation History</h3>
                    <p className="text-xs text-gray-400">You have not completed any donations yet. Thank you for registering.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS SECTION */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <h2 className="section-title">Privacy & Settings</h2>
              <div className="content-card">
                <p className="text-sm text-[#64748b]">Advanced account settings and data download options will appear here.</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default DonorDashboard;
