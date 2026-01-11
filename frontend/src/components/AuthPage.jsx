import React, { useState, useEffect } from 'react'
import VideoBackground from './VideoBackground'
import RoleTabs from './RoleTabs'
import AuthForm from './AuthForm'
import AdminDashboard from './AdminDashboard'
import apiService from '../services/api'
import './AuthPage.css'

const AuthPage = () => {
  // State management
  const [selectedRole, setSelectedRole] = useState('user')
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)

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

    // Allow all roles to authenticate
    // Restriction removed to enable hospital and user authentication

    // Additional validation for registration
    if (authMode === 'register') {
      if (!formData.name) {
        setStatusMessage({
          text: 'Full name is required for registration',
          type: 'error'
        })
        setIsLoading(false)
        return
      }

      if (!formData.secretKey) {
        setStatusMessage({
          text: 'Admin secret key is required for registration',
          type: 'error'
        })
        setIsLoading(false)
        return
      }
    }

    // Call backend API based on selected role
    try {
      let response

      if (selectedRole === 'admin') {
        // Admin authentication
        if (authMode === 'login') {
          response = await apiService.adminLogin(formData.email, formData.password)
        } else {
          response = await apiService.adminRegister(formData.email, formData.password, formData.name, formData.secretKey)
        }
      } else if (selectedRole === 'hospital') {
        // Hospital authentication
        if (authMode === 'login') {
          response = await apiService.hospitalLogin(formData.email, formData.password)
        } else {
          // For hospital registration, pass the entire formData
          response = await apiService.hospitalRegister({
            name: formData.hospitalName || formData.name,
            email: formData.email,
            password: formData.password,
            licenseNumber: formData.licenseNumber,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          })
        }
      } else {
        // User authentication (placeholder for future implementation)
        setStatusMessage({
          text: 'User authentication coming soon',
          type: 'error'
        })
        setIsLoading(false)
        return
      }

      if (response.success) {
        if (authMode === 'login') {
          if (selectedRole === 'admin') {
            setIsAdminLoggedIn(true)
            setStatusMessage({
              text: 'Login successful! Redirecting to Admin Dashboard...',
              type: 'success'
            })
          } else if (selectedRole === 'hospital') {
            setStatusMessage({
              text: 'Login successful! Welcome to Hospital Portal...',
              type: 'success'
            })
            // TODO: Redirect to hospital dashboard
          }
        } else {
          setStatusMessage({
            text: response.message || 'Registration successful! You can now login.',
            type: 'success'
          })
          setAuthMode('login')
        }
      }

    } catch (error) {
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