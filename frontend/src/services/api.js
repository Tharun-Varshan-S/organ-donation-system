const API_BASE_URL = 'http://localhost:5000/api'

class ApiService {
  constructor() {
    this.adminToken = localStorage.getItem('adminToken')
    this.hospitalToken = localStorage.getItem('hospitalToken')
    this.userToken = localStorage.getItem('userToken') || localStorage.getItem('token')
  }

  // Set auth tokens
  setAdminToken(token) {
    this.adminToken = token
    if (token) localStorage.setItem('adminToken', token)
    else localStorage.removeItem('adminToken')
  }

  setHospitalToken(token) {
    this.hospitalToken = token
    if (token) localStorage.setItem('hospitalToken', token)
    else localStorage.removeItem('hospitalToken')
  }

  setUserToken(token) {
    this.userToken = token
    if (token) localStorage.setItem('userToken', token)
    else localStorage.removeItem('userToken')
  }

  // Get auth headers
  getAuthHeaders(type = 'hospital') {
    const adminToken = localStorage.getItem('adminToken');
    const hospitalToken = localStorage.getItem('hospitalToken') || localStorage.getItem('token');
    const userToken = localStorage.getItem('userToken') || localStorage.getItem('token');

    let token = hospitalToken;
    if (type === 'admin') token = adminToken;
    if (type === 'user' || type === 'donor') token = userToken;

    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // Handle API response
  async handleResponse(response) {
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'API request failed')
    }
    return data
  }

  // Admin Authentication
  async adminLogin(email, password) {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await this.handleResponse(response)
    if (data.success && data.token) {
      this.setAdminToken(data.token) // Updated to setAdminToken
    }
    return data
  }

  // Admin Core Features
  async getHospitalStats() {
    const response = await fetch(`${API_BASE_URL}/admin/hospitals/stats`, {
      headers: this.getAuthHeaders('admin')
    })
    return this.handleResponse(response)
  }

  async getDonorAnalytics() {
    const response = await fetch(`${API_BASE_URL}/admin/donors/analytics`, {
      headers: this.getAuthHeaders('admin')
    })
    return this.handleResponse(response)
  }

  async getSettings() {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: this.getAuthHeaders('admin')
    })
    return this.handleResponse(response)
  }

  async updateSettings(settings) {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: this.getAuthHeaders('admin'),
      body: JSON.stringify(settings)
    })
    return this.handleResponse(response)
  }

  async getDonors() {
    const response = await fetch(`${API_BASE_URL}/admin/donors`, {
      headers: this.getAuthHeaders('admin')
    })
    return this.handleResponse(response)
  }

  async getSystemReports() {
    const response = await fetch(`${API_BASE_URL}/admin/reports`, {
      headers: this.getAuthHeaders('admin')
    })
    return this.handleResponse(response)
  }

  // Hospital Authentication
  async hospitalLogin(email, password) {
    const response = await fetch(`${API_BASE_URL}/hospital/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await this.handleResponse(response)
    if (data.success && data.token) {
      this.setHospitalToken(data.token)
    }
    return data
  }

  async hospitalRegister(formData) {
    const response = await fetch(`${API_BASE_URL}/hospital/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    return this.handleResponse(response)
  }

  // Hospital Core Features
  async getHospitalRequests() {
    const response = await fetch(`${API_BASE_URL}/hospital/requests`, {
      headers: this.getAuthHeaders('hospital')
    })
    return this.handleResponse(response)
  }

  async getRequestById(id) {
    const response = await fetch(`${API_BASE_URL}/hospital/requests/${id}`, {
      headers: this.getAuthHeaders('hospital')
    })
    return this.handleResponse(response)
  }

  async updateApplicationStatus(applicationId, updateData) {
    const response = await fetch(`${API_BASE_URL}/hospital/applications/${applicationId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders('hospital'),
      body: JSON.stringify(updateData)
    })
    return this.handleResponse(response)
  }

  async captureSLABreach(id, delayReason) {
    const response = await fetch(`${API_BASE_URL}/hospital/requests/${id}/sla-breach`, {
      method: 'PUT',
      headers: this.getAuthHeaders('hospital'),
      body: JSON.stringify({ delayReason })
    })
    return this.handleResponse(response)
  }

  async getHospitalDonors() {
    const response = await fetch(`${API_BASE_URL}/hospital/donors`, {
      headers: this.getAuthHeaders('hospital')
    })
    return this.handleResponse(response)
  }

  async getHospitalDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/hospital/dashboard`, {
      headers: this.getAuthHeaders('hospital')
    })
    return this.handleResponse(response)
  }

  async getDashboardStats() {
    return this.getHospitalDashboardStats();
  }

  // Admin: Get Hospitals (with filters)
  async getHospitals(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) queryParams.append(key, filters[key]);
    });

    const response = await fetch(`${API_BASE_URL}/admin/hospitals?${queryParams.toString()}`, {
      headers: this.getAuthHeaders('admin')
    })
    return this.handleResponse(response)
  }

  // Admin: Get Hospital Details
  async getAdminHospitalDetails(hospitalId) {
    const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}`, {
      headers: this.getAuthHeaders('admin')
    })
    return this.handleResponse(response)
  }

  // Admin: Approve Hospital
  async approveHospital(hospitalId) {
    const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}/approve`, {
      method: 'PUT',
      headers: this.getAuthHeaders('admin')
    })
    return this.handleResponse(response)
  }

  // Admin: Reject Hospital
  async rejectHospital(hospitalId) {
    const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}/reject`, {
      method: 'PUT',
      headers: this.getAuthHeaders('admin')
    })
    return this.handleResponse(response)
  }

  // Admin: Update Hospital Status
  async updateHospitalStatus(hospitalId, status) {
    const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders('admin'),
      body: JSON.stringify({ status })
    })
    return this.handleResponse(response)
  }

  // Admin: Get Requests
  async getRequests(page = 1, limit = 10) {
    const response = await fetch(`${API_BASE_URL}/admin/requests?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders('admin')
    })
    return this.handleResponse(response)
  }

  // Admin: Get Transplants
  async getTransplants(page = 1, limit = 10) {
    const response = await fetch(`${API_BASE_URL}/admin/transplants?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders('admin')
    })
    return this.handleResponse(response)
  }

  // Public: Get Hospitals discovery
  async getPublicHospitals(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) queryParams.append(key, filters[key]);
    });

    const response = await fetch(`${API_BASE_URL}/hospitals?${queryParams.toString()}`, {
      headers: { 'Content-Type': 'application/json' }
    })
    return this.handleResponse(response)
  }

  async getHospitalTransplants() {
    const response = await fetch(`${API_BASE_URL}/hospital/transplants`, {
      headers: this.getAuthHeaders('hospital')
    })
    return this.handleResponse(response)
  }

  async updateTransplantStatus(id, updateData) {
    const response = await fetch(`${API_BASE_URL}/hospital/transplants/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders('hospital'),
      body: JSON.stringify(updateData)
    })
    return this.handleResponse(response)
  }

  async updateTransplantOutcome(id, outcomeData) {
    const response = await fetch(`${API_BASE_URL}/hospital/transplants/${id}/outcome`, {
      method: 'PUT',
      headers: this.getAuthHeaders('hospital'),
      body: JSON.stringify(outcomeData)
    })
    return this.handleResponse(response)
  }

  async getHospitalNotifications() {
    const response = await fetch(`${API_BASE_URL}/hospital/notifications`, {
      headers: this.getAuthHeaders('hospital')
    })
    return this.handleResponse(response)
  }

  async markNotificationRead(id) {
    const response = await fetch(`${API_BASE_URL}/hospital/notifications/${id}/read`, {
      method: 'PUT',
      headers: this.getAuthHeaders('hospital')
    })
    return this.handleResponse(response)
  }

  async getHospitalAnalytics() {
    const response = await fetch(`${API_BASE_URL}/hospital/analytics`, {
      headers: this.getAuthHeaders('hospital')
    })
    return this.handleResponse(response)
  }

  async getHospitalProfile() {
    const response = await fetch(`${API_BASE_URL}/hospital/profile`, {
      headers: this.getAuthHeaders('hospital')
    })
    return this.handleResponse(response)
  }

  async getDoctors() {
    const response = await fetch(`${API_BASE_URL}/hospital/doctors`, {
      headers: this.getAuthHeaders('hospital')
    })
    return this.handleResponse(response)
  }

  async getDonorTimeline(id) {
    const response = await fetch(`${API_BASE_URL}/hospital/donors/${id}/timeline`, {
      headers: this.getAuthHeaders('hospital')
    })
    return this.handleResponse(response)
  }

  async getDonorProfile(id) {
    const response = await fetch(`${API_BASE_URL}/hospital/donors/${id}/profile`, {
      headers: this.getAuthHeaders('hospital')
    })
    return this.handleResponse(response)
  }

  // User/Donor Authentication
  async userLogin(email, password) {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await this.handleResponse(response)
    if (data.success && data.token) {
      this.setUserToken(data.token)
    }
    return data
  }

  async userRegister(formData) {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    const data = await this.handleResponse(response)
    if (data.success && data.token) {
      this.setUserToken(data.token)
    }
    return data
  }

  // Public Discovery
  async getPublicRequests() {
    const response = await fetch(`${API_BASE_URL}/hospital/requests/public`)
    return this.handleResponse(response)
  }

  async applyToRequest(requestId, applicationData) {
    const response = await fetch(`${API_BASE_URL}/hospital/requests/${requestId}/apply`, {
      method: 'POST',
      headers: this.getAuthHeaders('user'),
      body: JSON.stringify(applicationData)
    })
    return this.handleResponse(response)
  }

  logout() {
    this.setAdminToken(null)
    this.setHospitalToken(null)
    this.setUserToken(null)
  }
}

export default new ApiService()