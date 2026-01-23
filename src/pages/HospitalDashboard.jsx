import React, { useState, useEffect } from 'react';
import { Users, Activity, Filter, Heart, Search, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import Card from '../components/Card';
import DonorLogCard from '../components/DonorLogCard';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';

const HospitalDashboard = () => {
  const { user, logout, donors, deleteDonor, showApprovalMessage, setShowApprovalMessage } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrgan, setFilterOrgan] = useState('all');
  const [filterBlood, setFilterBlood] = useState('all');
  const [editingDonor, setEditingDonor] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const filteredDonors = donors
    .filter(d => filterOrgan === 'all' || d.organ.toLowerCase() === filterOrgan.toLowerCase())
    .filter(d => filterBlood === 'all' || d.bloodType === filterBlood)
    .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleEdit = (donor) => {
    setEditingDonor(donor);
    setEditFormData({
      name: donor.name,
      address: donor.address,
      organ: donor.organ,
      age: donor.age,
      hospital: donor.hospital,
      bloodType: donor.bloodType,
      phone: donor.phone
    });
  };

  const handleSaveEdit = () => {
    // In a real app, you'd update the donor in the database
    // For now, we'll just close the modal
    setEditingDonor(null);
    setEditFormData({});
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this donor?')) {
      deleteDonor(id);
    }
  };

  const organOptions = [
    { value: 'all', label: 'All Organs' },
    { value: 'kidney', label: 'Kidney' },
    { value: 'liver', label: 'Liver' },
    { value: 'heart', label: 'Heart' },
    { value: 'lung', label: 'Lung' },
    { value: 'pancreas', label: 'Pancreas' },
    { value: 'small bowel', label: 'Small Bowel' }
  ];

  const bloodTypeOptions = [
    { value: 'all', label: 'All Blood Types' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  // Check hospital approval status
  const hospitalStatus = user?.status || 'PENDING';
  const isApproved = hospitalStatus === 'APPROVED';
  const isRejected = hospitalStatus === 'REJECTED';

  // Show approval message if just approved
  useEffect(() => {
    if (showApprovalMessage && isApproved) {
      const timer = setTimeout(() => {
        setShowApprovalMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showApprovalMessage, isApproved, setShowApprovalMessage]);

  // If rejected, show rejection message
  if (isRejected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#D4E8E8] via-[#A2BFC6] to-[#798E93]">
        <AnimatedBackground />
        <Navbar user={user} onLogout={logout} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center">
            <XCircle className="w-20 h-20 text-red-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-[#2C3E44] mb-4">Registration Rejected</h1>
            <p className="text-lg text-[#556B73] mb-6">
              Your hospital registration has been rejected by the administrator.
            </p>
            <p className="text-[#798E93] mb-8">
              Please contact support if you believe this is an error.
            </p>
            <Button variant="primary" onClick={logout}>
              Return to Home
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // If pending, show pending message
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#D4E8E8] via-[#A2BFC6] to-[#798E93]">
        <AnimatedBackground />
        <Navbar user={user} onLogout={logout} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center">
            <Clock className="w-20 h-20 text-yellow-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-[#2C3E44] mb-4">Registration Under Review</h1>
            <p className="text-lg text-[#556B73] mb-6">
              Your registration is under review. Please wait for admin approval.
            </p>
            <p className="text-[#798E93] mb-8">
              You will be notified once your registration has been approved. This usually takes 24-48 hours.
            </p>
            <Button variant="primary" onClick={logout}>
              Logout
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D4E8E8] via-[#A2BFC6] to-[#798E93]">
      <AnimatedBackground />
      <Navbar user={user} onLogout={logout} />

      {/* Approval Success Message */}
      {showApprovalMessage && (
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Card className="bg-green-50 border-green-500 border-2 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-bold text-green-800">Registration Approved!</h3>
                  <p className="text-green-700">
                    Your registration has been approved by the admin. You now have access to all features.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApprovalMessage(false)}
                className="text-green-700 hover:text-green-900 font-bold text-xl"
              >
                ×
              </button>
            </div>
          </Card>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-[#2C3E44] mb-8 text-center">Donor Log</h1>

        {/* Search and Filter Section */}
        <Card className="mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#798E93] w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full bg-white/50 border border-[#798E93]/30 rounded-lg pl-10 pr-4 py-3 text-[#2C3E44] placeholder-[#798E93] focus:outline-none focus:border-red-600"
                />
              </div>
            </div>
            <Select
              label="Filter by Organ"
              value={filterOrgan}
              onChange={(e) => setFilterOrgan(e.target.value)}
              options={organOptions}
            />
            <Select
              label="Filter by Blood Type"
              value={filterBlood}
              onChange={(e) => setFilterBlood(e.target.value)}
              options={bloodTypeOptions}
            />
          </div>
        </Card>

        {/* Donor Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.map(donor => (
            <DonorLogCard
              key={donor.id}
              donor={donor}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {filteredDonors.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-[#556B73] text-lg">No donors found matching your criteria.</p>
          </Card>
        )}
      </div>

      {/* Edit Modal */}
      {editingDonor && (
        <Modal isOpen={true} onClose={() => setEditingDonor(null)} title="Edit Donor" size="md">
          <div className="space-y-4">
            <Input
              label="Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            />
            <Input
              label="Address"
              value={editFormData.address}
              onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
            />
            <Select
              label="Organ"
              value={editFormData.organ}
              onChange={(e) => setEditFormData({ ...editFormData, organ: e.target.value })}
              options={organOptions.filter(opt => opt.value !== 'all')}
            />
            <Input
              label="Age"
              type="number"
              value={editFormData.age}
              onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
            />
            <Input
              label="Hospital"
              value={editFormData.hospital}
              onChange={(e) => setEditFormData({ ...editFormData, hospital: e.target.value })}
            />
            <Select
              label="Blood Type"
              value={editFormData.bloodType}
              onChange={(e) => setEditFormData({ ...editFormData, bloodType: e.target.value })}
              options={bloodTypeOptions.filter(opt => opt.value !== 'all')}
            />
            <Input
              label="Phone"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
            />
            <div className="flex space-x-4 mt-6">
              <Button variant="primary" onClick={handleSaveEdit} className="flex-1">
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => setEditingDonor(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Footer />
    </div>
  );
};

export default HospitalDashboard;
