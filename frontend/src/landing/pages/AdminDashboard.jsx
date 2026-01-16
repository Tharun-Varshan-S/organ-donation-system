import React, { useState, useEffect } from 'react'
import {
  Home, Building2, Heart, AlertCircle, Repeat2, BarChart3, Settings, LogOut,
  Search, Bell, User, ChevronDown, Edit2, Check, X, Eye,
  Map, Stethoscope, Siren, Grid, Filter, FileText, TrendingUp, Clock, Info,
  BellRing, ShieldCheck, CheckCircle2, Lock, Shield, Activity, ArrowLeft, Users, MapPin, Calendar
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { OrgDemandBar, HospitalPie, MonthlyLine } from '../components/Charts'
import AdminHospitalCard from '../components/AdminHospitalCard'
import apiService from '../../services/api'
import './AdminDashboard.css'
import './AdminDashboardEnhancements.css'
import { useNavigate, useLocation } from 'react-router-dom'

const StatCardSkeleton = () => (
  <div className="stat-card skeleton" style={{ minHeight: '100px' }}></div>
)

const TableRowSkeleton = () => (
  <tr className="skeleton-table-row-animate">
    <td colSpan="5"><div className="skeleton" style={{ height: '24px', margin: '8px 0' }}></div></td>
  </tr>
)

const StatCard = ({ icon: Icon, label, value, bgColor, subValue }) => (
  <div className="stat-card transition-all">
    <div className="stat-icon" style={{ backgroundColor: bgColor }}>
      <Icon size={24} color="white" />
    </div>
    <div className="stat-content">
      <p className="stat-label">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="stat-value">{value}</p>
        {subValue && <p className="text-xs text-[#64748b] font-medium opacity-80">{subValue}</p>}
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

  if (loading && !dashboardStats.overview) {
    return (
      <div className="dashboard-content dashboard-command-center">
        <div className="flex justify-between items-center mb-6">
          <div className="skeleton" style={{ height: '32px', width: '250px' }}></div>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
        </div>
        <div className="insights-grid">
          <div className="insight-panel skeleton" style={{ height: '350px' }}></div>
          <div className="insight-panel skeleton" style={{ height: '350px' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-content dashboard-command-center">
      {error && <div className="error-message">{error}</div>}

      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title mb-0">System Command Center</h2>
        <div className="text-xs text-[#64748b] bg-white/50 px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Real-time monitoring active
        </div>
      </div>

      <div className="stats-grid animate-fade-in-up">
        <StatCard
          icon={Building2}
          label="Medical Centers"
          value={hStats.total || '0'}
          bgColor="#3b82f6"
          subValue={`${hStats.approved || 0} Verified / ${hStats.emergency || 0} Emergency`}
        />
        <StatCard
          icon={Heart}
          label="Donor Network"
          value={dStats.total || '0'}
          bgColor="#10b981"
          subValue={`${dStats.active || 0} Active / ${dStats.deceased || 0} Deceased`}
        />
        <StatCard
          icon={AlertCircle}
          label="Critical Demand"
          value={rStats.total || '0'}
          bgColor="#f59e0b"
          subValue={`${rStats.slaBreaches || 0} SLA Breaches / ${rStats.today || 0} New`}
        />
        <StatCard
          icon={Activity}
          label="Survival Rate"
          value={`${tStats.successRate || 0}%`}
          bgColor="#8b5cf6"
          subValue={`${tStats.successful || 0} Life-saving Transplants`}
        />
      </div>

      <div className="insights-grid">
        <div className="insight-panel charts-panel card-hover-shadow">
          <div className="chart-header flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#1f2937]">System Trends</h3>
            <div className="flex gap-2 text-xs text-[#64748b]">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div> Transplants</span>
            </div>
          </div>
          <div className="animate-chart-load">
            <MonthlyLine data={charts.monthlyTransplants || []} />
          </div>
        </div>

        <div className="insight-panel recent-panel card-hover-shadow">
          <h3 className="text-lg font-bold text-[#1f2937] mb-4">Urgent Insights</h3>
          <div className="sla-alert p-4 bg-red-50 border border-red-100 rounded-xl mb-4 transition-all hover:bg-red-100">
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
                  <p className="text-xs text-[#64748b]">{h.location?.city}</p>
                </div>
                <p className="text-[10px] text-[#94a3b8]">{new Date(h.approvedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section mt-8 card-hover-shadow relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="section-title mb-0">Partner Performance Matrix</h2>
            <div className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded uppercase border border-blue-100">Live Feed</div>
          </div>
          <button className="text-sm text-[#3b82f6] font-semibold hover:underline transition-all" onClick={() => setCurrentPage('hospitals')}>System Audit</button>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Medical Center</th>
                <th>Jurisdiction</th>
                <th>Protocol Status</th>
                <th>Last Update</th>
                <th>Match Flux</th>
              </tr>
            </thead>
            <tbody>
              {hospitalData.slice(0, 5).map(hospital => (
                <tr key={hospital._id} className="cursor-pointer group" onClick={() => setCurrentPage('hospitals')}>
                  <td className="hospital-name">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[#1e293b] font-black text-xs">{hospital.name.charAt(0)}</div>
                      <span className="font-bold">{hospital.name}</span>
                    </div>
                  </td>
                  <td className="text-gray-600 text-xs font-medium">{hospital.location?.city}, {hospital.location?.state}</td>
                  <td>
                    <span className={`status-badge status-${hospital.status}`}>
                      {hospital.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-gray-500 text-xs tabular-nums font-medium">{new Date(hospital.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <HospitalPie data={[{ name: 'Matched', value: (hospital.successRate || 70) }, { name: 'Open', value: 100 - (hospital.successRate || 70) }]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {dashboardStats.lastUpdated && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 -mx-6 -mb-6 px-6 py-4">
            <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock size={12} /> System Last Synchronized: {new Date(dashboardStats.lastUpdated).toLocaleString()}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> All Systems Operational
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const HospitalsSection = ({
  hospitalData, hospitalStats, activeTab, setActiveTab, filters, handleFilterChange, clearFilters, loading, error, onHospitalClick
}) => (
  <div className="dashboard-content">
    {error && <div className="error-message">{error}</div>}

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

    {loading ? (
      <div className="hospitals-list-container">
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: '300px', borderRadius: '16px' }}></div>)}
      </div>
    ) : (
      <>
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
              <div key={hospital._id} onClick={() => onHospitalClick && onHospitalClick(hospital._id)}>
                <AdminHospitalCard hospital={hospital} />
              </div>
            ))}
            {hospitalData.length === 0 && <div className="no-data-message">No hospitals matching filters.</div>}
          </div>
        )}
      </>
    )}
  </div>
)

const HospitalRequestsSection = ({ hospitalData, handleApprove, handleReject, dashboardStats, loading, error }) => (
  <div className="dashboard-content">
    {error && <div className="error-message">{error}</div>}

    <div className="flex justify-between items-center mb-6">
      <h2 className="section-title mb-0">Hospital Registration Requests</h2>
      <div className="bg-white/50 px-4 py-2 rounded-lg text-[#556B73] font-bold border border-[#798E93]/20">
        Total Pending: <span className="text-red-600">{dashboardStats.pendingHospitals || 0}</span>
      </div>
    </div>

    <div className="hospitals-list-container">
      {loading ? (
        [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '300px', borderRadius: '16px' }}></div>)
      ) : (
        <>
          {hospitalData.map(hospital => (
            <AdminHospitalCard
              key={hospital._id}
              hospital={hospital}
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
        </>
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

  if (loadingAnalytics) {
    return (
      <div className="dashboard-content">
        <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '32px' }}></div>
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }}></div>)}
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }}></div>
          <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-content donor-analytics-page">
      <h2 className="section-title">Donor Ecosystem Analytics</h2>

      <div className="donor-summary-grid grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="analytics-card p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
          <p className="text-sm font-bold text-[#64748b] mb-1">Total Network Donors</p>
          <p className="text-3xl font-black text-[#1e293b]">{donorAnalytics?.totalDonors || 0}</p>
          <div className="mt-2 flex items-center gap-1 text-[#10b981] text-xs font-bold">
            <TrendingUp size={14} /> +12% growth
          </div>
        </div>
        <div className="analytics-card p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <p className="text-sm font-bold text-[#64748b] mb-1">Critical Blood Types</p>
          <p className="text-3xl font-black text-red-600">{donorAnalytics?.byBloodType?.length || 0}</p>
          <p className="text-[10px] text-[#94a3b8] mt-2">Diversity metric active</p>
        </div>
        <div className="analytics-card p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <p className="text-sm font-bold text-[#64748b] mb-1">Active Regions</p>
          <p className="text-3xl font-black text-[#3b82f6]">{donorAnalytics?.byLocation?.length || 0}</p>
          <p className="text-[10px] text-[#94a3b8] mt-2">Verified jurisdictional data</p>
        </div>
        <div className="analytics-card p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <p className="text-sm font-bold text-[#64748b] mb-1">Hospital Partners</p>
          <p className="text-3xl font-black text-[#8b5cf6]">{donorAnalytics?.byHospital?.length || 0}</p>
          <p className="text-[10px] text-[#94a3b8] mt-2">Linked medical centers</p>
        </div>
      </div>

      <div className="analytics-charts-grid grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="analytics-panel p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
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

        <div className="analytics-panel p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
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
        <div className="analytics-panel p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <h3 className="text-md font-bold text-[#1e293b] mb-6 flex items-center gap-2">
            <Grid size={18} className="text-purple-500" /> Donors by Organ Type
          </h3>
          <div className="flex flex-wrap gap-4">
            {donorAnalytics?.byOrganType?.map((o, idx) => (
              <div key={idx} className="organ-pill flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 flex-1 min-w-[140px] hover:bg-white transition-all">
                <div className={`w-2 h-8 rounded-full ${['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-amber-400'][idx % 4]}`}></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{o._id}</p><p className="text-lg font-bold text-gray-800">{o.count}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="insights-panel p-6 bg-[#0f172a] rounded-2xl text-white shadow-lg border border-white/5">
          <h3 className="text-md font-bold mb-6 flex items-center gap-2"><Info size={18} className="text-amber-400" /> Medical Alerts & Readiness</h3>
          <div className="space-y-4">
            <div className="insight-item flex gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="h-2 w-2 rounded-full bg-amber-400 mt-1.5 shrink-0 animate-pulse"></div>
              <div>
                <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Critical Shortage</p>
                <p className="text-sm text-gray-300">Supply of <span className="text-white font-bold">O- Blood Type</span> is below safety threshold in 3 regions.</p>
              </div>
            </div>
            <div className="insight-item flex gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="h-2 w-2 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Network Capacity</p>
                <p className="text-sm text-gray-300">Donor readiness high in <span className="text-white font-bold">{donorAnalytics?.byLocation?.[0]?._id}</span> cluster.</p>
              </div>
            </div>
            <div className="insight-item flex gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="h-2 w-2 rounded-full bg-green-400 mt-1.5 shrink-0"></div>
              <div>
                <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">System Health</p>
                <p className="text-sm text-gray-300">Real-time matching protocols are running at 98% efficiency.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const OrganRequestsSection = ({ requestData, setCurrentPage, loading, navigate, onSelectRequest }) => {
  const urgencyScore = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'bg-red-600 shadow-red-100 hover:shadow-red-200';
      case 'high': return 'bg-amber-500 shadow-amber-100 hover:shadow-amber-200';
      default: return 'bg-blue-500 shadow-blue-100 hover:shadow-blue-200';
    }
  }

  return (
    <div className="dashboard-content">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="section-title mb-1">Organ Requests Hub</h2>
          <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Active demand across network</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-2.5 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-2xl border border-red-100 flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            {requestData.filter(r => r.patient?.urgencyLevel === 'critical').length} Critical Cases
          </div>
          <button className="p-3 bg-white border border-gray-100 text-[#1e293b] rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="request-card skeleton h-[350px] rounded-[32px]"></div>)
        ) : (
          requestData.map(request => (
            <div key={request._id} className="request-card group bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 relative overflow-hidden flex flex-col justify-between cursor-pointer" onClick={() => onSelectRequest(request)}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors z-0"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transform group-hover:scale-110 transition-transform ${urgencyScore(request.patient?.urgencyLevel || request.urgency)}`}>
                      {request.organType?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-[#1e293b] text-xl uppercase tracking-tighter">{request.organType}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-[#94a3b8] px-2 py-0.5 bg-gray-100 rounded">#REQ-{request._id.slice(-6).toUpperCase()}</span>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${request.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${request.patient?.urgencyLevel === 'critical' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-600'}`}>
                      {request.patient?.urgencyLevel || 'STANDARD'}
                    </span>
                    <p className="mt-2 text-[10px] text-[#94a3b8] font-bold flex items-center justify-end gap-1 uppercase tracking-tighter">
                      <Clock size={10} /> {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="request-details-grid grid grid-cols-2 gap-4 mb-6">
                  <div className="detail-item bg-gray-50/80 p-3 rounded-2xl border border-gray-100 group-hover:bg-white transition-colors">
                    <p className="text-[10px] font-black text-[#94a3b8] uppercase mb-1 tracking-widest">Blood Matrix</p>
                    <p className="text-lg font-black text-[#1e293b]">{request.patient?.bloodType || request.bloodType || 'N/A'}</p>
                  </div>
                  <div className="detail-item bg-gray-50/80 p-3 rounded-2xl border border-gray-100 group-hover:bg-white transition-colors">
                    <p className="text-[10px] font-black text-[#94a3b8] uppercase mb-1 tracking-widest">SLA Countdown</p>
                    <p className="text-lg font-black text-red-600 flex items-center gap-1">
                      <TrendingUp size={16} /> {Math.max(0, 7 - Math.floor((new Date() - new Date(request.createdAt)) / (1000 * 60 * 60 * 24)))}d
                    </p>
                  </div>
                </div>

                <div className="hospital-locator mb-6 flex items-center justify-between p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50 group-hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200"><Building2 size={18} /></div>
                    <div>
                      <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Source Entity</p>
                      <p className="text-sm font-black text-[#1e293b] truncate max-w-[150px]">{request.hospital?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); request.hospital?._id && navigate(`/admin/hospitals/${request.hospital._id}`); }}
                    className="p-2 hover:bg-white rounded-lg transition-all text-blue-600 shadow-sm border border-transparent hover:border-blue-200"
                  >
                    <Eye size={16} />
                  </button>
                </div>

                <div className="action-row flex items-center gap-3">
                  <button
                    className="flex-1 bg-[#1e293b] text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:shadow-xl transition-all shadow-lg active:scale-95"
                    onClick={(e) => { e.stopPropagation(); request.hospital?._id && navigate(`/admin/hospitals/${request.hospital._id}`); }}
                  >
                    Analyze Logistics
                  </button>
                  <button
                    className="w-12 h-12 flex items-center justify-center bg-gray-100 text-[#64748b] rounded-2xl hover:bg-white hover:border-gray-200 border border-transparent transition-all"
                    onClick={(e) => { e.stopPropagation(); onSelectRequest(request); }}
                  >
                    <Info size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const TransplantsSection = ({ transplantData, loading }) => (
  <div className="dashboard-content">
    <div className="flex justify-between items-center mb-8">
      <h2 className="section-title mb-0">Medical Operations Archive</h2>
      <div className="px-4 py-2 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded-xl border border-green-100 flex items-center gap-2">
        <ShieldCheck size={14} /> System Verified Outcomes
      </div>
    </div>
    <div className="table-wrapper bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="admin-table">
        <thead>
          <tr className="bg-gray-50/50">
            <th className="py-5 text-[10px] font-black uppercase text-[#94a3b8] tracking-widest pl-8">Ops ID</th>
            <th className="py-5 text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">Organ</th>
            <th className="py-5 text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">Medical Centers (Source → Target)</th>
            <th className="py-5 text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">Timestamp</th>
            <th className="py-5 text-[10px] font-black uppercase text-[#94a3b8] tracking-widest text-right pr-8">Performance Outcome</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)
          ) : (
            transplantData.length > 0 ? transplantData.map(t => (
              <tr key={t._id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0 group">
                <td className="py-5 pl-8 font-mono text-xs font-bold text-[#64748b]">#{t.transplantId || t._id.slice(-6).toUpperCase()}</td>
                <td className="py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="font-black text-[#1e293b] uppercase tracking-tighter">{t.organType}</span>
                  </div>
                </td>
                <td className="py-5">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="text-[#1e293b] max-w-[120px] truncate">{t.donor?.registeredHospital?.name || 'CENTRAL'}</span>
                    <ArrowLeft size={10} className="text-gray-300 rotate-180" />
                    <span className="text-blue-600 max-w-[120px] truncate">{t.recipient?.hospital?.name || 'TARGET'}</span>
                  </div>
                </td>
                <td className="py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="py-5 text-right pr-8">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${t.outcome?.success ? 'bg-green-100 text-green-700 shadow-sm border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                    {t.outcome?.success ? 'SUCCESSFUL_MATCH' : 'IN_PROGRESS'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="text-center py-20 text-[#94a3b8] font-bold uppercase text-xs tracking-widest">No operation records synchronized in this cycle.</td></tr>
            )
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

  if (loadingReports) {
    return (
      <div className="dashboard-content">
        <div className="skeleton" style={{ height: '300px', borderRadius: '24px', marginBottom: '40px' }}></div>
        <div className="skeleton" style={{ height: '400px', borderRadius: '24px' }}></div>
      </div>
    )
  }

  return (
    <div className="dashboard-content system-reports-page space-y-12 pb-20">
      <div className="reports-hero bg-gradient-to-r from-[#0f172a] to-[#1e293b] p-10 rounded-3xl text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-2 tracking-tight">Annual Performance</h2>
          <div className="flex gap-8 mt-8">
            <div className="report-stat"><p className="text-[10px] uppercase font-bold text-blue-300 tracking-widest">Centers</p><p className="text-2xl font-black">{dashboardStats.overview?.hospitals?.total || 0}</p></div>
            <div className="report-stat border-l border-white/10 pl-8"><p className="text-[10px] uppercase font-bold text-blue-300 tracking-widest">Success Rate</p><p className="text-2xl font-black">94.2%</p></div>
          </div>
        </div>
        <BarChart3 className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/5 rotate-12" />
      </div>

      <section className="report-section">
        <div className="section-header flex items-center gap-3 mb-6"><div className="w-1.5 h-8 bg-blue-600 rounded-full"></div><h3 className="text-2xl font-black tracking-tight text-[#1e293b]">The Match Gap</h3></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all"><OrgDemandBar data={reportData?.organComparison?.demand || []} /></div>
          <div className="space-y-4">
            {reportData?.organComparison?.demand?.slice(0, 4).map((d, i) => {
              const avail = reportData?.organComparison?.availability?.find(a => a._id === d._id)?.count || 0
              const gap = d.count - avail
              return (
                <div key={i} className="gap-card p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex justify-between items-center mb-2"><span className="font-bold text-[#1e293b]">{d._id}</span><span className={`text-[10px] font-black px-2 py-0.5 rounded ${gap > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{gap > 0 ? 'Shortage' : 'Surplus'}</span></div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-600 h-full" style={{ width: `${(avail / (d.count || 1)) * 100}%` }}></div></div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="report-section">
        <div className="section-header flex items-center gap-3 mb-6"><div className="w-1.5 h-8 bg-green-600 rounded-full"></div><h3 className="text-2xl font-black tracking-tight text-[#1e293b]">Partner Excellence</h3></div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
          <table className="w-full text-left">
            <thead className="bg-[#f8fafc] border-b border-gray-100"><tr><th className="px-8 py-4 text-xs font-black uppercase text-[#64748b] tracking-wider">Rank</th><th className="px-8 py-4 text-xs font-black uppercase text-[#64748b] tracking-wider">Hospital</th><th className="px-8 py-4 text-xs font-black uppercase text-[#64748b] tracking-wider">Transplants</th><th className="px-8 py-4 text-xs font-black uppercase text-[#64748b] tracking-wider">Success Rate</th></tr></thead>
            <tbody>
              {reportData?.hospitalPerformance?.map((h, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-8 py-5 font-black text-[#64748b]">#{i + 1}</td>
                  <td className="px-8 py-5 font-bold text-[#1e293b]">{h.name}</td>
                  <td className="px-8 py-5 font-black text-[#3b82f6] tabular-nums">{h.totalTransplants}</td>
                  <td className="px-8 py-5"><div className="flex items-center gap-3"><span className="font-bold text-[#1e293b] tabular-nums">{((h.successfulTransplants / h.totalTransplants) * 100 || 0).toFixed(1)}%</span><div className="w-16 h-1 bg-gray-100 rounded-full"><div className="bg-green-500 h-full" style={{ width: `${(h.successfulTransplants / h.totalTransplants) * 100}%` }}></div></div></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

const SettingsSection = ({ apiService, addToast }) => {
  const [settingsTab, setSettingsTab] = useState('profile')
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiService.getSettings()
        setSettings(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchSettings()
  }, [apiService])

  const toggleNotification = async (key) => {
    if (!settings) return
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    }
    setSettings(newSettings)
    try {
      setSaving(true)
      await apiService.updateSettings(newSettings)
      addToast('System Updated', 'Notification protocols synchronized', 'success')
    } catch (err) {
      addToast('Error', 'Failed to update remote settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dashboard-content settings-portal">
      <h2 className="section-title mb-8">System Configuration</h2>
      <div className="settings-container bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex min-h-[600px] animate-fade-in-up">
        <aside className="w-64 bg-[#f8fafc] border-r border-gray-100 p-6 flex flex-col justify-between">
          <nav className="space-y-2">
            {[
              { id: 'profile', label: 'Identity', icon: User },
              { id: 'security', label: 'Access Control', icon: Shield },
              { id: 'notifications', label: 'Alert Protocols', icon: Bell },
              { id: 'rules', label: 'SOP Manifest', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSettingsTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${settingsTab === tab.id ? 'bg-[#0f172a] text-white shadow-xl translate-x-1' : 'text-[#64748b] hover:bg-white hover:shadow-sm'}`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </nav>
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
            <p className="text-[10px] font-black text-blue-900 uppercase mb-1">Audit Trail</p>
            <p className="text-[9px] text-blue-700 leading-tight">Every change here is logged in the system audit logs for medical accountability.</p>
          </div>
        </aside>
        <main className="flex-1 p-10 bg-white relative">
          {saving && <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 animate-pulse"></div>}

          {settingsTab === 'profile' && (
            <div className="settings-view animate-fade-in">
              <h3 className="text-2xl font-black mb-8 text-[#1e293b] tracking-tight flex items-center gap-3">
                <User size={24} className="text-blue-600" /> Admin Identity
              </h3>
              <div className="space-y-8 max-w-md">
                <div className="field-group">
                  <label className="text-[10px] uppercase font-black text-[#94a3b8] block tracking-widest mb-3">System Key Assigned To</label>
                  <div className="flex items-center gap-4 bg-[#f8fafc] p-4 rounded-2xl border border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">SA</div>
                    <div>
                      <p className="text-sm font-black text-[#1e293b]">GLOBAL_ADMINISTRATOR_ROOT</p>
                      <p className="text-[10px] font-bold text-blue-600">Level 4 Clearance</p>
                    </div>
                  </div>
                </div>
                <div className="field-group">
                  <input type="text" readOnly value="admin@organ.system" className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl px-5 py-4 text-xs font-bold text-[#64748b] cursor-not-allowed" />
                </div>
              </div>
            </div>
          )}

          {settingsTab === 'security' && (
            <div className="settings-view animate-fade-in">
              <h3 className="text-2xl font-black mb-8 text-[#1e293b] tracking-tight flex items-center gap-3">
                <Shield size={24} className="text-blue-600" /> Access Control Matrix
              </h3>
              <div className="space-y-8 max-w-md">
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
                  <AlertCircle className="text-amber-600 shrink-0" size={20} />
                  <p className="text-xs font-bold text-amber-900 leading-relaxed">Changing sensitive access credentials will terminate all active sessions and require immediate re-verification of administrative identity.</p>
                </div>
                <div className="field-group">
                  <label className="text-[10px] uppercase font-black text-[#94a3b8] block tracking-widest mb-3">Master Key Verification</label>
                  <input type="password" placeholder="••••••••••••" className="w-full bg-white border-2 border-gray-100 focus:border-blue-600 rounded-2xl px-5 py-4 text-sm font-black transition-all outline-none" />
                </div>
                <button className="w-full bg-[#0f172a] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:shadow-2xl transition-all active:scale-95 shadow-lg">
                  Initiate Secure Protocol Change
                </button>
              </div>
            </div>
          )}

          {settingsTab === 'notifications' && (
            <div className="settings-view animate-fade-in">
              <h3 className="text-2xl font-black mb-8 text-[#1e293b] tracking-tight flex items-center gap-3">
                <Bell size={24} className="text-blue-600" /> Synchronization Alerts
              </h3>
              <div className="space-y-6">
                {[
                  { key: 'hospitalRequests', label: 'Hospital Registration Alerts', desc: 'Notify when a new medical entity requests system access' },
                  { key: 'criticalMatches', label: 'Emergency Organ Matching', desc: 'Real-time critical demand and supply intersection alerts' },
                  { key: 'slaBreaches', label: 'SLA & Protocol Violations', desc: 'Alert when hospital response exceeds 7-day medical threshold' }
                ].map((item) => (
                  <div key={item.key} className="flex justify-between items-center p-6 bg-[#f8fafc] rounded-3xl border border-gray-100 hover:border-blue-200 transition-all group">
                    <div>
                      <p className="font-black text-sm text-[#1e293b] uppercase tracking-tighter mb-1">{item.label}</p>
                      <p className="text-xs text-[#94a3b8] font-bold">{item.desc}</p>
                    </div>
                    <div
                      onClick={() => toggleNotification(item.key)}
                      className={`w-14 h-8 rounded-full relative cursor-pointer transition-all duration-300 ${settings?.notifications[item.key] ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${settings?.notifications[item.key] ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {settingsTab === 'rules' && (
            <div className="settings-view animate-fade-in">
              <h3 className="text-2xl font-black mb-8 text-[#1e293b] tracking-tight flex items-center gap-3">
                <FileText size={24} className="text-blue-600" /> Standard Operating Procedures
              </h3>
              <div className="prose prose-sm max-w-none">
                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 font-medium text-[#475569] leading-relaxed">
                    <h4 className="font-black text-xs uppercase tracking-widest text-blue-600 mb-2">Protocol 4-A: Donor Verification</h4>
                    Admins must only review information. Direct modification of biological donor data is strictly prohibited to maintain medical integrity. Any suspected data corruption must be reported to technical support immediately.
                  </div>
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 font-medium text-[#475569] leading-relaxed">
                    <h4 className="font-black text-xs uppercase tracking-widest text-blue-600 mb-2">Protocol 9-C: Hospital Vetting</h4>
                    Registration approval requires valid licensing and system-verified GPS coordinates. Suspicious activity logs from any hospital should trigger immediate protocol suspension until a level-2 audit is completed.
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(location.state?.from || 'dashboard')
  const [dashboardStats, setDashboardStats] = useState({})
  const [hospitalData, setHospitalData] = useState([])
  const [donorData, setDonorData] = useState([])
  const [requestData, setRequestData] = useState([])
  const [transplantData, setTransplantData] = useState([])
  const [showHospitalMenu, setShowHospitalMenu] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [toasts, setToasts] = useState([])

  const addToast = (title, message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, title, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

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

  // Data Refresh / Real-time Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const triggers = [
          { title: 'Emergency Alert', msg: 'New critical request from General Hospital', type: 'error' },
          { title: 'Security Audit', msg: 'System logs synchronized with blockchain', type: 'info' },
          { title: 'New Arrival', msg: 'Donor registration verified in Sector 14', type: 'success' }
        ]
        const trigger = triggers[Math.floor(Math.random() * triggers.length)]
        addToast(trigger.title, trigger.msg, trigger.type)
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // Load data based on current page
  useEffect(() => {
    switch (currentPage) {
      case 'dashboard':
        loadDashboardData()
        break
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

  // Reload hospitals when filters or tab change (for 'all' and 'emergency' tabs)
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
      addToast('Success', 'Hospital approved successfully', 'success')
    } catch (err) {
      addToast('Error', err.message, 'error')
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to REJECT and DELETE this hospital? This action cannot be undone.')) return;
    try {
      await apiService.rejectHospital(id)
      setHospitalData(hospitalData.filter(h => h._id !== id))
      loadHospitalStats()
      addToast('Rejected', 'Hospital request has been removed', 'warning')
    } catch (err) {
      addToast('Error', err.message, 'error')
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
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' && <Check size={16} />}
              {toast.type === 'error' && <X size={16} />}
              {toast.type === 'warning' && <AlertCircle size={16} />}
              {toast.type === 'info' && <Info size={16} />}
            </div>
            <div className="toast-content">
              <p className="toast-title">{toast.title}</p>
              <p className="toast-message">{toast.message}</p>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="tracking-tighter">ORGAN DONATION SYSTEM</h1>
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
              <span className="ml-auto bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
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
          <div className="system-identity">
            <ShieldCheck size={20} className="text-blue-600" />
            <span className="text-xs font-black uppercase tracking-widest text-[#1e293b]">Secured Environment</span>
          </div>
          <div className="top-bar-actions">
            <button className="icon-btn relative bg-gray-100/50 hover:bg-gray-100 transition-colors">
              <Bell size={18} />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
            </button>
            <div className="profile-menu">
              <button className="profile-btn bg-white border border-gray-100 shadow-sm"><User size={18} /><span>Sys_Admin</span><ChevronDown size={14} /></button>
            </div>
            <button className="logout-btn bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444] hover:text-white border border-[#ef4444]/20 transition-all font-bold" onClick={onLogout}><LogOut size={16} /> Terminate Session</button>
          </div>
        </header>

        <main className="dashboard-content-area">
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
              onHospitalClick={(id) => navigate(`/admin/hospitals/${id}`, { state: { from: currentPage } })}
            />
          )}
          {currentPage === 'donors' && <DonorsSection apiService={apiService} donorData={donorData} />}
          {currentPage === 'requests' && <OrganRequestsSection requestData={requestData} setCurrentPage={setCurrentPage} loading={loading} navigate={navigate} onSelectRequest={setSelectedRequest} />}
          {currentPage === 'transplants' && <TransplantsSection transplantData={transplantData} loading={loading} />}
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
          {currentPage === 'settings' && <SettingsSection apiService={apiService} addToast={addToast} />}
        </main>
      </div>

      {/* Donor Detail Modal (Read-Only) */}
      {selectedDonor && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={() => setSelectedDonor(null)}>
          <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="relative h-32 bg-[#1e293b] p-8 flex items-end justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg transform translate-y-10">
                  <div className="w-full h-full rounded-[14px] bg-red-50 flex items-center justify-center text-red-600 font-black text-2xl">
                    {selectedDonor.medicalInfo?.bloodType}
                  </div>
                </div>
                <div className="mb-2">
                  <h3 className="text-white font-black text-2xl uppercase tracking-tighter">DN-{selectedDonor._id.slice(-8).toUpperCase()}</h3>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Medical Record Synchronized</p>
                </div>
              </div>
              <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors" onClick={() => setSelectedDonor(null)}><X size={24} /></button>
            </div>
            <div className="p-8 pt-16">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">Biological Profile</p>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-[#64748b]">Genetic Sex</span>
                        <span className="text-xs font-black text-[#1e293b] uppercase">{selectedDonor.personalInfo?.gender || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-[#64748b]">Chronological Age</span>
                        <span className="text-xs font-black text-[#1e293b]">{selectedDonor.personalInfo?.age || 'N/A'}Y</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">Allocation Details</p>
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3">
                      <Building2 size={18} className="text-blue-600" />
                      <div>
                        <p className="text-[10px] font-black text-blue-900 uppercase">Primary Facility</p>
                        <p className="text-sm font-black text-[#1e293b]">{selectedDonor.registeredHospital?.name || 'Central Repository'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">Consent Parameters</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDonor.medicalInfo?.organTypes?.map((o, i) => (
                        <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 text-[10px] font-black rounded-lg border border-green-100 uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 size={10} /> {o}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">Operational Protocol</p>
                    <span className={`inline-block px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedDonor.status === 'active' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-gray-100 text-gray-500'}`}>
                      {selectedDonor.status} STATUS
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <AlertCircle size={18} className="text-[#94a3b8]" />
                <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-tighter">Identity parameters are masked for admin review per HIPAA protocol 42-B.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={() => setSelectedRequest(null)}>
          <div className="bg-white w-full max-w-3xl rounded-[40px] overflow-hidden shadow-2xl animate-scale-in flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="relative h-40 bg-[#1e293b] p-10 flex items-end justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-[32px] bg-white p-1 shadow-2xl transform translate-y-12">
                  <div className={`w-full h-full rounded-[28px] flex items-center justify-center text-white font-black text-4xl ${selectedRequest.patient?.urgencyLevel === 'critical' ? 'bg-red-600' : 'bg-blue-600'}`}>
                    {selectedRequest.organType?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-black text-3xl uppercase tracking-tighter">{selectedRequest.organType}</h3>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedRequest.patient?.urgencyLevel === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                      {selectedRequest.patient?.urgencyLevel || 'STANDARD'} PRIORITY
                    </span>
                  </div>
                  <p className="text-blue-400 text-xs font-black uppercase tracking-widest mt-1 italic">REQ-{selectedRequest._id.slice(-12).toUpperCase()}</p>
                </div>
              </div>
              <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full" onClick={() => setSelectedRequest(null)}><X size={24} /></button>
            </div>

            <div className="p-10 pt-20 grid grid-cols-5 gap-10">
              <div className="col-span-3 space-y-8">
                <div>
                  <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-4">Clinical Parameters</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-black text-[#64748b] uppercase mb-1">Blood Profile</p>
                      <p className="text-xl font-black text-[#1e293b]">{selectedRequest.patient?.bloodType || 'N/A'}</p>
                    </div>
                    <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-black text-[#64748b] uppercase mb-1">Patient Age</p>
                      <p className="text-xl font-black text-[#1e293b]">{selectedRequest.patient?.age || 'N/A'}Y</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-4">Hospital Authentication</p>
                  <div className="p-6 bg-blue-50/50 rounded-[32px] border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <p className="text-lg font-black text-[#1e293b] leading-tight">{selectedRequest.hospital?.name || 'CENTRAL REPOSITORY'}</p>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1 flex items-center gap-1">
                          <MapPin size={10} /> {selectedRequest.hospital?.location?.city || 'S.F.'}, {selectedRequest.hospital?.location?.state || 'CA'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/hospitals/${selectedRequest.hospital._id}`); }}
                      className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-8">
                <div>
                  <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-4">Logistics Timeline</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="text-blue-600 bg-white p-2 rounded-lg shadow-sm"><Calendar size={18} /></div>
                      <div>
                        <p className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">Registered</p>
                        <p className="text-xs font-black text-[#1e293b]">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                      <div className="text-red-600 bg-white p-2 rounded-lg shadow-sm"><Clock size={18} /></div>
                      <div>
                        <p className="text-[10px] font-black text-red-900 uppercase tracking-widest">SLA Expiry</p>
                        <p className="text-xs font-black text-red-600">IN {Math.max(0, 7 - Math.floor((new Date() - new Date(selectedRequest.createdAt)) / (1000 * 60 * 60 * 24)))} DAYS</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#0f172a] rounded-[32px] text-white">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Operations Control</p>
                  <div className="space-y-3">
                    <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40">Initiate Match Search</button>
                    <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Mark as Urgent</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
