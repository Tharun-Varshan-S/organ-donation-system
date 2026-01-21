const API_BASE_URL = 'http://localhost:5000/api'

class ApiService {
    constructor() {
        this.adminToken = localStorage.getItem('adminToken')
        this.hospitalToken = localStorage.getItem('hospitalToken')
        this.donorToken = localStorage.getItem('donorToken')
    }

    // Set auth token
    setAdminToken(token) {
        this.adminToken = token
        if (token) {
            localStorage.setItem('adminToken', token)
        } else {
            localStorage.removeItem('adminToken')
        }
    }

    setHospitalToken(token) {
        this.hospitalToken = token
        if (token) {
            localStorage.setItem('hospitalToken', token)
        } else {
            localStorage.removeItem('hospitalToken')
        }
    }

    setDonorToken(token) {
        this.donorToken = token
        if (token) {
            localStorage.setItem('donorToken', token)
        } else {
            localStorage.removeItem('donorToken')
        }
    }

    // Get auth headers
    getAuthHeaders(type = 'admin') {
        let token = this.adminToken;
        if (type === 'hospital') token = this.hospitalToken;
        if (type === 'donor') token = this.donorToken;

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
    async adminLogin(email, password, secretKey) {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, secretKey })
        })

        const data = await this.handleResponse(response)

        if (data.success && data.data && data.data.token) {
            this.setAdminToken(data.data.token)
        }

        return data
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

    // Dashboard Stats
    async getDashboardStats() {
        const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
            headers: this.getAuthHeaders('admin')
        })

        return this.handleResponse(response)
    }

    // Hospital Management
    async getHospitals(page = 1, limit = 10, status = '') {
        const url = new URL(`${API_BASE_URL}/admin/hospitals`);
        url.searchParams.append('page', page);
        url.searchParams.append('limit', limit);
        if (status) url.searchParams.append('status', status);

        const response = await fetch(url.toString(), {
            headers: this.getAuthHeaders('admin')
        })

        return this.handleResponse(response)
    }

    async updateHospitalStatus(hospitalId, status) {
        const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}/status`, {
            method: 'PUT',
            headers: this.getAuthHeaders('admin'),
            body: JSON.stringify({ status })
        })

        return this.handleResponse(response)
    }

    async approveHospital(hospitalId) {
        const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}/approve`, {
            method: 'PUT',
            headers: this.getAuthHeaders('admin')
        })

        return this.handleResponse(response)
    }

    // Donors
    async getDonors(page = 1, limit = 10) {
        const response = await fetch(`${API_BASE_URL}/admin/donors?page=${page}&limit=${limit}`, {
            headers: this.getAuthHeaders('admin')
        })

        return this.handleResponse(response)
    }

    // Requests
    async getRequests(page = 1, limit = 10) {
        const response = await fetch(`${API_BASE_URL}/admin/requests?page=${page}&limit=${limit}`, {
            headers: this.getAuthHeaders('admin')
        })

        return this.handleResponse(response)
    }

    // Transplants
    async getTransplants(page = 1, limit = 10) {
        const response = await fetch(`${API_BASE_URL}/admin/transplants?page=${page}&limit=${limit}`, {
            headers: this.getAuthHeaders('admin')
        })

        return this.handleResponse(response)
    }

    // Logout
    logout() {
        this.setAdminToken(null)
        this.setHospitalToken(null)
        this.setDonorToken(null)
    }
}

export default new ApiService()
