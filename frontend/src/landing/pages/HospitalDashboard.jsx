import React, { useState, useEffect } from 'react';
import { Users, Activity, Filter, Heart, Search, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import Card from '../components/Card';
import DonorLogCard from '../components/DonorLogCard';
import HospitalCard from '../../components/HospitalCard';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import apiService from '../../services/api';
import { MOCK_HOSPITALS } from '../../utils/mockHospitals';

const HospitalDashboard = () => {
  const { user, logout, donors, deleteDonor } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrgan, setFilterOrgan] = useState('all');
  const [filterBlood, setFilterBlood] = useState('all');
  const [editingDonor, setEditingDonor] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [hospitals, setHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('hospitals'); // 'hospitals' or 'donors'

  const filteredDonors = donors
    .filter(d => filterOrgan === 'all' || d.organ.toLowerCase() === filterOrgan.toLowerCase())
    .filter(d => filterBlood === 'all' || d.bloodType === filterBlood)
    .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Fetch approved hospitals on mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setHospitalsLoading(true);
        const data = await apiService.getApprovedHospitals();
        setHospitals(data.hospitals || []);
      } catch (err) {
        console.warn('API not available, using mock hospitals for testing:', err.message);
        // Use mock data for testing when API is not available
        setHospitals(MOCK_HOSPITALS);
      } finally {
        setHospitalsLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  // Filter hospitals by search term and specialization
  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         h.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         h.location?.state?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = filterOrgan === 'all' || 
                                  (h.specializations?.some(s => s.toLowerCase().includes(filterOrgan.toLowerCase())));
    
    return matchesSearch && matchesSpecialization;
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D4E8E8] via-[#A2BFC6] to-[#798E93]">
      <AnimatedBackground />
      <Navbar user={user} onLogout={logout} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-[#2C3E44] mb-8 text-center">Hospital & Donor Management</h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'hospitals'
                ? 'bg-red-600 text-white'
                : 'bg-white text-[#2C3E44] hover:bg-gray-100'
            }`}
          >
            🏥 Hospitals
          </button>
          <button
            onClick={() => setActiveTab('donors')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'donors'
                ? 'bg-red-600 text-white'
                : 'bg-white text-[#2C3E44] hover:bg-gray-100'
            }`}
          >
            👥 Donor Log
          </button>
        </div>

        {/* HOSPITALS TAB */}
        {activeTab === 'hospitals' && (
          <>
            {/* Search and Filter Section */}
            <Card className="mb-8">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#798E93] w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by hospital name, city, or state..."
                      className="w-full bg-white/50 border border-[#798E93]/30 rounded-lg pl-10 pr-4 py-3 text-[#2C3E44] placeholder-[#798E93] focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
                <Select
                  label="Filter by Specialization"
                  value={filterOrgan}
                  onChange={(e) => setFilterOrgan(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Specializations' },
                    { value: 'kidney', label: 'Kidney Transplant' },
                    { value: 'liver', label: 'Liver Transplant' },
                    { value: 'heart', label: 'Heart Transplant' },
                    { value: 'lung', label: 'Lung Transplant' },
                    { value: 'pancreas', label: 'Pancreas Transplant' },
                    { value: 'emergency', label: 'Emergency Services' }
                  ]}
                />
              </div>
            </Card>

            {/* Hospitals Grid */}
            {hospitalsLoading ? (
              <Card className="text-center py-12">
                <p className="text-[#556B73] text-lg">Loading approved hospitals...</p>
              </Card>
            ) : filteredHospitals.length > 0 ? (
              <>
                <p className="text-[#556B73] mb-4 font-medium">
                  Showing {filteredHospitals.length} approved hospital(s)
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHospitals.map(hospital => (
                    <HospitalCard key={hospital._id} hospital={hospital} />
                  ))}
                </div>
              </>
            ) : (
              <Card className="text-center py-12">
                <p className="text-[#556B73] text-lg">No approved hospitals found matching your criteria.</p>
                <p className="text-[#798E93] mt-2">Try adjusting your search or filters.</p>
              </Card>
            )}
          </>
        )}

        {/* DONORS TAB */}
        {activeTab === 'donors' && (
          <>
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
                  options={[
                    { value: 'all', label: 'All Organs' },
                    { value: 'kidney', label: 'Kidney' },
                    { value: 'liver', label: 'Liver' },
                    { value: 'heart', label: 'Heart' },
                    { value: 'lung', label: 'Lung' },
                    { value: 'pancreas', label: 'Pancreas' },
                    { value: 'small bowel', label: 'Small Bowel' }
                  ]}
                />
                <Select
                  label="Filter by Blood Type"
                  value={filterBlood}
                  onChange={(e) => setFilterBlood(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Blood Types' },
                    { value: 'A+', label: 'A+' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'AB-', label: 'AB-' },
                    { value: 'O+', label: 'O+' },
                    { value: 'O-', label: 'O-' }
                  ]}
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
          </>
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
