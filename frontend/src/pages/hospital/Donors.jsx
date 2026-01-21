import React, { useEffect, useState } from 'react';
import {
    Search,
    Plus,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    User,
    Droplet
} from 'lucide-react';
import { motion } from 'framer-motion';
import './Donors.css';

const Donors = () => {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [bloodFilter, setBloodFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentDonor, setCurrentDonor] = useState(null); // For Edit/View

    // Form State
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        dob: '', gender: 'male',
        bloodType: 'A+', weight: '', height: '',
        address: '', city: '', state: '', zipCode: '',
        organTypes: [], isLivingDonor: false
    });

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const organOptions = ['heart', 'kidney', 'liver', 'lung', 'pancreas', 'cornea'];

    useEffect(() => {
        fetchDonors();
    }, []);

    const fetchDonors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/hospital/donors', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setDonors(data.data);
            }
        } catch (error) {
            console.error('Error fetching donors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox' && name === 'organTypes') {
            let updatedOrgans = [...formData.organTypes];
            if (checked) {
                updatedOrgans.push(value);
            } else {
                updatedOrgans = updatedOrgans.filter(o => o !== value);
            }
            setFormData({ ...formData, organTypes: updatedOrgans });
        } else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                personalInfo: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    dateOfBirth: formData.dob,
                    gender: formData.gender
                },
                medicalInfo: {
                    bloodType: formData.bloodType,
                    weight: formData.weight,
                    height: formData.height
                },
                donationPreferences: {
                    organTypes: formData.organTypes,
                    isLivingDonor: formData.isLivingDonor
                },
                location: {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode
                }
            };

            const url = currentDonor
                ? `http://localhost:5000/api/hospital/donors/${currentDonor._id}`
                : 'http://localhost:5000/api/hospital/donors';

            const method = currentDonor ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.success) {
                fetchDonors();
                setShowModal(false);
                resetForm();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error saving donor:', error);
        }
    };

    const openEdit = (donor) => {
        setCurrentDonor(donor);
        setFormData({
            firstName: donor.personalInfo.firstName,
            lastName: donor.personalInfo.lastName,
            email: donor.personalInfo.email,
            phone: donor.personalInfo.phone || '',
            dob: donor.personalInfo.dateOfBirth ? donor.personalInfo.dateOfBirth.split('T')[0] : '',
            gender: donor.personalInfo.gender,
            bloodType: donor.medicalInfo.bloodType,
            weight: donor.medicalInfo.weight || '',
            height: donor.medicalInfo.height || '',
            address: donor.location.address || '',
            city: donor.location.city || '',
            state: donor.location.state || '',
            zipCode: donor.location.zipCode || '',
            organTypes: donor.donationPreferences.organTypes || [],
            isLivingDonor: donor.donationPreferences.isLivingDonor
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setCurrentDonor(null);
        setFormData({
            firstName: '', lastName: '', email: '', phone: '',
            dob: '', gender: 'male',
            bloodType: 'A+', weight: '', height: '',
            address: '', city: '', state: '', zipCode: '',
            organTypes: [], isLivingDonor: false
        });
    };

    const filteredDonors = donors.filter(donor => {
        const matchesSearch =
            donor.personalInfo.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donor.personalInfo.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBlood = bloodFilter ? donor.medicalInfo.bloodType === bloodFilter : true;
        return matchesSearch && matchesBlood;
    });

    return (
        <div className="donors-page">
            <div className="page-actions">
                <div className="search-filters">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search donors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="filter-select"
                        value={bloodFilter}
                        onChange={(e) => setBloodFilter(e.target.value)}
                    >
                        <option value="">All Blood Types</option>
                        {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                    </select>
                </div>
                <button className="primary-btn" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={20} />
                    Add Donor
                </button>
            </div>

            <div className="donors-grid">
                {loading ? (
                    <p>Loading donors...</p>
                ) : filteredDonors.length === 0 ? (
                    <div className="empty-state">No donors found</div>
                ) : (
                    filteredDonors.map(donor => (
                        <motion.div
                            key={donor._id}
                            className="donor-card"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="donor-card-header">
                                <div>
                                    <h3>{donor.personalInfo.firstName} {donor.personalInfo.lastName}</h3>
                                    <span className={`status-pill ${donor.status}`}>{donor.status}</span>
                                </div>
                                <div className="blood-badge">
                                    <Droplet size={14} fill="currentColor" />
                                    {donor.medicalInfo.bloodType}
                                </div>
                            </div>

                            <div className="donor-card-body">
                                <p><strong>Age:</strong> {new Date().getFullYear() - new Date(donor.personalInfo.dateOfBirth).getFullYear()} years</p>
                                <p><strong>Organs:</strong> {donor.donationPreferences.organTypes.join(', ')}</p>
                            </div>

                            <div className="donor-card-footer">
                                <button className="icon-btn" onClick={() => openEdit(donor)}>
                                    <Edit size={18} />
                                </button>
                                {/* Add Delete/Archive logic here if needed */}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <motion.div
                        className="modal-content"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <div className="modal-header">
                            <h2>{currentDonor ? 'Edit Donor' : 'Regsiter New Donor'}</h2>
                            <button onClick={() => setShowModal(false)}><Plus size={24} style={{ transform: 'rotate(45deg)' }} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="donor-form">
                            <div className="form-section">
                                <h3>Personal Info</h3>
                                <div className="form-row">
                                    <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} required />
                                    <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} required />
                                </div>
                                <div className="form-row">
                                    <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
                                    <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} />
                                </div>
                                <div className="form-row">
                                    <input name="dob" type="date" value={formData.dob} onChange={handleInputChange} required />
                                    <select name="gender" value={formData.gender} onChange={handleInputChange}>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Medical Info</h3>
                                <div className="form-row">
                                    <select name="bloodType" value={formData.bloodType} onChange={handleInputChange}>
                                        {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                                    </select>
                                    <input name="weight" type="number" placeholder="Weight (kg)" value={formData.weight} onChange={handleInputChange} />
                                    <input name="height" type="number" placeholder="Height (cm)" value={formData.height} onChange={handleInputChange} />
                                </div>
                                <div className="organs-checkboxes">
                                    <label>Organs Pledged:</label>
                                    <div className="checkbox-grid">
                                        {organOptions.map(organ => (
                                            <label key={organ}>
                                                <input
                                                    type="checkbox"
                                                    name="organTypes"
                                                    value={organ}
                                                    checked={formData.organTypes.includes(organ)}
                                                    onChange={handleInputChange}
                                                />
                                                {organ}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="submit-btn">{currentDonor ? 'Update' : 'Register'}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Donors;
