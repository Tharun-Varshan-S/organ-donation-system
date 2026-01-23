const API_BASE_URL = 'http://localhost:5000/api'

class ApiService {
  constructor() {
    this.token = localStorage.getItem('adminToken')
  }

  // Set auth token
  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('adminToken', token)
    } else {
      localStorage.removeItem('adminToken')
    }
  }

  // Get auth headers
  getAuthHeaders() {
    // Check for userToken first (for donor/user endpoints), then adminToken
    const token = localStorage.getItem('userToken') || localStorage.getItem('token') || this.token;
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
      this.setToken(data.token)
    }

    return data
  }

  async adminRegister(email, password, name, secretKey) {
    const response = await fetch(`${API_BASE_URL}/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, secretKey })
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
      // Do not set adminToken here. Hospital token is handled by AuthPage.
      // this.setToken(data.token) 
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

  // User Authentication
  async userLogin(email, password) {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await this.handleResponse(response)
    // if (data.success && data.token) {
    //   this.setToken(data.token) // Optional: if we want to store it in the class
    // }
    return data
  }

  async userRegister(formData) {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    return this.handleResponse(response)
  }

  // User Profile & History
  async getUserProfile() {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  async updateUserProfile(profileData) {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData)
    })
    return this.handleResponse(response)
  }

  async getUserHistory() {
    const response = await fetch(`${API_BASE_URL}/users/history`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  // Dashboard Stats
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  // Hospital Management
  async getHospitals(filters = {}) {
    const { page = 1, limit = 10, status, search, state, city, specialization, emergency } = filters;
    let url = `${API_BASE_URL}/admin/hospitals?page=${page}&limit=${limit}`;

    if (status) url += `&status=${status}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (state) url += `&state=${encodeURIComponent(state)}`;
    if (city) url += `&city=${encodeURIComponent(city)}`;
    if (specialization) url += `&specialization=${encodeURIComponent(specialization)}`;
    if (emergency) url += `&emergency=true`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async getHospitalStats() {
    const response = await fetch(`${API_BASE_URL}/admin/hospitals/stats`, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async getAdminHospitalDetails(id) {
    const response = await fetch(`${API_BASE_URL}/admin/hospitals/${id}`, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async approveHospital(hospitalId) {
    const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}/approve`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async rejectHospital(hospitalId, reason) {
    const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}/reject`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason })
    })

    return this.handleResponse(response)
  }

  async updateHospitalStatus(hospitalId, status, reason) {
    const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, reason })
    })

    return this.handleResponse(response)
  }

  // Donors
  async getDonors(page = 1, limit = 10) {
    const response = await fetch(`${API_BASE_URL}/admin/donors?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async getDonorAnalytics() {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/donors`, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  // Requests
  async getRequests(page = 1, limit = 10) {
    const response = await fetch(`${API_BASE_URL}/admin/requests?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  // Transplants
  async getTransplants(page = 1, limit = 10) {
    const response = await fetch(`${API_BASE_URL}/admin/transplants?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  // Analytics
  async getHospitalPerformance() {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/hospital-performance`, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  // Audit
  async getAuditLogs() {
    const response = await fetch(`${API_BASE_URL}/admin/audit`, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async getSystemReports() {
    const response = await fetch(`${API_BASE_URL}/admin/reports/system`, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  // Settings
  async getSettings() {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  async updateSettings(settings) {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    })
    return this.handleResponse(response)
  }

  // Public Hospital Discovery
  async getPublicHospitals(filters = {}) {
    const { search, state, specialization } = filters;
    let url = `${API_BASE_URL}/hospitals?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (state) url += `state=${encodeURIComponent(state)}&`;
    if (specialization) url += `specialization=${encodeURIComponent(specialization)}`;

    const response = await fetch(url);
    return this.handleResponse(response)
  }

  async getPublicHospitalById(id) {
    const response = await fetch(`${API_BASE_URL}/hospitals/${id}`);
    return this.handleResponse(response)
  }

  // Get approved hospitals (for hospital listing)
  async getApprovedHospitals() {
    const response = await fetch(`${API_BASE_URL}/hospitals?status=approved`);
    return this.handleResponse(response)
  }

  // Get hospital by ID
  async getHospitalById(id) {
    const response = await fetch(`${API_BASE_URL}/hospitals/${id}`);
    return this.handleResponse(response)
  }

  // Logout
  logout() {
    this.setToken(null)
  }
}

export default new ApiService()