import React, { useState } from 'react'
import './AuthForm.css'

const AuthForm = ({
  selectedRole,
  authMode,
  onAuthModeChange,
  onSubmit,
  statusMessage,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    hospitalName: '',
    licenseNumber: '',
    secretKey: '',
    bloodType: '',
    isDonor: false
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const isLogin = authMode === 'login'

  return (
    <>
      {/* Auth Mode Toggle */}
      <div className="auth-toggle" role="tablist" aria-label="Authentication type">
        <button
          type="button"
          className={`auth-toggle-btn ${isLogin ? 'active' : ''}`}
          data-action="login"
          role="tab"
          aria-selected={isLogin}
          onClick={() => onAuthModeChange('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={`auth-toggle-btn ${!isLogin ? 'active' : ''}`}
          data-action="register"
          role="tab"
          aria-selected={!isLogin}
          onClick={() => onAuthModeChange('register')}
        >
          Register
        </button>
        <div
          className="toggle-indicator"
          aria-hidden="true"
          style={{
            left: isLogin ? '4px' : '50%'
          }}
        ></div>
      </div>

      {/* Status Messages */}
      {statusMessage.text && (
        <div
          className={`status-message visible ${statusMessage.type}`}
          role="alert"
          aria-live="polite"
        >
          {statusMessage.text}
        </div>
      )}

      {/* Authentication Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Email Field */}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            required
            autoComplete="username"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        {/* Password Field */}
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            required
            minLength="8"
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>

        {/* Registration Fields */}
        {!isLogin && (
          <div className="registration-fields">
            {/* Full Name */}
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                autoComplete="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            {/* User Specific Fields */}
            {selectedRole === 'user' && (
              <div className="user-fields">
                <div className="input-group">
                  <label htmlFor="bloodType">Blood Type (Optional)</label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="checkbox-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="isDonor"
                      checked={formData.isDonor}
                      onChange={(e) => setFormData({ ...formData, isDonor: e.target.checked })}
                    />
                    <span>Register as an Organ Donor</span>
                  </label>
                </div>
              </div>
            )}

            {/* Hospital Specific Fields */}
            {selectedRole === 'hospital' && (
              <div className="hospital-fields">
                <div className="input-group">
                  <label htmlFor="hospitalName">Hospital Name</label>
                  <input
                    type="text"
                    id="hospitalName"
                    name="hospitalName"
                    placeholder="Enter hospital name"
                    value={formData.hospitalName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="licenseNumber">License Number</label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    placeholder="Enter license number"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* Admin Secret Key - Only for Registration */}
            {selectedRole === 'admin' && (
              <div className="input-group">
                <label htmlFor="secretKey">Secret Key</label>
                <input
                  type="password"
                  id="secretKey"
                  name="secretKey"
                  placeholder="Enter admin secret key"
                  value={formData.secretKey}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        {isLogin && (
          <div className="form-actions">
            <button type="button" className="forgot-password">
              Forgot Password?
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="auth-btn" disabled={isLoading}>
          <span>{isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
          <div className="btn-glow" aria-hidden="true"></div>
        </button>
      </form>

      {/* Footer */}
      <div className="card-footer">
        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="text-button"
            onClick={() => onAuthModeChange(isLogin ? 'register' : 'login')}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </>
  )
}

export default AuthForm