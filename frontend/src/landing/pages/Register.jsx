import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';

const Register = ({ onBack }) => {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    role: 'donor',
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    age: '',
    hospital: '',
    bloodType: '',
    organ: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    register(formData);
  };

  const roleOptions = [
    { value: 'donor', label: 'Donor' },
    { value: 'hospital', label: 'Hospital' }
  ];

  const bloodTypeOptions = [
    { value: '', label: 'Select' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  const organOptions = [
    { value: '', label: 'Select' },
    { value: 'kidney', label: 'Kidney' },
    { value: 'liver', label: 'Liver' },
    { value: 'heart', label: 'Heart' },
    { value: 'lung', label: 'Lung' },
    { value: 'pancreas', label: 'Pancreas' }
  ];

  return (
    <Modal isOpen={true} onClose={onBack} title="Create Account" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <Select
          label="Register as"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          options={roleOptions}
        />
        <Input
          label="Full Name"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
        {formData.role === 'donor' && (
          <>
            <Input
              label="Address"
              placeholder="City, State"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
            <Input
              label="Age"
              type="number"
              placeholder="18"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              required
            />
            <Input
              label="Hospital"
              placeholder="Hospital Name"
              value={formData.hospital}
              onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
              required
            />
            <Select
              label="Blood Type"
              value={formData.bloodType}
              onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
              options={bloodTypeOptions}
              required
            />
            <Select
              label="Organ to Donate"
              value={formData.organ}
              onChange={(e) => setFormData({ ...formData, organ: e.target.value })}
              options={organOptions}
              required
            />
          </>
        )}
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <Button type="submit" variant="primary" disabled={loading} className="w-full">
          {loading ? 'Creating Account...' : 'Register'}
        </Button>
      </form>
    </Modal>
  );
};

export default Register;
