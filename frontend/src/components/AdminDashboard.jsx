import React, { useState, useEffect } from 'react'
import {
  Home, Building2, Heart, AlertCircle, Repeat2, BarChart3, Settings, LogOut,
  Search, Bell, User, ChevronDown, Edit2, Check, X, Eye,
  Map, Stethoscope, Siren, Grid, Filter, FileText, TrendingUp, Clock, Info,
  BellRing, ShieldCheck, CheckCircle2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { OrgDemandBar, HospitalPie, MonthlyLine } from './Charts'
import AdminHospitalCard from './AdminHospitalCard'
import apiService from '../services/api'
import './AdminDashboard.css'

const StatCard = ({ icon: Icon, label, value, bgColor, subValue }) => (
  <div className="stat-card transition-all hover:scale-[1.02] hover:shadow-lg">
    <div className="stat-icon" style={{ backgroundColor: bgColor }}>
      <Icon size={24} color="white" />
    </div>
    <div className="stat-content">
      <p className="stat-label">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="stat-value">{value}</p>
        {subValue && <p className="text-xs text-[#6b7280] font-medium opacity-80">{subValue}</p>}
      </div>
    </div>
  </div>
)

const DashboardSection = ({ dashboardStats, hospitalData, setCurrentPage, loading, error }) => {
  const overview = dashboardStats.overview || {}
  const hStats = overview.hospitals || {}
  const dStats = overview.donors || {}
  const rStats = overview.requests || {}
  const tStats = overview.transplants || {}
  const insights = dashboardStats.insights || {}
  const charts = dashboardStats.charts || {}

  return (
    <div className="dashboard-content dashboard-command-center">
      {error && <div className="error-message">{error}</div>}
      {loading && !dashboardStats.overview && <div className="loading-skeleton-grid">Loading...</div>}

      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title mb-0">System Command Center</h2>
        <div className="text-xs text-[#6b7280] bg-white/50 px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Real-time monitoring active
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={Building2}
          label="Total Hospitals"
          value={hStats.total || '0'}
          bgColor="#3b82f6"
          subValue={`${hStats.approved || 0} Approved / ${hStats.pending || 0} Pending`}
        />
        <StatCard
          icon={Heart}
          label="Total Donors"
          value={dStats.total || '0'}
          bgColor="#10b981"
          subValue="Registered Donors"
        />
        <StatCard
          icon={AlertCircle}
          label="Organ Requests"
          value={rStats.total || '0'}
          bgColor="#f59e0b"
          subValue={`${rStats.today || 0} Today / ${rStats.month || 0} This Month`}
        />
        <StatCard
          icon={Repeat2}
          label="Successful Transplants"
          value={tStats.successful || '0'}
          bgColor="#8b5cf6"
          subValue={`Out of ${tStats.total || 0} total`}
        />
      </div>

      <div className="insights-grid">
        <div className="insight-panel charts-panel">
          <div className="chart-header flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#1f2937]">System Trends</h3>
            <div className="flex gap-2 text-xs text-[#6b7280]">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div> Transplants</span>
            </div>
          </div>
          <MonthlyLine data={charts.monthlyTransplants || []} />
        </div>

        <div className="insight-panel recent-panel">
          <h3 className="text-lg font-bold text-[#1f2937] mb-4">Urgent Insights</h3>
          <div className="sla-alert p-4 bg-red-50 border border-red-100 rounded-xl mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertCircle size={20} /></div>
              <div>
                <p className="text-sm font-bold text-red-900">{insights.slaBreaches || 0} SLA Breaches</p>
                <p className="text-xs text-red-700">Requests pending beyond threshold</p>
              </div>
            </div>
          </div>

          <div className="recent-list">
            <h4 className="text-sm font-bold text-[#4b5563] mb-3">Recently Approved Hospitals</h4>
            {insights.recentApprovedHospitals?.map(h => (
              <div key={h._id} className="recent-item flex justify-between items-center p-2 hover:bg-black/5 rounded-lg transition-all border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-[#1f2937]">{h.name}</p>
                  <p className="text-xs text-[#6b7280]">{h.location?.city}</p>
                </div>
                <p className="text-[10px] text-[#9ca3af]">{new Date(h.approvedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-title mb-0">Key Hospitals Performance</h2>
          <button className="text-sm text-[#3b82f6] font-medium hover:underline" onClick={() => setCurrentPage('hospitals')}>View All</button>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Hospital Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Snapshot</th>
              </tr>
            </thead>
            <tbody>
              {hospitalData.slice(0, 5).map(hospital => (
                <tr key={hospital._id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => setCurrentPage('hospitals')}>
                  <td className="hospital-name">{hospital.name}</td>
                  <td>{hospital.location?.city}, {hospital.location?.state}</td>
                  <td>
                    <span className={`status-badge status-${hospital.status}`}>
                      {hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(hospital.updatedAt).toLocaleTimeString()}</td>
                  <td>
                    <HospitalPie data={[{ name: 'Matched', value: (hospital.successRate || 70) }, { name: 'Open', value: 100 - (hospital.successRate || 70) }]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const HospitalsSection = ({
  hospitalData, hospitalStats, activeTab, setActiveTab, filters, handleFilterChange, clearFilters, loading, error
}) => (
  <div className="dashboard-content">
    {error && <div className="error-message">{error}</div>}
    {loading && <div className="loading-message">Loading Hospitals...</div>}

    <h2 className="section-title">Hospitals Dashboard</h2>

    <div className="dashboard-tabs">
      <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
        <Grid size={16} /> All <span className="tab-count">{hospitalStats.total}</span>
      </button>
      <button className={`tab-btn ${activeTab === 'region' ? 'active' : ''}`} onClick={() => { setActiveTab('region'); handleFilterChange('state', '') }}>
        <Map size={16} /> Region <span className="tab-count">{hospitalStats.regionStats?.length || 0}</span>
      </button>
      <button className={`tab-btn ${activeTab === 'specialization' ? 'active' : ''}`} onClick={() => { setActiveTab('specialization'); handleFilterChange('specialization', '') }}>
        <Stethoscope size={16} /> Specializations <span className="tab-count">{hospitalStats.specializationStats?.length || 0}</span>
      </button>
      <button className={`tab-btn ${activeTab === 'emergency' ? 'active' : ''}`} onClick={() => setActiveTab('emergency')}>
        <Siren size={16} /> Emergency <span className="tab-count">{hospitalStats.emergencyCount}</span>
      </button>
    </div>

    {(activeTab === 'all' || activeTab === 'emergency' || (activeTab === 'region' && filters.state) || (activeTab === 'specialization' && filters.specialization)) && (
      <div className="filters-bar">
        <div className="search-box">
          <Search size={16} />
          <input type="text" placeholder="Search..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
        </div>
        <select className="filter-select" value={filters.state} onChange={(e) => handleFilterChange('state', e.target.value)}>
          <option value="">All Regions</option>
          {hospitalStats.regionStats?.map(r => <option key={r._id} value={r._id}>{r._id}</option>)}
        </select>
        <select className="filter-select" value={filters.specialization} onChange={(e) => handleFilterChange('specialization', e.target.value)}>
          <option value="">All Specializations</option>
          {hospitalStats.specializationStats?.map(s => <option key={s._id} value={s._id}>{s._id}</option>)}
        </select>
        <button className="clear-filters" onClick={clearFilters}>Clear Filters</button>
      </div>
    )}

    {activeTab === 'region' && !filters.state && (
      <div className="region-grid">
        {hospitalStats.regionStats?.map(region => (
          <div key={region._id} className="region-card" onClick={() => handleFilterChange('state', region._id)}>
            <div className="region-header">
              <span className="region-name">{region._id}</span>
              <span className="region-total">{region.totalHospitals}</span>
            </div>
            <div className="region-stats">
              <div className="region-stat-item"><span>Approved</span><span className="region-stat-value">{region.approvedHospitals}</span></div>
              <div className="region-stat-item"><span>Pending</span><span className="region-stat-value">{region.totalHospitals - region.approvedHospitals}</span></div>
            </div>
          </div>
        ))}
      </div>
    )}

    {activeTab === 'specialization' && !filters.specialization && (
      <div className="spec-grid">
        {hospitalStats.specializationStats?.map(spec => (
          <div key={spec._id} className="spec-card" onClick={() => handleFilterChange('specialization', spec._id)}>
            <div className="spec-icon"><Heart size={24} /></div>
            <span className="spec-name">{spec._id}</span>
            <span className="spec-count">{spec.count} Hospitals</span>
          </div>
        ))}
      </div>
    )}

    {(activeTab === 'all' || activeTab === 'emergency' || (activeTab === 'region' && filters.state) || (activeTab === 'specialization' && filters.specialization)) && (
      <div className="hospitals-list-container">
        {hospitalData.map(hospital => (
          <AdminHospitalCard key={hospital._id} hospital={hospital} />
        ))}
        {hospitalData.length === 0 && <div className="no-data-message">No hospitals matching filters.</div>}
      </div>
    )}
  </div>
)

const HospitalRequestsSection = ({ hospitalData, handleApprove, handleReject, dashboardStats, loading, error }) => (
  <div className="dashboard-content">
    {error && <div className="error-message">{error}</div>}
    {loading && <div className="loading-message">Loading Requests...</div>}

    <div className="flex justify-between items-center mb-6">
      <h2 className="section-title mb-0">Hospital Registration Requests</h2>
      <div className="bg-white/50 px-4 py-2 rounded-lg text-[#556B73] font-medium border border-[#798E93]/20">
        Total Pending: <span className="text-red-600 font-bold">{dashboardStats.pendingHospitals || 0}</span>
      </div>
    </div>

    <div className="hospitals-list-container">
      {hospitalData.map(hospital => (
        <AdminHospitalCard
          key={hospital._id}
          hospital={hospital}
          basePath="/admin/hospital-requests"
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}
      {hospitalData.length === 0 && (
        <div className="no-data-message text-center py-12 bg-white/30 rounded-xl">
          <FileText className="w-12 h-12 text-[#798E93] mx-auto mb-4 opacity-50" />
          <p className="text-lg text-[#556B73]">No pending hospital requests.</p>
        </div>
      )}
    </div>
  </div>
)

const DonorsSection = ({ apiService }) => {
  const [donorAnalytics, setDonorAnalytics] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoadingAnalytics(true)
        const response = await apiService.getDonorAnalytics()
        setDonorAnalytics(response.data)
      } catch (err) {
        console.error("Failed to load donor analytics", err)
      } finally {
        setLoadingAnalytics(false)
      }
    }
    fetchAnalytics()
  }, [apiService])

  if (loadingAnalytics) return <div className="loading-message">Loading Donor Analytics...</div>

  return (
    <div className="dashboard-content donor-analytics-page">
      <h2 className="section-title">Donor Ecosystem Analytics</h2>

      <div className="donor-summary-grid grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="analytics-card p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-blue-200">
          <p className="text-sm font-bold text-[#64748b] mb-1">Total Network Donors</p>
          <p className="text-3xl font-black text-[#1e293b]">{donorAnalytics?.totalDonors || 0}</p>
          <div className="mt-2 flex items-center gap-1 text-[#10b981] text-xs font-bold">
            <TrendingUp size={14} /> +12% growth
          </div>
        </div>
        <div className="analytics-card p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-[#64748b] mb-1">Critical Blood Types</p>
          <p className="text-3xl font-black text-red-600">{donorAnalytics?.byBloodType?.length || 0}</p>
          <p className="text-[10px] text-[#94a3b8] mt-2">Diversity metric active</p>
        </div>
        <div className="analytics-card p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-[#64748b] mb-1">Active Regions</p>
          <p className="text-3xl font-black text-[#3b82f6]">{donorAnalytics?.byLocation?.length || 0}</p>
          <p className="text-[10px] text-[#94a3b8] mt-2">Verified jurisdictional data</p>
        </div>
        <div className="analytics-card p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-[#64748b] mb-1">Hospital Partners</p>
          <p className="text-3xl font-black text-[#8b5cf6]">{donorAnalytics?.byHospital?.length || 0}</p>
          <p className="text-[10px] text-[#94a3b8] mt-2">Linked medical centers</p>
        </div>
      </div>

      <div className="analytics-charts-grid grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="analytics-panel p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-md font-bold text-[#1e293b] mb-6 flex items-center gap-2">
            <Heart size={18} className="text-red-500" /> Donors by Blood Group
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={donorAnalytics?.byBloodType?.map(b => ({ name: b._id, value: b.count }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="value" fill="#31c48d" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-panel p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-md font-bold text-[#1e293b] mb-6 flex items-center gap-2">
            <Map size={18} className="text-blue-500" /> Regional Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={donorAnalytics?.byLocation?.map(l => ({ name: l._id || 'Unknown', value: l.count }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={80} tick={{ fill: '#64748b' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analytics-charts-grid grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="analytics-panel p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-md font-bold text-[#1e293b] mb-6 flex items-center gap-2">
            <Grid size={18} className="text-purple-500" /> Donors by Organ Type
          </h3>
          <div className="flex flex-wrap gap-4">
            {donorAnalytics?.byOrganType?.map((o, idx) => (
              <div key={idx} className="organ-pill flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 flex-1 min-w-[140px]">
                <div className={`w-2 h-8 rounded-full ${['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-amber-400'][idx % 4]}`}></div>
                <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{o._id}</p><p className="text-lg font-bold text-gray-800">{o.count}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="insights-panel p-6 bg-gray-900 rounded-2xl text-white">
          <h3 className="text-md font-bold mb-6 flex items-center gap-2"><Info size={18} className="text-amber-400" /> Systemic Insights</h3>
          <div className="space-y-4">
            <div className="insight-item flex gap-4"><div className="h-2 w-2 rounded-full bg-amber-400 mt-1.5 shrink-0"></div><p className="text-sm text-gray-300">Waitlist optimization possible in <span className="text-white font-bold">{donorAnalytics?.byLocation?.[0]?._id}</span>.</p></div>
            <div className="insight-item flex gap-4"><div className="h-2 w-2 rounded-full bg-amber-400 mt-1.5 shrink-0"></div><p className="text-sm text-gray-300">Supply of <span className="text-white font-bold">O- Blood Type</span> is currently below safety threshold.</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}

const OrganRequestsSection = ({ requestData, setCurrentPage }) => {
  const urgencyScore = (urgency) => {
    const map = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-blue-500' }
    return map[urgency?.toLowerCase()] || 'bg-gray-400'
  }

  return (
    <div className="dashboard-content organ-requests-hub">
      <div className="flex justify-between items-center mb-8">
        <div><h2 className="section-title mb-1">Organ Requests Hub</h2><p className="text-sm text-[#64748b]">Active demand across network</p></div>
        <div className="flex items-center gap-4">
          <div className="request-stat flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-xs font-bold text-[#1e293b]">{requestData.filter(r => r.urgency?.toLowerCase() === 'critical').length} Critical</span></div>
          <button className="flex items-center gap-2 bg-[#1e293b] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition-all"><Filter size={16} /> Filter</button>
        </div>
      </div>

      <div className="requests-grid grid grid-cols-1 xl:grid-cols-2 gap-6">
        {requestData.map(request => (
          <div key={request._id} className="request-card p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg ${urgencyScore(request.urgency)}`}>{request.organType?.charAt(0)}</div>
                <div><h3 className="font-black text-[#1e293b] text-lg uppercase">{request.organType}</h3><p className="text-xs font-bold text-[#64748b]">#REQ-{request._id.slice(-6).toUpperCase()}</p></div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${request.priority === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{request.priority || 'standard'} PRIORITY</span>
                <p className="mt-1 text-[10px] text-[#94a3b8] font-bold flex items-center justify-end gap-1"><Clock size={10} /> {new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="request-details-grid grid grid-cols-3 gap-4 mb-6">
              <div className="detail-item bg-[#f8fafc] p-3 rounded-xl border border-[#f1f5f9]">
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase mb-1">Blood Type</p>
                <p className="text-sm font-black text-[#1e293b]">{request.bloodType || 'N/A'}</p>
              </div>
              <div className="detail-item bg-[#f8fafc] p-3 rounded-xl border border-[#f1f5f9] col-span-2">
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase mb-1">Requested By</p>
                <p className="text-sm font-black text-[#1e293b] truncate">{request.hospital?.name || 'Unknown'}</p>
              </div>
            </div>
            <div className="hospital-locator mb-6 flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Map size={16} /></div>
              <div><p className="text-[10px] font-bold text-blue-800 uppercase">Location</p><p className="text-xs font-bold text-blue-600">{request.hospital?.location?.city || 'City N/A'}</p></div>
            </div>
            <div className="action-row flex items-center gap-3">
              <button className="flex-1 bg-[#1e293b] text-white py-3 rounded-xl text-xs font-black uppercase hover:bg-black transition-all" onClick={() => setCurrentPage('hospitals')}>Profile</button>
              <button className="w-12 h-12 flex items-center justify-center bg-gray-100 text-[#64748b] rounded-xl hover:bg-gray-200 transition-all"><Info size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const TransplantsSection = ({ transplantData }) => (
  <div className="dashboard-content">
    <h2 className="section-title">Transplant Records</h2>
    <div className="table-wrapper">
      <table className="admin-table">
        <thead>
          <tr><th>ID</th><th>Organ</th><th>From</th><th>To</th><th>Date</th><th>Status</th></tr>
        </thead>
        <tbody>
          {transplantData.length > 0 ? transplantData.map(t => (
            <tr key={t._id}>
              <td>#{t.transplantId}</td>
              <td className="font-bold">{t.organType}</td>
              <td>{t.donor?.registeredHospital?.name || 'N/A'}</td>
              <td>{t.recipient?.hospital?.name || 'N/A'}</td>
              <td>{new Date(t.createdAt).toLocaleDateString()}</td>
              <td><span className="status-badge status-approved">{t.status}</span></td>
            </tr>
          )) : (
            <tr><td colSpan="6" className="text-center py-8">No transplant records found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)

const ReportsSection = ({ apiService, dashboardStats }) => {
  const [reportData, setReportData] = useState(null)
  const [loadingReports, setLoadingReports] = useState(false)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoadingReports(true)
        const response = await apiService.getSystemReports()
        setReportData(response.data)
      } catch (err) {
        console.error("Failed to load reports", err)
      } finally {
        setLoadingReports(false)
      }
    }
    fetchReports()
  }, [apiService])

  if (loadingReports) return <div className="loading-message">Synthesizing Reports...</div>

  return (
    <div className="dashboard-content system-reports-page space-y-12 pb-20">
      <div className="reports-hero bg-gradient-to-r from-[#1e293b] to-[#334155] p-10 rounded-3xl text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-2">Annual Performance</h2>
          <div className="flex gap-8 mt-8">
            <div className="report-stat"><p className="text-[10px] uppercase font-bold text-blue-300">Centers</p><p className="text-2xl font-black">{dashboardStats.overview?.hospitals?.total || 0}</p></div>
            <div className="report-stat border-l border-white/10 pl-8"><p className="text-[10px] uppercase font-bold text-blue-300">Success Rate</p><p className="text-2xl font-black">94.2%</p></div>
          </div>
        </div>
        <BarChart3 className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/5 rotate-12" />
      </div>

      <section className="report-section">
        <div className="section-header flex items-center gap-3 mb-6"><div className="w-1.5 h-8 bg-blue-600 rounded-full"></div><h3 className="text-2xl font-black">The Match Gap</h3></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"><OrgDemandBar data={reportData?.organComparison?.demand || []} /></div>
          <div className="space-y-4">
            {reportData?.organComparison?.demand?.slice(0, 4).map((d, i) => {
              const avail = reportData?.organComparison?.availability?.find(a => a._id === d._id)?.count || 0
              const gap = d.count - avail
              return (
                <div key={i} className="gap-card p-5 bg-white rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center mb-2"><span className="font-bold">{d._id}</span><span className={`text-[10px] font-black px-2 py-0.5 rounded ${gap > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{gap > 0 ? 'Shortage' : 'Surplus'}</span></div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-600 h-full" style={{ width: `${(avail / (d.count || 1)) * 100}%` }}></div></div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="report-section">
        <div className="section-header flex items-center gap-3 mb-6"><div className="w-1.5 h-8 bg-green-600 rounded-full"></div><h3 className="text-2xl font-black text-[#1e293b]">Partner Excellence</h3></div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="px-8 py-4 text-xs font-black uppercase">Rank</th><th className="px-8 py-4 text-xs font-black uppercase">Hospital</th><th className="px-8 py-4 text-xs font-black uppercase">Transplants</th><th className="px-8 py-4 text-xs font-black uppercase">Success Rate</th></tr></thead>
            <tbody>
              {reportData?.hospitalPerformance?.map((h, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-8 py-5 font-black text-[#64748b]">#{i + 1}</td>
                  <td className="px-8 py-5 font-bold">{h.name}</td>
                  <td className="px-8 py-5 font-black text-[#3b82f6]">{h.totalTransplants}</td>
                  <td className="px-8 py-5"><div className="flex items-center gap-3"><span className="font-bold">{((h.successfulTransplants / h.totalTransplants) * 100 || 0).toFixed(1)}%</span><div className="w-16 h-1 bg-gray-100 rounded-full"><div className="bg-green-500 h-full" style={{ width: `${(h.successfulTransplants / h.totalTransplants) * 100}%` }}></div></div></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

const SettingsSection = () => {
  const [settingsTab, setSettingsTab] = useState('profile')
  return (
    <div className="dashboard-content settings-portal">
      <h2 className="section-title mb-8">System Configuration</h2>
      <div className="settings-container bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex min-h-[500px]">
        <aside className="w-64 bg-gray-50 border-r border-gray-100 p-6">
          <nav className="space-y-2">
            {[{ id: 'profile', label: 'Profile', icon: User }, { id: 'security', label: 'Security', icon: AlertCircle }, { id: 'notifications', label: 'Alerts', icon: Bell }, { id: 'rules', label: 'Rules', icon: FileText }].map(tab => (
              <button key={tab.id} onClick={() => setSettingsTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${settingsTab === tab.id ? 'bg-[#1e293b] text-white' : 'text-[#64748b] hover:bg-gray-200'}`}><tab.icon size={18} /> {tab.label}</button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-10">
          {settingsTab === 'profile' && <div className="settings-view"><h3 className="text-xl font-black mb-6">Admin Profile</h3><div className="space-y-6 max-w-md"><div className="field-group"><label className="text-[10px] uppercase font-black text-[#94a3b8] block">Global Administrator</label><input type="text" readOnly value="System Administrator" className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold" /></div></div></div>}
          {settingsTab === 'security' && <div className="settings-view"><h3 className="text-xl font-black mb-6">Security Credentials</h3><div className="space-y-6 max-w-md"><div className="field-group"><label className="text-[10px] uppercase font-black text-[#94a3b8] block">Current Password</label><input type="password" placeholder="••••••••" className="w-full bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold" /></div><button className="bg-[#1e293b] text-white px-8 py-3 rounded-xl font-black text-xs uppercase hover:bg-black">Update</button></div></div>}
          {settingsTab === 'notifications' && <div className="settings-view"><h3 className="text-xl font-black mb-6">Notifications</h3><div className="space-y-4">{[{ label: 'Hospital Requests', desc: 'Alert for new hospitals' }, { label: 'Critical Matches', desc: 'Real-time alerts' }].map((item, i) => (<div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100"><div><p className="font-bold text-sm">{item.label}</p><p className="text-xs text-[#94a3b8]">{item.desc}</p></div><div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div></div>))}</div></div>}
          {settingsTab === 'rules' && <div className="settings-view"><h3 className="text-xl font-black mb-6">System Rules</h3><div className="prose prose-sm"><p className="text-xs">Standard Operating Procedures are enforced system-wide.</p></div></div>}
        </main>
      </div>
    </div>
  )
}

const AdminDashboard = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [dashboardStats, setDashboardStats] = useState({})
  const [hospitalData, setHospitalData] = useState([])
  const [donorData, setDonorData] = useState([])
  const [requestData, setRequestData] = useState([])
  const [transplantData, setTransplantData] = useState([])
  const [showHospitalMenu, setShowHospitalMenu] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Hospital Dashboard State
  const [hospitalStats, setHospitalStats] = useState({
    total: 0,
    statusCounts: {},
    regionStats: [],
    specializationStats: [],
    emergencyCount: 0
  })
  const [activeTab, setActiveTab] = useState('all') // all, region, specialization, emergency
  const [filters, setFilters] = useState({
    search: '',
    state: '',
    specialization: '',
    status: ''
  })

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Load data based on current page
  useEffect(() => {
    switch (currentPage) {
      case 'hospitals':
        loadHospitals()
        loadHospitalStats()
        break
      case 'donors':
        loadDonors()
        break
      case 'requests':
        loadRequests()
        break
      case 'transplants':
        loadTransplants()
        break
      case 'hospitalRequests':
        loadHospitals()
        break
    }
  }, [currentPage])

  useEffect(() => {
    if (currentPage === 'hospitals') {
      const isGridView = (activeTab === 'region' && !filters.state) || (activeTab === 'specialization' && !filters.specialization)
      if (!isGridView) {
        loadHospitals()
      }
    }
  }, [filters, activeTab, currentPage])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const stats = await apiService.getDashboardStats()
      setDashboardStats(stats.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadHospitals = async () => {
    try {
      setLoading(true)
      const queryFilters = {
        ...filters,
        emergency: activeTab === 'emergency'
      }

      // STRICT FILTERING BASED ON PAGE
      if (currentPage === 'hospitals') {
        queryFilters.status = 'approved';
      } else if (currentPage === 'hospitalRequests') {
        queryFilters.status = 'pending';
      }

      const response = await apiService.getHospitals(queryFilters)
      setHospitalData(response.data.hospitals)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadHospitalStats = async () => {
    try {
      const response = await apiService.getHospitalStats()
      setHospitalStats(response.data)
    } catch (err) {
      console.error("Failed to load hospital stats", err)
    }
  }

  const loadDonors = async () => {
    try {
      setLoading(true)
      const response = await apiService.getDonors()
      setDonorData(response.data.donors)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadRequests = async () => {
    try {
      setLoading(true)
      const response = await apiService.getRequests()
      setRequestData(response.data.requests)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadTransplants = async () => {
    try {
      setLoading(true)
      const response = await apiService.getTransplants()
      setTransplantData(response.data.transplants)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await apiService.approveHospital(id)
      setHospitalData(hospitalData.map(h =>
        h._id === id ? { ...h, status: 'approved', updatedAt: new Date().toISOString() } : h
      ))
      loadHospitalStats()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to REJECT and DELETE this hospital? This action cannot be undone.')) return;
    try {
      await apiService.rejectHospital(id)
      setHospitalData(hospitalData.filter(h => h._id !== id))
      loadHospitalStats()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ search: '', state: '', specialization: '', status: '' })
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>ORGAN DONATION SYSTEM</h1>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
            <Home size={18} /> Dashboard
          </button>
          <button className={`nav-item ${currentPage === 'hospitals' ? 'active' : ''}`} onClick={() => setCurrentPage('hospitals')}>
            <Building2 size={18} /> Hospitals
          </button>
          <button className={`nav-item ${currentPage === 'hospitalRequests' ? 'active' : ''}`} onClick={() => setCurrentPage('hospitalRequests')}>
            <FileText size={18} /> Hospital Requests
            {dashboardStats.pendingHospitals > 0 && (
              <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {dashboardStats.pendingHospitals}
              </span>
            )}
          </button>
          <button className={`nav-item ${currentPage === 'donors' ? 'active' : ''}`} onClick={() => setCurrentPage('donors')}>
            <Heart size={18} /> Donors
          </button>
          <button className={`nav-item ${currentPage === 'requests' ? 'active' : ''}`} onClick={() => setCurrentPage('requests')}>
            <AlertCircle size={18} /> Organ Requests
          </button>
          <button className={`nav-item ${currentPage === 'transplants' ? 'active' : ''}`} onClick={() => setCurrentPage('transplants')}>
            <Repeat2 size={18} /> Transplants
          </button>
          <button className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`} onClick={() => setCurrentPage('reports')}>
            <BarChart3 size={18} /> Reports
          </button>
          <button className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`} onClick={() => setCurrentPage('settings')}>
            <Settings size={18} /> Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="top-bar-actions">
            <button className="icon-btn"><Bell size={18} /></button>
            <div className="profile-menu">
              <button className="profile-btn"><User size={18} /><span>Admin</span><ChevronDown size={16} /></button>
            </div>
            <button className="logout-btn" onClick={onLogout}><LogOut size={18} /></button>
          </div>
        </header>

        {/* Page Content */}
        {currentPage === 'dashboard' && (
          <DashboardSection
            dashboardStats={dashboardStats}
            hospitalData={hospitalData}
            setCurrentPage={setCurrentPage}
            loading={loading}
            error={error}
          />
        )}
        {currentPage === 'hospitals' && (
          <HospitalsSection
            hospitalData={hospitalData}
            hospitalStats={hospitalStats}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filters={filters}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            loading={loading}
            error={error}
          />
        )}
        {currentPage === 'donors' && <DonorsSection apiService={apiService} />}
        {currentPage === 'requests' && <OrganRequestsSection requestData={requestData} setCurrentPage={setCurrentPage} />}
        {currentPage === 'transplants' && <TransplantsSection transplantData={transplantData} />}
        {currentPage === 'reports' && <ReportsSection apiService={apiService} dashboardStats={dashboardStats} />}
        {currentPage === 'hospitalRequests' && (
          <HospitalRequestsSection
            hospitalData={hospitalData}
            handleApprove={handleApprove}
            handleReject={handleReject}
            dashboardStats={dashboardStats}
            loading={loading}
            error={error}
          />
        )}
        {currentPage === 'settings' && <SettingsSection />}
      </div>
    </div>
  )
}

export default AdminDashboard
