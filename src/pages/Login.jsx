import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('donor');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password, role);
    if (success) {
      if (role === 'donor') navigate('/donor-dashboard');
      else if (role === 'hospital') navigate('/hospital-dashboard');
      else if (role === 'admin') navigate('/admin-dashboard');
    }
  };

  const handleBack = () => {
    navigate('/');
  }

  const roleOptions = [
    { value: 'donor', label: 'Donor' },
    { value: 'hospital', label: 'Hospital' },
    { value: 'admin', label: 'Admin' }
  ];

  return (
    <Modal isOpen={true} onClose={handleBack} title="Welcome Back" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={roleOptions}
        />
        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="primary" disabled={loading} className="w-full">
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <p className="text-[#556B73] text-center mt-6">
        Don't have an account?{' '}
        <button
          onClick={() => navigate('/register')}
          className="text-red-600 hover:text-red-700 font-semibold"
        >
          Register
        </button>
      </p>
    </Modal>
  );
};

export default Login;
