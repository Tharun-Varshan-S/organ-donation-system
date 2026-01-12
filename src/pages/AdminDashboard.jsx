import React, { useState } from 'react';
import { Users, Heart, Building2, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import Card from '../components/Card';
import Button from '../components/Button';

const AdminDashboard = () => {
  const { user, logout, getPendingHospitals, getAllHospitals, approveHospital, rejectHospital } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');

  const pendingHospitals = getPendingHospitals();
  const allHospitals = getAllHospitals();
  const approvedHospitals = allHospitals.filter(h => h.status === 'APPROVED');
  const rejectedHospitals = allHospitals.filter(h => h.status === 'REJECTED');

  const handleApprove = (hospitalId) => {
    if (window.confirm('Are you sure you want to approve this hospital?')) {
      approveHospital(hospitalId);
    }
  };

  const handleReject = (hospitalId) => {
    if (window.confirm('Are you sure you want to reject this hospital? They will be logged out immediately.')) {
      rejectHospital(hospitalId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D4E8E8] via-[#A2BFC6] to-[#798E93]">
      <AnimatedBackground />
      <Navbar user={user} onLogout={logout} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Hospitals', value: allHospitals.length.toString(), icon: Building2, color: '[#556B73]' },
            { label: 'Pending Approval', value: pendingHospitals.length.toString(), icon: Clock, color: 'yellow-600' },
            { label: 'Approved Hospitals', value: approvedHospitals.length.toString(), icon: CheckCircle, color: 'green-600' },
            { label: 'Rejected Hospitals', value: rejectedHospitals.length.toString(), icon: XCircle, color: 'red-600' }
          ].map((stat, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#798E93] text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#2C3E44] mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`w-12 h-12 text-${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Card className="mb-6">
          <div className="flex space-x-4 border-b border-[#798E93]/30">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-semibold transition ${activeTab === 'pending'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-[#556B73] hover:text-[#2C3E44]'
                }`}
            >
              Pending Approval ({pendingHospitals.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-6 py-3 font-semibold transition ${activeTab === 'approved'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-[#556B73] hover:text-[#2C3E44]'
                }`}
            >
              Approved ({approvedHospitals.length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-6 py-3 font-semibold transition ${activeTab === 'rejected'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-[#556B73] hover:text-[#2C3E44]'
                }`}
            >
              Rejected ({rejectedHospitals.length})
            </button>
          </div>
        </Card>

        {/* Hospital List */}
        <Card>
          <h2 className="text-2xl font-bold text-[#2C3E44] mb-6">
            {activeTab === 'pending' && 'Pending Hospital Approvals'}
            {activeTab === 'approved' && 'Approved Hospitals'}
            {activeTab === 'rejected' && 'Rejected Hospitals'}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/40 border-b border-[#798E93]/30">
                <tr>
                  {['Name', 'Email', 'Phone', 'Address', 'Registered At', 'Approved At', 'Status', 'Actions'].map(header => (
                    <th key={header} className="px-6 py-4 text-left text-[#2C3E44] font-semibold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeTab === 'pending' && pendingHospitals.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-[#556B73]">
                      No pending hospital approvals
                    </td>
                  </tr>
                )}
                {activeTab === 'pending' && pendingHospitals.map(hospital => (
                  <tr key={hospital.id} className="border-b border-[#798E93]/20 hover:bg-white/40 transition">
                    <td className="px-6 py-4 text-[#2C3E44] font-medium">{hospital.name}</td>
                    <td className="px-6 py-4 text-[#556B73]">{hospital.email}</td>
                    <td className="px-6 py-4 text-[#556B73]">{hospital.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-[#556B73]">{hospital.address || 'N/A'}</td>
                    <td className="px-6 py-4 text-[#556B73]">{formatDate(hospital.registeredAt)}</td>
                    <td className="px-6 py-4 text-[#556B73]">-</td>
                    <td className="px-6 py-4">
                      <span className="bg-yellow-500/20 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                        PENDING
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(hospital.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition shadow flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(hospital.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition shadow flex items-center space-x-2"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeTab === 'approved' && approvedHospitals.map(hospital => (
                  <tr key={hospital.id} className="border-b border-[#798E93]/20 hover:bg-white/40 transition">
                    <td className="px-6 py-4 text-[#2C3E44] font-medium">{hospital.name}</td>
                    <td className="px-6 py-4 text-[#556B73]">{hospital.email}</td>
                    <td className="px-6 py-4 text-[#556B73]">{hospital.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-[#556B73]">{hospital.address || 'N/A'}</td>
                    <td className="px-6 py-4 text-[#556B73]">{formatDate(hospital.registeredAt)}</td>
                    <td className="px-6 py-4 text-[#556B73]">{formatDate(hospital.approvedAt)}</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-600/20 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        APPROVED
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#556B73] text-sm">-</span>
                    </td>
                  </tr>
                ))}
                {activeTab === 'rejected' && rejectedHospitals.map(hospital => (
                  <tr key={hospital.id} className="border-b border-[#798E93]/20 hover:bg-white/40 transition">
                    <td className="px-6 py-4 text-[#2C3E44] font-medium">{hospital.name}</td>
                    <td className="px-6 py-4 text-[#556B73]">{hospital.email}</td>
                    <td className="px-6 py-4 text-[#556B73]">{hospital.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-[#556B73]">{hospital.address || 'N/A'}</td>
                    <td className="px-6 py-4 text-[#556B73]">{formatDate(hospital.registeredAt)}</td>
                    <td className="px-6 py-4 text-[#556B73]">-</td>
                    <td className="px-6 py-4">
                      <span className="bg-red-600/20 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                        REJECTED
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#556B73] text-sm">-</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
