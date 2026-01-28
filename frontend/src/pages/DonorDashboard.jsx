import React, { useState } from 'react';
import {
  Users, Activity, Settings, BookOpen, Clock, Shield,
  ChevronDown, ChevronUp, LogOut, User, Phone, Eye, EyeOff, CheckCircle, AlertCircle, Lock
} from 'lucide-react';
import { useAuth } from '../landing/contexts/AuthContext';
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
  const [confidentialRequests, setConfidentialRequests] = useState([]);
  const [loadingConfidentialRequests, setLoadingConfidentialRequests] = useState(false);

  // Confidential data state
  const [confidentialData, setConfidentialData] = useState({
    pii: { governmentId: '', photograph: '' },
    contactInfo: { emergencyContact: '', alternateContacts: [] },
    detailedMedicalRecords: {
      pastSurgeries: [],
      chronicIllnesses: [],
      mentalHealthHistory: [],
      geneticDisorders: [],
      familyMedicalHistory: [],
      currentMedications: [],
      allergies: []
    },
    labReports: {
      bloodTestReports: [],
      hlaTypingReports: [],
      crossMatchResults: [],
      imagingReports: []
    }
  });
  const [loadingConfidentialData, setLoadingConfidentialData] = useState(false);
  const [saveConfidentialStatus, setSaveConfidentialStatus] = useState('');

  // Fetch History on Tab Change
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
      // If user.donations exists (from login), use it initially, but fetch fresh too
      if (user?.donations) setDonationHistory(user.donations);
      fetchHistory();
    } else if (activeTab === 'confidential') {
      const fetchConfidentialRequests = async () => {
        setLoadingConfidentialRequests(true);
        try {
          const res = await apiService.getDonorConfidentialRequests(user.id);
          if (res.success) {
            setConfidentialRequests(res.data);
          }
        } catch (err) {
          console.error("Failed to load confidential requests", err);
        } finally {
          setLoadingConfidentialRequests(false);
        }
      };

      const fetchConfidentialData = async () => {
        setLoadingConfidentialData(true);
        try {
          const res = await apiService.getConfidentialData();
          if (res.success && res.data) {
            setConfidentialData(prevData => ({
              ...prevData,
              ...res.data
            }));
          }
        } catch (err) {
          console.error("Failed to load confidential data", err);
        } finally {
          setLoadingConfidentialData(false);
        }
      };

      fetchConfidentialRequests();
      fetchConfidentialData();
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

  const handleRespondToRequest = async (requestId, status) => {
    try {
      const res = await apiService.respondToConfidentialRequest(requestId, status);
      if (res.success) {
        // Update the local state
        setConfidentialRequests(prev =>
          prev.map(req =>
            req._id === requestId
              ? { ...req, status, respondedAt: new Date() }
              : req
          )
        );
        alert(`Request ${status} successfully`);
      }
    } catch (error) {
      console.error('Failed to respond to request', error);
      alert('Failed to respond to request');
    }
  };

  const handleSaveConfidentialData = async () => {
    try {
      setSaveConfidentialStatus('saving');
      const res = await apiService.updateConfidentialData(confidentialData);
      if (res.success) {
        setSaveConfidentialStatus('success');
        setTimeout(() => setSaveConfidentialStatus(''), 3000);
      } else {
        setSaveConfidentialStatus('error');
      }
    } catch (error) {
      console.error('Failed to save confidential data', error);
      setSaveConfidentialStatus('error');
    }
  };

  const handleConfidentialDataChange = (category, field, value) => {
    setConfidentialData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleArrayFieldChange = (category, field, index, value) => {
    setConfidentialData(prev => {
      const newArray = [...prev[category][field]];
      newArray[index] = value;
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: newArray
        }
      };
    });
  };

  const addArrayField = (category, field) => {
    setConfidentialData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: [...prev[category][field], '']
      }
    }));
  };

  const removeArrayField = (category, field, index) => {
    setConfidentialData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: prev[category][field].filter((_, i) => i !== index)
      }
    }));
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
            { id: 'history', icon: Clock, label: 'Donation History' },
            { id: 'confidential', icon: Lock, label: 'Confidential Data' },
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

          {/* EDUCATION SECTION */}
          {activeTab === 'education' && (
            <div className="animate-fade-in">
              <h2 className="section-title">Donor Education Center</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="edu-card">
                  <div className="edu-title"><Activity size={20} className="text-blue-500" /> How Organ Donation Works</div>
                  <p className="edu-content">
                    Organ donation is the process of surgically removing an organ or tissue from one person (the organ donor) and placing it into another person (the recipient). Transplantation is necessary because the recipient's organ has failed or has been damaged by disease or injury.
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

          {/* CONFIDENTIAL DATA SECTION */}
          {activeTab === 'confidential' && (
            <div className="animate-fade-in">
              <h2 className="section-title">Confidential Medical Environment</h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* DATA ENTRY FORM */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="content-card">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-[#1e293b]">Confidential Data Entry</h3>
                      {saveConfidentialStatus === 'success' && (
                        <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                          <CheckCircle size={12} /> Saved Successfully
                        </span>
                      )}
                      {saveConfidentialStatus === 'error' && (
                        <span className="text-red-600 text-xs font-bold flex items-center gap-1">
                          <AlertCircle size={12} /> Save Failed
                        </span>
                      )}
                    </div>

                    {loadingConfidentialData ? (
                      <p className="text-center py-8 text-gray-500">Loading your confidential data...</p>
                    ) : (
                      <div className="space-y-6">
                        {/* PII SECTION */}
                        <div className="border-b border-gray-100 pb-4">
                          <h4 className="text-sm font-bold text-[#64748b] uppercase mb-4">Personal Identification</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group mb-0">
                              <label className="form-label">Government ID Number</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Passport/SSN/Aadhar"
                                value={confidentialData.pii.governmentId}
                                onChange={(e) => handleConfidentialDataChange('pii', 'governmentId', e.target.value)}
                              />
                            </div>
                            <div className="form-group mb-0">
                              <label className="form-label">Emergency Contact Name/Phone</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Name - Phone"
                                value={confidentialData.contactInfo.emergencyContact}
                                onChange={(e) => handleConfidentialDataChange('contactInfo', 'emergencyContact', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* MEDICAL RECORDS SECTION */}
                        <div className="border-b border-gray-100 pb-4">
                          <h4 className="text-sm font-bold text-[#64748b] uppercase mb-4">Medical History</h4>

                          <div className="space-y-4">
                            <div>
                              <label className="form-label flex justify-between">
                                Chronic Illnesses
                                <button onClick={() => addArrayField('detailedMedicalRecords', 'chronicIllnesses')} className="text-[#10b981] text-xs font-bold">+ Add</button>
                              </label>
                              {confidentialData.detailedMedicalRecords.chronicIllnesses.map((item, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={item}
                                    onChange={(e) => handleArrayFieldChange('detailedMedicalRecords', 'chronicIllnesses', index, e.target.value)}
                                  />
                                  <button onClick={() => removeArrayField('detailedMedicalRecords', 'chronicIllnesses', index)} className="text-red-500"><AlertCircle size={16} /></button>
                                </div>
                              ))}
                              {confidentialData.detailedMedicalRecords.chronicIllnesses.length === 0 && <p className="text-xs text-gray-400 italic">None listed</p>}
                            </div>

                            <div>
                              <label className="form-label flex justify-between">
                                Allergies
                                <button onClick={() => addArrayField('detailedMedicalRecords', 'allergies')} className="text-[#10b981] text-xs font-bold">+ Add</button>
                              </label>
                              {confidentialData.detailedMedicalRecords.allergies.map((item, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={item}
                                    onChange={(e) => handleArrayFieldChange('detailedMedicalRecords', 'allergies', index, e.target.value)}
                                  />
                                  <button onClick={() => removeArrayField('detailedMedicalRecords', 'allergies', index)} className="text-red-500"><AlertCircle size={16} /></button>
                                </div>
                              ))}
                              {confidentialData.detailedMedicalRecords.allergies.length === 0 && <p className="text-xs text-gray-400 italic">None listed</p>}
                            </div>

                            <div className="form-group mb-0">
                              <label className="form-label">Current Medications</label>
                              <textarea
                                className="form-input min-h-[80px]"
                                placeholder="List your current medications..."
                                value={confidentialData.detailedMedicalRecords.currentMedications.join(', ')}
                                onChange={(e) => handleConfidentialDataChange('detailedMedicalRecords', 'currentMedications', e.target.value.split(',').map(s => s.trim()))}
                              />
                            </div>
                          </div>
                        </div>

                        {/* LAB REPORTS / HLA TYPING */}
                        <div>
                          <h4 className="text-sm font-bold text-[#64748b] uppercase mb-4">Laboratory & HLA Data</h4>
                          <div className="form-group mb-4">
                            <label className="form-label">HLA Typing Results (if known)</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g. A2, B35, DR1..."
                              value={confidentialData.labReports.hlaTypingReports.join(', ')}
                              onChange={(e) => handleConfidentialDataChange('labReports', 'hlaTypingReports', e.target.value.split(',').map(s => s.trim()))}
                            />
                          </div>
                        </div>

                        <div className="text-right pt-4">
                          <button
                            onClick={handleSaveConfidentialData}
                            className={`btn-primary ${saveConfidentialStatus === 'saving' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={saveConfidentialStatus === 'saving'}
                          >
                            {saveConfidentialStatus === 'saving' ? 'Saving Securely...' : 'Save Confidential Data'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ACCESS REQUESTS SIDEBAR */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="content-card">
                    <h3 className="text-lg font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                      <Lock size={18} className="text-amber-500" /> Access Requests
                    </h3>

                    {loadingConfidentialRequests ? (
                      <p className="text-center py-4 text-xs text-gray-500">Updating requests...</p>
                    ) : confidentialRequests.length > 0 ? (
                      <div className="space-y-3">
                        {confidentialRequests.map((request) => (
                          <div key={request._id} className="p-3 border border-gray-100 rounded-lg bg-gray-50">
                            <p className="font-bold text-sm text-[#1e293b]">{request.hospitalName}</p>
                            <p className="text-[10px] text-[#64748b] mb-2">Requested: {new Date(request.requestedAt).toLocaleDateString()}</p>

                            {request.status === 'pending' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleRespondToRequest(request._id, 'accepted')}
                                  className="text-[10px] bg-green-500 text-white px-3 py-1 rounded font-bold hover:bg-green-600 transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRespondToRequest(request._id, 'rejected')}
                                  className="text-[10px] bg-red-500 text-white px-3 py-1 rounded font-bold hover:bg-red-600 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${request.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {request.status.toUpperCase()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Shield size={32} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-xs text-gray-400">No active access requests.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <div className="flex gap-2 text-amber-800 mb-1">
                      <Lock size={14} className="mt-0.5" />
                      <p className="text-xs font-bold">Privacy Note</p>
                    </div>
                    <p className="text-[10px] text-amber-700 leading-relaxed">
                      Your confidential data is stored with end-to-end encryption. Only hospitals you explicitly approve can view this sensitive information for matching purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS SECTION (Placeholder for now, merged visibility into profile as per common UX) */}
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

