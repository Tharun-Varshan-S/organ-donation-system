import React, { useState, createContext, useContext, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

// Initial fake donor data
const initialDonors = [
  {
    id: 1,
    name: 'Yashraj Kaflay',
    address: 'Bangalore',
    organ: 'Liver',
    age: 18,
    hospital: "St. Mary's",
    bloodType: 'AB+',
    phone: '+91 98765 43210',
    email: 'yashraj@example.com'
  },
  {
    id: 2,
    name: 'Frances Norman',
    address: 'Abidjan',
    organ: 'Small Bowel',
    age: 61,
    hospital: 'Riverview Medical Center',
    bloodType: 'O+',
    phone: '+225 1234 5678',
    email: 'frances@example.com'
  },
  {
    id: 3,
    name: 'Rory Carpenter',
    address: 'Amroha',
    organ: 'Pancreas',
    age: 16,
    hospital: 'White Mountain',
    bloodType: 'B+',
    phone: '+91 87654 32109',
    email: 'rory@example.com'
  }
];

// Load data from localStorage on initialization
const loadFromStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

// Save data to localStorage
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => loadFromStorage('user', null));
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState(() => loadFromStorage('donors', initialDonors));
  const [hospitals, setHospitals] = useState(() => loadFromStorage('hospitals', []));
  const [showApprovalMessage, setShowApprovalMessage] = useState(false);

  // Persist user to localStorage when it changes
  useEffect(() => {
    if (user) {
      saveToStorage('user', user);
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Persist donors to localStorage when it changes
  useEffect(() => {
    saveToStorage('donors', donors);
  }, [donors]);

  // Persist hospitals to localStorage when it changes (only for mock/fallback)
  useEffect(() => {
    saveToStorage('hospitals', hospitals);
  }, [hospitals]);

  // Fetch hospitals if admin
  useEffect(() => {
    const fetchHospitals = async () => {
      if (user?.role === 'admin') {
        try {
          const response = await apiService.getHospitals(1, 100);
          if (response.success) {
            // Transform backend hospital (status: 'approved') to frontend expected (status: 'APPROVED')
            const transformed = response.data.hospitals.map(h => ({
              id: h._id,
              name: h.name,
              email: h.email,
              phone: h.contactInfo?.phone,
              address: h.location?.address,
              status: h.status.toUpperCase(),
              registeredAt: h.createdAt,
              approvedAt: h.approvedAt
            }));
            setHospitals(transformed);
          }
        } catch (error) {
          console.error('Error fetching hospitals:', error);
        }
      }
    };
    fetchHospitals();
  }, [user]);

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      let response;
      if (role === 'admin') {
        const secretKey = 'HEALTHCARE_ADMIN_2024_SECRET';
        response = await apiService.adminLogin(email, password, secretKey);
        if (response.success) {
          const userData = {
            email: response.data.admin.email,
            role: 'admin',
            name: response.data.admin.name,
            id: response.data.admin.id
          };
          setUser(userData);
          setLoading(false);
          return true;
        }
      } else if (role === 'hospital') {
        try {
          response = await apiService.hospitalLogin(email, password);
          if (response.success) {
            const userData = {
              email: response.hospital.email,
              role: 'hospital',
              name: response.hospital.name,
              status: response.hospital.status.toUpperCase(),
              id: response.hospital.id
            };
            setUser(userData);

            if (response.hospital.status === 'approved' && !localStorage.getItem(`approval_seen_${response.hospital.id}`)) {
              setShowApprovalMessage(true);
              localStorage.setItem(`approval_seen_${response.hospital.id}`, 'true');
            }

            setLoading(false);
            return true;
          }
        } catch (error) {
          if (error.message.toLowerCase().includes('pending')) {
            throw new Error("Your registration is under review. Please wait for admin approval.");
          }
          throw error;
        }
      }

      // Fallback or other roles (donor)
      if (role === 'donor') {
        setUser({ email, role, name: email.split('@')[0] });
        setLoading(false);
        return true;
      }

      setLoading(false);
      return false;
    } catch (error) {
      setLoading(false);
      alert(error.message);
      return false;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      if (userData.role === 'hospital') {
        const response = await apiService.hospitalRegister({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          licenseNumber: userData.licenseNumber || `LIC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          zipCode: userData.zipCode
        });

        if (response.success) {
          const newUser = {
            ...userData,
            status: 'PENDING',
            id: response.data.hospital.id
          };
          setUser(newUser);
          setLoading(false);
          return true;
        }
      } else {
        setUser({ ...userData });
        if (userData.role === 'donor' && userData.name && userData.bloodType && userData.organ) {
          const newDonor = {
            id: donors.length + 1,
            name: userData.name,
            address: userData.address || 'Not specified',
            organ: userData.organ,
            age: userData.age || 'N/A',
            hospital: userData.hospital || 'Not specified',
            bloodType: userData.bloodType,
            phone: userData.phone || 'Not provided',
            email: userData.email
          };
          setDonors(prev => [...prev, newDonor]);
        }
        setLoading(false);
        return true;
      }
    } catch (error) {
      setLoading(false);
      alert(error.message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    apiService.logout();
    setShowApprovalMessage(false);
  };

  const deleteDonor = (id) => {
    setDonors(prev => prev.filter(donor => donor.id !== id));
  };

  const approveHospital = async (hospitalId) => {
    try {
      const response = await apiService.approveHospital(hospitalId);
      if (response.success) {
        setHospitals(prev => prev.map(h =>
          h.id === hospitalId
            ? { ...h, status: 'APPROVED', approvedAt: new Date().toISOString() }
            : h
        ));
        return true;
      }
    } catch (error) {
      alert(error.message);
    }
    return false;
  };

  const rejectHospital = async (hospitalId) => {
    try {
      const response = await apiService.updateHospitalStatus(hospitalId, 'rejected');
      if (response.success) {
        setHospitals(prev => prev.map(h =>
          h.id === hospitalId
            ? { ...h, status: 'REJECTED' }
            : h
        ));
        return true;
      }
    } catch (error) {
      alert(error.message);
    }
    return false;
  };

  const getPendingHospitals = () => {
    return hospitals.filter(h => h.status === 'PENDING');
  };

  const getAllHospitals = () => {
    return hospitals;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      donors,
      deleteDonor,
      hospitals,
      approveHospital,
      rejectHospital,
      getPendingHospitals,
      getAllHospitals,
      showApprovalMessage,
      setShowApprovalMessage
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
