import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    User,
    Stethoscope,
    TrendingUp,
    XCircle,
    Edit,
    Trash2,
    Award,
    Activity,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import './Doctors.css';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [transplants, setTransplants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        specialization: '',
        licenseNumber: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        fetchTransplants();
    }, []);

    const fetchTransplants = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/hospital/transplants', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setTransplants(data.data);
                buildDoctorRegistry(data.data);
            }
        } catch (error) {
            console.error('Error fetching transplants:', error);
        } finally {
            setLoading(false);
        }
    };

    const buildDoctorRegistry = (transplantData) => {
        const doctorMap = new Map();

        transplantData.forEach(tx => {
            const surgeonName = tx.surgeryDetails?.surgeonName;
            if (!surgeonName) return;

            if (!doctorMap.has(surgeonName)) {
                doctorMap.set(surgeonName, {
                    name: surgeonName,
                    specialization: inferSpecialization(tx.organType),
                    surgeries: [],
                    successfulSurgeries: 0,
                    totalSurgeries: 0,
                    successRate: 0
                });
            }

            const doctor = doctorMap.get(surgeonName);
            doctor.surgeries.push(tx);
            doctor.totalSurgeries++;
            if (tx.outcome?.success === true) {
                doctor.successfulSurgeries++;
            }
        });

        // Calculate success rates
        doctorMap.forEach(doctor => {
            doctor.successRate = doctor.totalSurgeries > 0
                ? Math.round((doctor.successfulSurgeries / doctor.totalSurgeries) * 100)
                : 0;
        });

        setDoctors(Array.from(doctorMap.values()).sort((a, b) => b.totalSurgeries - a.totalSurgeries));
    };

    const inferSpecialization = (organType) => {
        const specializationMap = {
            'heart': 'Cardiac Transplant',
            'kidney': 'Renal Transplant',
            'liver': 'Hepatic Transplant',
            'lung': 'Pulmonary Transplant',
            'pancreas': 'Pancreatic Transplant',
            'cornea': 'Corneal Transplant'
        };
        return specializationMap[organType] || 'General Transplant';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Since we don't have a dedicated doctor API, we'll just update the local state
        // In a real system, this would create/update a doctor record
        if (selectedDoctor) {
            // Update existing doctor
            setDoctors(doctors.map(d => d.name === selectedDoctor.name ? { ...d, ...formData } : d));
        } else {
            // Add new doctor (will appear when assigned to a transplant)
            alert('Doctor will be added when assigned to a transplant. Please assign this doctor in the Transplants section.');
        }
        setShowModal(false);
        resetForm();
    };

    const handleRemove = (doctorName) => {
        if (window.confirm(`Remove ${doctorName}? This will anonymize their records in transplants.`)) {
            // Anonymize doctor in transplants
            transplants.forEach(async tx => {
                if (tx.surgeryDetails?.surgeonName === doctorName) {
                    try {
                        const token = localStorage.getItem('token');
                        await fetch(`http://localhost:5000/api/hospital/transplants/${tx._id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                surgeryDetails: {
                                    ...tx.surgeryDetails,
                                    surgeonName: null
                                }
                            })
                        });
                    } catch (error) {
                        console.error('Error anonymizing doctor:', error);
                    }
                }
            });
            fetchTransplants();
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', specialization: '', licenseNumber: '', phone: '', email: ''
        });
        setSelectedDoctor(null);
    };

    const filteredDoctors = doctors.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading-state">Loading doctors...</div>;

    return (
        <div className="doctors-page">
            <div className="page-header">
                <div>
                    <h2>Doctor Management</h2>
                    <p className="text-gray-500">Manage surgeon profiles and track performance</p>
                </div>
                <button className="primary-btn" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={20} />
                    Add Doctor
                </button>
            </div>

            <div className="search-section">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search doctors by name or specialization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="doctors-grid">
                {filteredDoctors.length === 0 ? (
                    <div className="empty-state">
                        {doctors.length === 0
                            ? 'No doctors found. Doctors will appear when assigned to transplants.'
                            : 'No doctors match your search.'}
                    </div>
                ) : (
                    filteredDoctors.map((doctor, index) => (
                        <motion.div
                            key={index}
                            className="doctor-card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="doctor-card-header">
                                <div className="doctor-avatar">
                                    <Stethoscope size={24} />
                                </div>
                                <div className="doctor-info">
                                    <h3>{doctor.name}</h3>
                                    <p className="doctor-specialization">{doctor.specialization}</p>
                                </div>
                                {doctor.successRate >= 90 && (
                                    <div className="excellence-badge">
                                        <Award size={16} />
                                    </div>
                                )}
                            </div>

                            <div className="doctor-stats">
                                <div className="stat-card">
                                    <div className="stat-icon success">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <div className="stat-value">{doctor.successRate}%</div>
                                        <div className="stat-label">Success Rate</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon primary">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <div className="stat-value">{doctor.totalSurgeries}</div>
                                        <div className="stat-label">Total Surgeries</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon success">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <div className="stat-value">{doctor.successfulSurgeries}</div>
                                        <div className="stat-label">Successful</div>
                                    </div>
                                </div>
                            </div>

                            <div className="doctor-card-footer">
                                <button
                                    className="action-btn edit-btn"
                                    onClick={() => {
                                        setSelectedDoctor(doctor);
                                        setFormData({
                                            name: doctor.name,
                                            specialization: doctor.specialization,
                                            licenseNumber: '',
                                            phone: '',
                                            email: ''
                                        });
                                        setShowModal(true);
                                    }}
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <button
                                    className="action-btn remove-btn"
                                    onClick={() => handleRemove(doctor.name)}
                                >
                                    <Trash2 size={16} />
                                    Remove
                                </button>
                            </div>

                            {doctor.surgeries.length > 0 && (
                                <div className="doctor-recent-surgeries">
                                    <h4>Recent Surgeries</h4>
                                    <div className="surgeries-list">
                                        {doctor.surgeries.slice(0, 3).map((surgery, idx) => (
                                            <div key={idx} className="surgery-item">
                                                <span className="surgery-organ">{surgery.organType}</span>
                                                <span className={`surgery-status ${surgery.status}`}>
                                                    {surgery.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* Doctor Form Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <motion.div
                        className="modal-content doctor-modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>{selectedDoctor ? 'Edit Doctor' : 'Add Doctor'}</h2>
                            <button onClick={() => setShowModal(false)}>
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <h3>Basic Information</h3>
                                <input
                                    className="full-width"
                                    placeholder="Doctor Name *"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <input
                                    className="full-width mt-2"
                                    placeholder="Specialization *"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-section">
                                <h3>Contact Information</h3>
                                <div className="form-row">
                                    <input
                                        placeholder="License Number"
                                        value={formData.licenseNumber}
                                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                    />
                                    <input
                                        placeholder="Phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <input
                                    className="full-width mt-2"
                                    type="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    {selectedDoctor ? 'Update' : 'Add'} Doctor
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Doctor Details Modal */}
            {selectedDoctor && !showModal && (
                <div className="modal-overlay" onClick={() => setSelectedDoctor(null)}>
                    <motion.div
                        className="modal-content doctor-details-modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Doctor Profile: {selectedDoctor.name}</h2>
                            <button onClick={() => setSelectedDoctor(null)}>
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="doctor-details-content">
                            <div className="details-section">
                                <h3>Performance Metrics</h3>
                                <div className="metrics-grid">
                                    <div className="metric-item">
                                        <span className="metric-label">Success Rate</span>
                                        <span className={`metric-value ${selectedDoctor.successRate >= 90 ? 'excellent' : selectedDoctor.successRate >= 75 ? 'good' : 'needs-improvement'}`}>
                                            {selectedDoctor.successRate}%
                                        </span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-label">Total Surgeries</span>
                                        <span className="metric-value">{selectedDoctor.totalSurgeries}</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-label">Successful</span>
                                        <span className="metric-value success">{selectedDoctor.successfulSurgeries}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="details-section">
                                <h3>All Surgeries</h3>
                                <div className="surgeries-table">
                                    {selectedDoctor.surgeries.map((surgery, idx) => (
                                        <div key={idx} className="surgery-row">
                                            <div>
                                                <span className="surgery-id">{surgery.transplantId}</span>
                                                <span className="surgery-organ">{surgery.organType}</span>
                                            </div>
                                            <div>
                                                <span className={`status-badge ${surgery.status}`}>
                                                    {surgery.status}
                                                </span>
                                                {surgery.outcome?.success !== null && (
                                                    <span className={`outcome-badge ${surgery.outcome.success ? 'success' : 'failed'}`}>
                                                        {surgery.outcome.success ? 'Success' : 'Failed'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Doctors;

