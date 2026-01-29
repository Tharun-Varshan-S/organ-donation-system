const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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
        const adminToken = localStorage.getItem('adminToken');
        const hospitalToken = localStorage.getItem('hospitalToken');
        const donorToken = localStorage.getItem('donorToken') || localStorage.getItem('userToken') || localStorage.getItem('token');

        let token = adminToken;
        if (type === 'hospital') token = hospitalToken;
        if (type === 'donor' || type === 'user') token = donorToken;

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

    // Hospital Core Features
    async getHospitalStats() {
        const response = await fetch(`${API_BASE_URL}/hospital/stats`, {
            headers: this.getAuthHeaders('hospital')
        })
        return this.handleResponse(response)
    }

    async getHospitalDonors() {
        const response = await fetch(`${API_BASE_URL}/hospital/donors`, {
            headers: this.getAuthHeaders('hospital')
        })
        return this.handleResponse(response)
    }

    async createHospitalDonor(donorData) {
        const response = await fetch(`${API_BASE_URL}/hospital/donors`, {
            method: 'POST',
            headers: this.getAuthHeaders('hospital'),
            body: JSON.stringify(donorData)
        })
        return this.handleResponse(response)
    }

    async updateHospitalDonor(id, donorData) {
        const response = await fetch(`${API_BASE_URL}/hospital/donors/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders('hospital'),
            body: JSON.stringify(donorData)
        })
        return this.handleResponse(response)
    }

    async deleteHospitalDonor(id) {
        const response = await fetch(`${API_BASE_URL}/hospital/donors/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders('hospital')
        })
        return this.handleResponse(response)
    }

    async getHospitalRequests() {
        const response = await fetch(`${API_BASE_URL}/hospital/requests`, {
            headers: this.getAuthHeaders('hospital')
        })
        return this.handleResponse(response)
    }

    async createHospitalRequest(requestData) {
        const response = await fetch(`${API_BASE_URL}/hospital/requests`, {
            method: 'POST',
            headers: this.getAuthHeaders('hospital'),
            body: JSON.stringify(requestData)
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

    async getHospitalAnalytics(period = '30') {
        const response = await fetch(`${API_BASE_URL}/hospital/analytics?period=${period}`, {
            headers: this.getAuthHeaders('hospital')
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

    async validateEligibility(id) {
        const response = await fetch(`${API_BASE_URL}/hospital/requests/${id}/validate-eligibility`, {
            method: 'PUT',
            headers: this.getAuthHeaders('hospital')
        })
        return this.handleResponse(response)
    }

    async giveConsent(id) {
        const response = await fetch(`${API_BASE_URL}/hospital/requests/${id}/give-consent`, {
            method: 'PUT',
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

    async getDonorTimeline(id) {
        const response = await fetch(`${API_BASE_URL}/hospital/donors/${id}/timeline`, {
            headers: this.getAuthHeaders('hospital')
        })
        return this.handleResponse(response)
    }

    async getPublicDonors(filters = {}) {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE_URL}/hospital/donors/discovery?${params}`, {
            headers: this.getAuthHeaders('hospital')
        })
        return this.handleResponse(response)
    }

    async validatePatient(patientData) {
        const response = await fetch(`${API_BASE_URL}/hospital/patients/validate`, {
            method: 'POST',
            headers: this.getAuthHeaders('hospital'),
            body: JSON.stringify(patientData)
        })
        return this.handleResponse(response)
    }

    async getPotentialMatches(requestId) {
        const response = await fetch(`${API_BASE_URL}/hospital/requests/${requestId}/potential-matches`, {
            headers: this.getAuthHeaders('hospital')
        })
        return this.handleResponse(response)
    }

    async selectDonor(requestId, donorId, donorSource, action = 'approve', reason = '') {
        const response = await fetch(`${API_BASE_URL}/hospital/requests/${requestId}/select-donor`, {
            method: 'POST',
            headers: this.getAuthHeaders('hospital'),
            body: JSON.stringify({ donorId, donorSource, action, reason })
        })
        return this.handleResponse(response)
    }

    async createTransplantRecord(data) {
        const response = await fetch(`${API_BASE_URL}/hospital/transplants/operation`, {
            method: 'POST',
            headers: this.getAuthHeaders('hospital'),
            body: JSON.stringify(data)
        })
        return this.handleResponse(response)
    }

    // Doctor Management
    async getDoctors() {
        const response = await fetch(`${API_BASE_URL}/hospital/doctors`, {
            headers: this.getAuthHeaders('hospital')
        })
        return this.handleResponse(response)
    }

    async addDoctor(doctorData) {
        const response = await fetch(`${API_BASE_URL}/hospital/doctors`, {
            method: 'POST',
            headers: this.getAuthHeaders('hospital'),
            body: JSON.stringify(doctorData)
        })
        return this.handleResponse(response)
    }

    async updateDoctor(id, doctorData) {
        const response = await fetch(`${API_BASE_URL}/hospital/doctors/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders('hospital'),
            body: JSON.stringify(doctorData)
        })
        return this.handleResponse(response)
    }

    async removeDoctor(id) {
        const response = await fetch(`${API_BASE_URL}/hospital/doctors/${id}`, {
            method: 'DELETE',
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
            localStorage.setItem('userToken', data.token)
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
            localStorage.setItem('userToken', data.token)
        }

        return data
    }

    // Dashboard Stats (Admin)
    async getDashboardStats() {
        const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
            headers: this.getAuthHeaders('admin')
        })

        return this.handleResponse(response)
    }

    // Hospital Management (Admin)
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

    // Donors (Admin)
    async getDonors(page = 1, limit = 10) {
        const response = await fetch(`${API_BASE_URL}/admin/donors?page=${page}&limit=${limit}`, {
            headers: this.getAuthHeaders('admin')
        })

        return this.handleResponse(response)
    }

    // User/Donor Actions
    async getUserProfile() {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            headers: this.getAuthHeaders('user')
        })
        return this.handleResponse(response)
    }

    async updateUserProfile(data) {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: this.getAuthHeaders('user'),
            body: JSON.stringify(data)
        })
        return this.handleResponse(response)
    }

    async getUserHistory() {
        const response = await fetch(`${API_BASE_URL}/users/history`, {
            headers: this.getAuthHeaders('user')
        })
        return this.handleResponse(response)
    }

    // Requests (Admin)
    async getRequests(page = 1, limit = 10) {
        const response = await fetch(`${API_BASE_URL}/admin/requests?page=${page}&limit=${limit}`, {
            headers: this.getAuthHeaders('admin')
        })

        return this.handleResponse(response)
    }

    // Transplants (Admin)
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
