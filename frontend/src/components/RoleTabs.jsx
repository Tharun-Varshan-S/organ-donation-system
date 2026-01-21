import React from 'react'
import './RoleTabs.css'

const RoleTabs = ({ selectedRole, onRoleChange }) => {
  const roles = [
    { key: 'user', label: 'User' },
    { key: 'hospital', label: 'Hospital' },
    { key: 'admin', label: 'Admin' }
  ]

  const handleRoleClick = (roleKey, index) => {
    onRoleChange(roleKey, index)
  }

  return (
    <nav className="role-selector" aria-label="Select account type">
      {roles.map((role, index) => (
        <button
          key={role.key}
          type="button"
          className={`role-tab ${selectedRole === role.key ? 'active' : ''}`}
          data-role={role.key}
          aria-selected={selectedRole === role.key}
          onClick={() => handleRoleClick(role.key, index)}
        >
          {role.label}
        </button>
      ))}
      <div 
        className="role-indicator" 
        aria-hidden="true"
        style={{
          width: `${100 / roles.length}%`,
          left: `${roles.findIndex(r => r.key === selectedRole) * (100 / roles.length)}%`
        }}
      ></div>
    </nav>
  )
}

export default RoleTabs