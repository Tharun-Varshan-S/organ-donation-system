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
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
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

  // Dashboard Stats
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: this.getAuthHeaders()
    })
    
    return this.handleResponse(response)
  }

  // Hospital Management
  async getHospitals(page = 1, limit = 10) {
    const response = await fetch(`${API_BASE_URL}/admin/hospitals?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    })
    
    return this.handleResponse(response)
  }

  async updateHospitalStatus(hospitalId, status) {
    const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
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

  // Logout
  logout() {
    this.setToken(null)
  }
}

export default new ApiService()