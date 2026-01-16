import React, { useState, useEffect } from 'react';
import {
  Users, Heart, Building2, Activity, Shield, AlertTriangle,
  FileText, TrendingUp, Search, Filter, CheckCircle, XCircle,
  Clock, Lock, LogOut, Menu, X, ChevronRight, Eye
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import Button from '../components/Button';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // Data States
  const [stats, setStats] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [donorsAnalytics, setDonorAnalytics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [performance, setPerformance] = useState([]);

  // Fetch Data
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await api.getDashboardStats();
        if (res.success) setStats(res.data);
      } else if (activeTab === 'hospitals') {
        const res = await api.getHospitals({ limit: 50 }); // Fetch more for administration
        if (res.success) setHospitals(res.data.hospitals);
      } else if (activeTab === 'donors') {
        const res = await api.getDonorAnalytics();
        if (res.success) setDonorAnalytics(res.data);
      } else if (activeTab === 'requests') {
        const res = await api.getRequests();
        if (res.success) setRequests(res.data.requests);
      } else if (activeTab === 'audit') {
        const res = await api.getAuditLogs();
        if (res.success) setAuditLogs(res.data);
      } else if (activeTab === 'performance') {
        const res = await api.getHospitalPerformance();
        if (res.success) setPerformance(res.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  // Actions
  const handleHospitalAction = async (id, action, reason = '') => {
    try {
      if (action === 'approve') await api.approveHospital(id);
      else if (action === 'reject') await api.rejectHospital(id, reason);
      else if (action === 'suspend') await api.updateHospitalStatus(id, 'suspended', reason);
      fetchData(); // Refresh
    } catch (error) {
      console.error(`Error ${action} hospital:`, error);
    }
  };

  // Sub-Components
  const MetricCard = ({ label, value, icon: Icon, color, subtext }) => (
    <div className="bg-white/40 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 font-medium text-sm">{label}</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-600 group-hover:bg-${color}-200 transition-colors`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const styles = {
      approved: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      suspended: "bg-red-100 text-red-700 border-red-200",
      rejected: "bg-gray-100 text-gray-700 border-gray-200",
      active: "bg-green-100 text-green-700 border-green-200"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status?.toLowerCase()] || "bg-gray-100 text-gray-700"}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  // Render Views
  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Hospitals" value={stats?.overview?.totalHospitals || 0} icon={Building2} color="blue" subtext={`${stats?.overview?.pendingHospitals || 0} Pending`} />
        <MetricCard label="Total Donors" value={stats?.overview?.totalDonors || 0} icon={Heart} color="red" />
        <MetricCard label="Active Requests" value={stats?.overview?.totalRequests || 0} icon={Activity} color="purple" subtext={`${stats?.overview?.pendingRequests || 0} Pending`} />
        <MetricCard label="Transplants" value={stats?.overview?.successfulTransplants || 0} icon={CheckCircle} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/40 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Transplant Activity (Monthly)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.charts?.monthlyTransplants || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white/40 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Waitlist by Organ</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.charts?.organDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHospitals = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white/20">
        <h2 className="text-xl font-bold text-gray-800">Hospital Management</h2>
        <div className="flex gap-2">
          <input type="text" placeholder="Search..." className="bg-white/60 border border-white/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} /> Filter
          </Button>
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hospital</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50">
              {hospitals.map((hospital) => (
                <tr key={hospital._id} className="hover:bg-white/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded-full object-cover" src={hospital.image} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                        <div className="text-sm text-gray-500">{hospital.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {hospital.location?.city}, {hospital.location?.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={hospital.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                    {hospital.status === 'pending' && (
                      <>
                        <button onClick={() => handleHospitalAction(hospital._id, 'approve')} className="text-green-600 hover:text-green-900 bg-green-100 p-2 rounded-lg transition"><CheckCircle size={18} /></button>
                        <button onClick={() => handleHospitalAction(hospital._id, 'reject')} className="text-red-600 hover:text-red-900 bg-red-100 p-2 rounded-lg transition"><XCircle size={18} /></button>
                      </>
                    )}
                    {hospital.status === 'approved' && (
                      <button onClick={() => handleHospitalAction(hospital._id, 'suspend')} className="text-amber-600 hover:text-amber-900 bg-amber-100 p-2 rounded-lg transition" title="Suspend"><Lock size={18} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDonors = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Donor Analytics (Read-Only)</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/40 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Blood Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donorsAnalytics?.byBloodType} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {(donorsAnalytics?.byBloodType || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white/40 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Top Hospitals by Donor Registrations</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={donorsAnalytics?.byHospital || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" />
                <YAxis dataKey="_id" type="category" width={150} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4ECDC4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Organ Request Monitoring</h2>
      <div className="space-y-4">
        {requests.map(req => (
          <div key={req._id} className={`bg-white/40 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-sm flex items-center justify-between ${req.patient?.urgencyLevel === 'urgent' ? 'border-l-4 border-l-red-500' : ''}`}>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-800">{req.organType} Request</h4>
                {req.patient?.urgencyLevel === 'urgent' && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1"><AlertTriangle size={12} /> URGENT</span>}
              </div>
              <p className="text-sm text-gray-600 mt-1">{req.hospital?.name} • Blood Group: {req.bloodType}</p>
              <p className="text-xs text-gray-400 mt-1">SLA Timer: {new Date(req.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <StatusBadge status={req.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAudit = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">System Audit Logs</h2>
      <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 h-[600px] overflow-y-auto">
        <div className="space-y-6 border-l-2 border-gray-300 ml-4 pl-8 relative">
          {auditLogs.map((log, i) => (
            <div key={i} className="relative mb-6">
              <span className="absolute -left-11 bg-white border-4 border-gray-200 rounded-full w-6 h-6 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </span>
              <p className="text-xs text-gray-400 mb-1">{new Date(log.createdAt).toLocaleString()}</p>
              <h4 className="font-bold text-gray-800">{log.actionType} {log.entityType}</h4>
              <p className="text-sm text-gray-600">{log.details}</p>
              <p className="text-xs text-gray-500 mt-1">By: {log.performedBy?.name || 'System'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Hospital Performance Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {performance.map(item => (
          <div key={item._id} className="bg-white/40 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Requests</p>
                  <p className="font-bold">{item.totalRequests}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="font-bold">{item.completedRequests}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{Math.round(item.successRate)}%</div>
              <p className="text-xs text-blue-500">Success Rate</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D4E8E8] via-[#A2BFC6] to-[#798E93] flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AnimatedBackground />
      </div>

      <Navbar user={user} onLogout={logout} />

      <div className="flex flex-1 relative z-10 pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full gap-8">

        {/* Sidebar Navigation */}
        <div className={`w-64 bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl h-fit p-4 flex-shrink-0 transition-all ${!sidebarOpen ? 'w-20' : ''}`}>
          <div className="flex flex-col space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'hospitals', label: 'Hospitals', icon: Building2 },
              { id: 'donors', label: 'Donors', icon: Heart },
              { id: 'requests', label: 'Requests', icon: Activity },
              { id: 'performance', label: 'Performance', icon: Shield },
              { id: 'audit', label: 'Audit Log', icon: FileText },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#2C3E44] text-white shadow-lg' : 'text-gray-700 hover:bg-white/40'}`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 pb-10">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'hospitals' && renderHospitals()}
              {activeTab === 'donors' && renderDonors()}
              {activeTab === 'requests' && renderRequests()}
              {activeTab === 'audit' && renderAudit()}
              {activeTab === 'performance' && renderPerformance()}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
