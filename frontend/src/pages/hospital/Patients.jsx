import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    User,
    Activity,
    Stethoscope,
    FileText,
    Calendar,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Heart,
    Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Patients.css';

const Patients = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [requests, setRequests] = useState([]);
    const [transplants, setTransplants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [bloodFilter, setBloodFilter] = useState('');
    const [showEligibilityModal, setShowEligibilityModal] = useState(false);
    const [eligibilityCheck, setEligibilityCheck] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        bloodType: 'A+',
        medicalCondition: '',
        medicalHistory: '',
        allergies: '',
        currentMedications: '',
        emergencyContact: '',
        emergencyPhone: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [requestsRes, transplantsRes] = await Promise.all([
                fetch('http://localhost:5000/api/hospital/requests', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:5000/api/hospital/transplants', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const requestsData = await requestsRes.json();
            const transplantsData = await transplantsRes.json();

            if (requestsData.success) setRequests(requestsData.data);
            if (transplantsData.success) setTransplants(transplantsData.data);

            // Build virtual patient registry from requests and transplants
            const patientMap = new Map();
            
            requestsData.data?.forEach(req => {
                const key = `${req.patient.name}-${req.patient.bloodType}`;
                if (!patientMap.has(key)) {
                    patientMap.set(key, {
                        id: key,
                        name: req.patient.name,
                        age: req.patient.age,
                        bloodType: req.patient.bloodType,
                        medicalCondition: req.patient.medicalCondition,
                        requests: [],
                        transplants: [],
                        medicalHistory: [],
                        lastSeen: req.createdAt
                    });
                }
                patientMap.get(key).requests.push(req);
                if (new Date(req.createdAt) > new Date(patientMap.get(key).lastSeen)) {
                    patientMap.get(key).lastSeen = req.createdAt;
                }
            });

            transplantsData.data?.forEach(tx => {
                const recipientName = tx.request?.patient?.name || tx.recipient?.name;
                const recipientBlood = tx.request?.patient?.bloodType || tx.recipient?.bloodType;
                if (recipientName) {
                    const key = `${recipientName}-${recipientBlood}`;
                    if (!patientMap.has(key)) {
                        patientMap.set(key, {
                            id: key,
                            name: recipientName,
                            age: tx.request?.patient?.age || tx.recipient?.age,
                            bloodType: recipientBlood,
                            medicalCondition: '',
                            requests: [],
                            transplants: [],
                            medicalHistory: [],
                            lastSeen: tx.createdAt
                        });
                    }
                    patientMap.get(key).transplants.push(tx);
                    if (new Date(tx.createdAt) > new Date(patientMap.get(key).lastSeen)) {
                        patientMap.get(key).lastSeen = tx.createdAt;
                    }
                }
            });

            setPatients(Array.from(patientMap.values()));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkEligibility = (patientData) => {
        const issues = [];
        if (!patientData.name || !patientData.age || !patientData.bloodType) {
            issues.push('Missing required patient information');
        }
        if (!patientData.medicalCondition) {
            issues.push('Medical condition not specified');
        }
        if (parseInt(patientData.age) < 18 || parseInt(patientData.age) > 80) {
            issues.push('Age may be outside typical transplant range');
        }
        return {
            eligible: issues.length === 0,
            issues
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const eligibility = checkEligibility(formData);
        if (!eligibility.eligible) {
            setEligibilityCheck(eligibility);
            setShowEligibilityModal(true);
            return;
        }

        // Create organ request with patient data
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/hospital/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patient: {
                        name: formData.name,
                        age: parseInt(formData.age),
                        bloodType: formData.bloodType,
                        medicalCondition: formData.medicalCondition,
                        urgencyLevel: 'medium'
                    },
                    organType: 'kidney', // Default, can be enhanced
                    notes: `Medical History: ${formData.medicalHistory || 'N/A'}\nAllergies: ${formData.allergies || 'None'}\nCurrent Medications: ${formData.currentMedications || 'None'}`
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('Patient registered and request created successfully!');
                fetchData();
                setShowModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error registering patient:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', age: '', bloodType: 'A+', medicalCondition: '',
            medicalHistory: '', allergies: '', currentMedications: '',
            emergencyContact: '', emergencyPhone: ''
        });
        setSelectedPatient(null);
    };

    const filteredPatients = patients.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBlood = bloodFilter ? p.bloodType === bloodFilter : true;
        return matchesSearch && matchesBlood;
    });

    if (loading) return <div className="loading-state">Loading patients...</div>;

    return (
        <div className="patients-page">
            <div className="page-header">
                <div>
                    <h2>Patient Registry</h2>
                    <p className="text-gray-500">Manage patient records and medical history</p>
                </div>
                <button className="primary-btn" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={20} />
                    Register Patient
                </button>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search patients..."
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
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                        <option key={bt} value={bt}>{bt}</option>
                    ))}
                </select>
            </div>

            <div className="patients-grid">
                {filteredPatients.length === 0 ? (
                    <div className="empty-state">No patients found. Register a patient to begin.</div>
                ) : (
                    filteredPatients.map(patient => (
                        <motion.div
                            key={patient.id}
                            className="patient-card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelectedPatient(patient)}
                        >
                            <div className="patient-card-header">
                                <div className="patient-avatar">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3>{patient.name}</h3>
                                    <div className="patient-meta">
                                        <span>{patient.age} yrs</span>
                                        <span>•</span>
                                        <span className="blood-type">{patient.bloodType}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="patient-card-body">
                                {patient.medicalCondition && (
                                    <p className="medical-condition">
                                        <AlertCircle size={14} />
                                        {patient.medicalCondition}
                                    </p>
                                )}
                                <div className="patient-stats">
                                    <div className="stat-item">
                                        <Activity size={16} />
                                        <span>{patient.requests.length} Request(s)</span>
                                    </div>
                                    <div className="stat-item">
                                        <Stethoscope size={16} />
                                        <span>{patient.transplants.length} Transplant(s)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="patient-card-footer">
                                <button
                                    className="view-details-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPatient(patient);
                                    }}
                                >
                                    <Eye size={16} />
                                    View Details
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Patient Registration Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <motion.div
                        className="modal-content patient-modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Register New Patient</h2>
                            <button onClick={() => setShowModal(false)}>
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <h3>Basic Information</h3>
                                <div className="form-row">
                                    <input
                                        placeholder="Full Name *"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Age *"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <select
                                        value={formData.bloodType}
                                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                        required
                                    >
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                                            <option key={bt} value={bt}>{bt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Medical Information</h3>
                                <input
                                    className="full-width"
                                    placeholder="Medical Condition *"
                                    value={formData.medicalCondition}
                                    onChange={(e) => setFormData({ ...formData, medicalCondition: e.target.value })}
                                    required
                                />
                                <textarea
                                    className="full-width mt-2"
                                    placeholder="Medical History"
                                    value={formData.medicalHistory}
                                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                                    rows={3}
                                />
                                <div className="form-row mt-2">
                                    <input
                                        placeholder="Allergies"
                                        value={formData.allergies}
                                        onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                    />
                                    <input
                                        placeholder="Current Medications"
                                        value={formData.currentMedications}
                                        onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Emergency Contact</h3>
                                <div className="form-row">
                                    <input
                                        placeholder="Contact Name"
                                        value={formData.emergencyContact}
                                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                    />
                                    <input
                                        placeholder="Phone"
                                        value={formData.emergencyPhone}
                                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    Register & Create Request
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Patient Details Modal */}
            {selectedPatient && !showModal && (
                <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
                    <motion.div
                        className="modal-content patient-details-modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Patient Details: {selectedPatient.name}</h2>
                            <button onClick={() => setSelectedPatient(null)}>
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="patient-details-content">
                            <div className="details-section">
                                <h3>Basic Information</h3>
                                <div className="details-grid">
                                    <div>
                                        <span className="detail-label">Age</span>
                                        <span className="detail-value">{selectedPatient.age} years</span>
                                    </div>
                                    <div>
                                        <span className="detail-label">Blood Type</span>
                                        <span className="detail-value">{selectedPatient.bloodType}</span>
                                    </div>
                                    <div>
                                        <span className="detail-label">Medical Condition</span>
                                        <span className="detail-value">{selectedPatient.medicalCondition || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="details-section">
                                <h3>Medical History Timeline</h3>
                                <div className="timeline-container">
                                    {selectedPatient.requests.map((req, idx) => (
                                        <div key={idx} className="timeline-item">
                                            <div className="timeline-marker">
                                                <Activity size={16} />
                                            </div>
                                            <div className="timeline-content">
                                                <h4>Organ Request: {req.organType}</h4>
                                                <p>Status: {req.status} • Urgency: {req.patient.urgencyLevel}</p>
                                                <span className="timeline-date">
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedPatient.transplants.map((tx, idx) => (
                                        <div key={idx} className="timeline-item">
                                            <div className="timeline-marker">
                                                <Stethoscope size={16} />
                                            </div>
                                            <div className="timeline-content">
                                                <h4>Transplant: {tx.organType}</h4>
                                                <p>Status: {tx.status} • Outcome: {tx.outcome?.success ? 'Successful' : 'Pending'}</p>
                                                <span className="timeline-date">
                                                    {new Date(tx.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="details-section">
                                <h3>Linked Requests & Transplants</h3>
                                <div className="linked-items">
                                    {selectedPatient.requests.length > 0 && (
                                        <div>
                                            <h4>Requests ({selectedPatient.requests.length})</h4>
                                            {selectedPatient.requests.map(req => (
                                                <div key={req._id} className="linked-item" onClick={() => navigate('/hospital/requests')}>
                                                    <span>{req.requestId}</span>
                                                    <span className="status-badge">{req.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedPatient.transplants.length > 0 && (
                                        <div>
                                            <h4>Transplants ({selectedPatient.transplants.length})</h4>
                                            {selectedPatient.transplants.map(tx => (
                                                <div key={tx._id} className="linked-item" onClick={() => navigate('/hospital/transplants')}>
                                                    <span>{tx.transplantId}</span>
                                                    <span className="status-badge">{tx.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Eligibility Check Modal */}
            {showEligibilityModal && eligibilityCheck && (
                <div className="modal-overlay" onClick={() => setShowEligibilityModal(false)}>
                    <motion.div
                        className="modal-content"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Eligibility Check</h2>
                            <button onClick={() => setShowEligibilityModal(false)}>
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="eligibility-content">
                            {eligibilityCheck.eligible ? (
                                <div className="eligibility-success">
                                    <CheckCircle size={48} />
                                    <h3>Patient is Eligible</h3>
                                    <p>All eligibility requirements are met. You can proceed with registration.</p>
                                </div>
                            ) : (
                                <div className="eligibility-issues">
                                    <AlertCircle size={48} />
                                    <h3>Eligibility Issues Found</h3>
                                    <ul>
                                        {eligibilityCheck.issues.map((issue, idx) => (
                                            <li key={idx}>{issue}</li>
                                        ))}
                                    </ul>
                                    <p className="eligibility-note">Please address these issues before proceeding.</p>
                                </div>
                            )}
                            <div className="modal-footer">
                                <button
                                    className="cancel-btn"
                                    onClick={() => setShowEligibilityModal(false)}
                                >
                                    {eligibilityCheck.eligible ? 'Cancel' : 'Fix Issues'}
                                </button>
                                {eligibilityCheck.eligible && (
                                    <button
                                        className="submit-btn"
                                        onClick={() => {
                                            setShowEligibilityModal(false);
                                            handleSubmit({ preventDefault: () => {} });
                                        }}
                                    >
                                        Proceed with Registration
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Patients;

