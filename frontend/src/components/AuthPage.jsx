import React, { useState, useEffect } from 'react'
import VideoBackground from './VideoBackground'
import RoleTabs from './RoleTabs'
import AuthForm from './AuthForm'
import AdminDashboard from './AdminDashboard'
import apiService from '../services/api'
import { useAuth } from '../landing/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './AuthPage.css'

const AuthPage = () => {
  // State management
  const [selectedRole, setSelectedRole] = useState('user')
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(!!localStorage.getItem('adminToken'))

  const { login, register } = useAuth()
  const navigate = useNavigate()

  // Handle role change with animation
  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey)
  }

  // Handle auth mode toggle
  const handleAuthModeChange = (mode) => {
    setAuthMode(mode)
    // Clear status message when switching modes
    setStatusMessage({ text: '', type: '' })
  }

  // Handle form submission
  const handleSubmit = async (formData) => {
    setIsLoading(true)
    setStatusMessage({ text: '', type: '' })

    // Basic validation
    if (!formData.email || !formData.password) {
      setStatusMessage({
        text: 'Please fill in all required fields',
        type: 'error'
      })
      setIsLoading(false)
      return
    }

    // Handle User Auth
    // Handle User Auth
    if (selectedRole === 'user') {
      try {
        if (authMode === 'login') {
          await login(formData.email, formData.password, 'user');
        } else {
          await register({ ...formData, role: 'user' });
        }

        setStatusMessage({
          text: (authMode === 'login' ? 'Login' : 'Registration') + ' successful! Redirecting...',
          type: 'success'
        });
        setTimeout(() => navigate('/'), 1000);
      } catch (e) {
        setStatusMessage({ text: e.message || 'Authentication failed', type: 'error' });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Call backend API
    try {
      let response

      if (selectedRole === 'admin') {
        if (authMode === 'login') {
          response = await apiService.adminLogin(formData.email, formData.password)
        } else {
          if (!formData.secretKey) throw new Error('Secret key required')
          response = await apiService.adminRegister(formData.email, formData.password, formData.name, formData.secretKey)
        }
      } else if (selectedRole === 'hospital') {
        if (authMode === 'login') {
          response = await apiService.hospitalLogin(formData.email, formData.password)
        } else {
          response = await apiService.hospitalRegister({
            name: formData.hospitalName,
            email: formData.email,
            password: formData.password,
            licenseNumber: formData.licenseNumber,
            phone: formData.name, // Placeholder contact
            // Defaults for required backend fields
            address: 'Pending Update',
            city: 'Pending',
            state: 'Pending'
          })
        }
      }

      if (response && response.success) {
        if (authMode === 'login') {
          if (selectedRole === 'admin') {
            setIsAdminLoggedIn(true)
            setStatusMessage({
              text: 'Login successful! Redirecting to Admin Dashboard...',
              type: 'success'
            })
          } else if (selectedRole === 'hospital') {
            // await login(...) // Context login might expect generic structure, but we have specific hospital handling
            // Manually store for HospitalLayout usage
            localStorage.setItem('token', response.token);
            localStorage.setItem('hospital', JSON.stringify(response.hospital));

            setStatusMessage({
              text: 'Login successful! Redirecting to Hospital Dashboard...',
              type: 'success'
            })
            setTimeout(() => navigate('/hospital/dashboard'), 1000)
          }
        } else {
          setStatusMessage({
            text: 'Registration successful! ' + (selectedRole === 'hospital' ? 'Please wait for admin approval.' : 'You can now login.'),
            type: 'success'
          })
          setAuthMode('login')
        }
      } else {
        if (response && !response.success) {
          throw new Error(response.message || 'Operation failed')
        }
      }

    } catch (error) {
      console.error(error)
      setStatusMessage({
        text: error.message || 'An error occurred. Please try again.',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-hide status messages
  useEffect(() => {
    if (statusMessage.text) {
      const timer = setTimeout(() => {
        setStatusMessage({ text: '', type: '' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [statusMessage])

  // Handle logout from admin dashboard
  const handleAdminLogout = () => {
    apiService.logout()
    setIsAdminLoggedIn(false)
    setSelectedRole('user')
    setAuthMode('login')
    setStatusMessage({ text: '', type: '' })
  }

  // If admin is logged in, show the dashboard
  if (isAdminLoggedIn) {
    return <AdminDashboard onLogout={handleAdminLogout} />
  }

  return (
    <>
      <VideoBackground />

      <main className="login-wrapper">
        <div className="login-card">
          {/* Role Selection */}
          <RoleTabs
            selectedRole={selectedRole}
            onRoleChange={handleRoleChange}
          />

          {/* Authentication Form */}
          <AuthForm
            selectedRole={selectedRole}
            authMode={authMode}
            onAuthModeChange={handleAuthModeChange}
            onSubmit={handleSubmit}
            statusMessage={statusMessage}
            isLoading={isLoading}
          />
        </div>
      </main>
    </>
  )
}

export default AuthPage