import React, { useState, useEffect } from 'react'
import VideoBackground from './VideoBackground'
import RoleTabs from './RoleTabs'
import AuthForm from './AuthForm'
import './AuthPage.css'

const AuthPage = () => {
  // State management
  const [selectedRole, setSelectedRole] = useState('user')
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' })
  const [isLoading, setIsLoading] = useState(false)

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

      if (selectedRole === 'hospital' && (!formData.hospitalName || !formData.licenseNumber)) {
        setStatusMessage({ 
          text: 'Hospital name and license number are required', 
          type: 'error' 
        })
        setIsLoading(false)
        return
      }

      if (selectedRole === 'admin' && !formData.secretKey) {
        setStatusMessage({ 
          text: 'Admin secret key is required', 
          type: 'error' 
        })
        setIsLoading(false)
        return
      }
    }

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock success response
      const action = authMode === 'login' ? 'Login' : 'Registration'
      setStatusMessage({ 
        text: `${action} successful for ${selectedRole}!`, 
        type: 'success' 
      })
      
      // Log form data for demo purposes
      console.log('Form submitted:', { 
        ...formData, 
        role: selectedRole, 
        action: authMode 
      })
      
    } catch (error) {
      setStatusMessage({ 
        text: 'An error occurred. Please try again.', 
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