import React, { useState, useEffect } from 'react'
import {
  Home, Building2, Heart, AlertCircle, Repeat2, BarChart3, Settings, LogOut,
  Search, Bell, User, ChevronDown, Edit2, Check, X, Eye
} from 'lucide-react'
import { OrgDemandBar, HospitalPie, MonthlyLine } from './Charts'
import apiService from '../services/api'
import './AdminDashboard.css'

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

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Load data based on current page
  useEffect(() => {
    switch (currentPage) {
      case 'hospitals':
        loadHospitals()
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
    }
  }, [currentPage])

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
      const response = await apiService.getHospitals()
      setHospitalData(response.data.hospitals)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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

  const updateHospitalStatus = async (id, newStatus) => {
    try {
      await apiService.updateHospitalStatus(id, newStatus)
      setHospitalData(hospitalData.map(h => 
        h._id === id ? { ...h, status: newStatus, updatedAt: new Date().toISOString() } : h
      ))
      setShowHospitalMenu(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const StatCard = ({ icon: Icon, label, value, bgColor }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: bgColor }}>
        <Icon size={24} color="white" />
      </div>
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  )

  const renderDashboard = () => (
    <div className="dashboard-content">
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading...</div>}
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard icon={Building2} label="Total Hospitals" value={dashboardStats.totalHospitals || '0'} bgColor="#3b82f6" />
        <StatCard icon={Heart} label="Active Donors" value={dashboardStats.totalDonors || '0'} bgColor="#10b981" />
        <StatCard icon={AlertCircle} label="Pending Requests" value={dashboardStats.totalRequests || '0'} bgColor="#f59e0b" />
        <StatCard icon={Repeat2} label="Successful Transplants" value={dashboardStats.totalTransplants || '0'} bgColor="#8b5cf6" />
        <StatCard icon={User} label="Approved Hospitals" value={dashboardStats.approvedHospitals || '0'} bgColor="#06b6d4" />
        <StatCard icon={BarChart3} label="Pending Hospitals" value={dashboardStats.pendingHospitals || '0'} bgColor="#ec4899" />
      </div>

      {/* Hospital Management Table */}
      <div className="section">
        <h2 className="section-title">Recent Hospitals</h2>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Hospital Name</th>
                <th>Location</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitalData.slice(0, 5).map(hospital => (
                <tr key={hospital._id}>
                  <td className="hospital-name">{hospital.name}</td>
                  <td>{hospital.address}</td>
                  <td>{hospital.contactEmail}</td>
                  <td>
                    <span className={`status-badge status-${hospital.status}`}>
                      {hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(hospital.updatedAt).toLocaleDateString()}</td>
                  <td className="action-cell">
                    <div className="action-dropdown">
                      <button 
                        className="action-btn"
                        onClick={() => setShowHospitalMenu(showHospitalMenu === hospital._id ? null : hospital._id)}
                      >
                        <ChevronDown size={16} />
                      </button>
                      {showHospitalMenu === hospital._id && (
                        <div className="dropdown-menu">
                          <button 
                            className="dropdown-item approve"
                            onClick={() => updateHospitalStatus(hospital._id, 'approved')}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button 
                            className="dropdown-item reject"
                            onClick={() => updateHospitalStatus(hospital._id, 'suspended')}
                          >
                            <X size={14} /> Suspend
                          </button>
                          <button className="dropdown-item view">
                            <Eye size={14} /> View
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderHospitals = () => (
    <div className="dashboard-content">
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading...</div>}
      
      <h2 className="section-title">All Hospitals</h2>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Hospital Name</th>
              <th>Location</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hospitalData.map(hospital => (
              <tr key={hospital._id}>
                <td className="hospital-name">{hospital.name}</td>
                <td>{hospital.address}</td>
                <td>{hospital.contactEmail}</td>
                <td>
                  <span className={`status-badge status-${hospital.status}`}>
                    {hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
                  </span>
                </td>
                <td>{new Date(hospital.updatedAt).toLocaleDateString()}</td>
                <td className="action-cell">
                  <div className="action-dropdown">
                    <button 
                      className="action-btn"
                      onClick={() => setShowHospitalMenu(showHospitalMenu === hospital._id ? null : hospital._id)}
                    >
                      <ChevronDown size={16} />
                    </button>
                    {showHospitalMenu === hospital._id && (
                      <div className="dropdown-menu">
                        <button 
                          className="dropdown-item approve"
                          onClick={() => updateHospitalStatus(hospital._id, 'approved')}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button 
                          className="dropdown-item reject"
                          onClick={() => updateHospitalStatus(hospital._id, 'suspended')}
                        >
                          <X size={14} /> Suspend
                        </button>
                        <button className="dropdown-item view">
                          <Eye size={14} /> View
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderDonors = () => (
    <div className="dashboard-content">
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading...</div>}
      
      <h2 className="section-title">Registered Donors</h2>
      <div className="donor-summary">
        <div className="donor-card">
          <div className="donor-count">{dashboardStats.totalDonors || '0'}</div>
          <div className="donor-label">Total Donors</div>
        </div>
        <div className="donor-card">
          <div className="donor-count">{donorData.filter(d => d.status === 'active').length}</div>
          <div className="donor-label">Active Donors</div>
        </div>
        <div className="donor-card">
          <div className="donor-count">{donorData.filter(d => d.donorType === 'deceased').length}</div>
          <div className="donor-label">Deceased Donors</div>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Donor Name</th>
              <th>Blood Type</th>
              <th>Location</th>
              <th>Organs Available</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {donorData.map(donor => (
              <tr key={donor._id}>
                <td>{donor.name}</td>
                <td>{donor.bloodType}</td>
                <td>{donor.address}</td>
                <td>{donor.organsAvailable?.join(', ') || 'N/A'}</td>
                <td><span className={`status-badge status-${donor.status}`}>{donor.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderOrganRequests = () => (
    <div className="dashboard-content">
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading...</div>}
      
      <h2 className="section-title">Organ Requests</h2>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Hospital</th>
              <th>Organ Type</th>
              <th>Blood Type</th>
              <th>Urgency</th>
              <th>Date Requested</th>
            </tr>
          </thead>
          <tbody>
            {requestData.map(request => (
              <tr key={request._id}>
                <td>#{request._id.slice(-8)}</td>
                <td>{request.hospitalId?.name || 'N/A'}</td>
                <td>{request.organType}</td>
                <td>{request.bloodType}</td>
                <td><span className={`urgency-badge ${request.urgency}`}>{request.urgency}</span></td>
                <td>{new Date(request.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderTransplants = () => (
    <div className="dashboard-content">
      <h2 className="section-title">Transplant Records</h2>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Transplant ID</th>
              <th>Organ</th>
              <th>From Hospital</th>
              <th>To Hospital</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#TRANS-2024-001</td>
              <td>Heart</td>
              <td>City Medical Center</td>
              <td>Regional Hospital</td>
              <td>2024-01-01</td>
              <td><span className="status-badge status-approved">Successful</span></td>
            </tr>
            <tr>
              <td>#TRANS-2024-002</td>
              <td>Kidney</td>
              <td>Riverside Healthcare</td>
              <td>Central Clinic</td>
              <td>2024-01-03</td>
              <td><span className="status-badge status-approved">Successful</span></td>
            </tr>
            <tr>
              <td>#TRANS-2024-003</td>
              <td>Liver</td>
              <td>Central Clinic</td>
              <td>Emergency Plus</td>
              <td>2024-01-05</td>
              <td><span className="status-badge status-approved">Successful</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderReports = () => (
    <div className="dashboard-content">
      <h2 className="section-title">Analytics & Reports</h2>
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Organ Demand</h3>
          <OrgDemandBar />
        </div>
        <div className="chart-card">
          <h3>Hospital Status Distribution</h3>
          <HospitalPie />
        </div>
        <div className="chart-card">
          <h3>Monthly Transplants</h3>
          <MonthlyLine />
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="dashboard-content">
      <h2 className="section-title">Admin Settings</h2>
      <div className="settings-card">
        <h3>System Configuration</h3>
        <div className="settings-item">
          <label>System Notifications</label>
          <input type="checkbox" defaultChecked />
        </div>
        <div className="settings-item">
          <label>Email Alerts</label>
          <input type="checkbox" defaultChecked />
        </div>
        <div className="settings-item">
          <label>Auto-backup</label>
          <input type="checkbox" defaultChecked />
        </div>
        <button className="save-btn">Save Settings</button>
      </div>
    </div>
  )

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>ORGAN DONATION SYSTEM</h1>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <Home size={18} /> Dashboard
          </button>
          <button
            className={`nav-item ${currentPage === 'hospitals' ? 'active' : ''}`}
            onClick={() => setCurrentPage('hospitals')}
          >
            <Building2 size={18} /> Hospitals
          </button>
          <button
            className={`nav-item ${currentPage === 'donors' ? 'active' : ''}`}
            onClick={() => setCurrentPage('donors')}
          >
            <Heart size={18} /> Donors
          </button>
          <button
            className={`nav-item ${currentPage === 'requests' ? 'active' : ''}`}
            onClick={() => setCurrentPage('requests')}
          >
            <AlertCircle size={18} /> Organ Requests
          </button>
          <button
            className={`nav-item ${currentPage === 'transplants' ? 'active' : ''}`}
            onClick={() => setCurrentPage('transplants')}
          >
            <Repeat2 size={18} /> Transplants
          </button>
          <button
            className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`}
            onClick={() => setCurrentPage('reports')}
          >
            <BarChart3 size={18} /> Reports
          </button>
          <button
            className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentPage('settings')}
          >
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
            <button className="icon-btn">
              <Bell size={18} />
            </button>
            <div className="profile-menu">
              <button className="profile-btn">
                <User size={18} />
                <span>Admin</span>
                <ChevronDown size={16} />
              </button>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        {currentPage === 'dashboard' && renderDashboard()}
        {currentPage === 'hospitals' && renderHospitals()}
        {currentPage === 'donors' && renderDonors()}
        {currentPage === 'requests' && renderOrganRequests()}
        {currentPage === 'transplants' && renderTransplants()}
        {currentPage === 'reports' && renderReports()}
        {currentPage === 'settings' && renderSettings()}
      </div>
    </div>
  )
}

export default AdminDashboard
