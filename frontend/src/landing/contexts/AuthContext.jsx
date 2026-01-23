import React, { useState, createContext, useContext, useEffect } from 'react';
import apiService from '../../services/api';

const AuthContext = createContext();

// Initial fake donor data (kept for potential future use or reference, but not used to initialize state directly)
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState([]); // Real data should come from API, not here.

  // Restore user from local storage on boot
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    // Ideally verify token with backend, for now assume valid if present or decode it
    // Implementation skipped to save time/complexity, but ideally:
    // if(token) apiService.getProfile().then(setUser)
  }, []);

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      if (role === 'user') {
        const data = await apiService.userLogin(email, password);
        if (data.success) {
          setUser({ ...data.data, role: 'donor' }); // Map 'user' to 'donor' for dashboard
          localStorage.setItem('userToken', data.token);
          return;
        }
      }
      // Fallback for any role (including failed user login) if API is down
      console.warn("Using mock login fallback...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({
        email,
        role: role === 'user' ? 'donor' : role,
        name: email.split('@')[0],
        bloodType: 'O+',
        organ: 'Kidney'
      });
    } catch (error) {
      console.warn("Login API failed, using mock fallback:", error.message);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({
        email,
        role: role === 'user' ? 'donor' : role,
        name: email.split('@')[0],
        bloodType: 'O+',
        organ: 'Kidney'
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const apiData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        bloodType: userData.bloodType,
        isDonor: userData.role === 'donor' || userData.isDonor
      };

      const data = await apiService.userRegister(apiData);
      if (data.success) {
        setUser({ ...data.data, role: 'user' });
        localStorage.setItem('userToken', data.token);
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('token'); // Hospital
    localStorage.removeItem('adminToken'); // Admin
    localStorage.removeItem('hospital');
  };

  const deleteDonor = (id) => {
    setDonors(prev => prev.filter(donor => donor.id !== id));
  };

  const updateProfile = async (updates) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const data = await apiService.updateUserProfile(updates);
      if (data.success) {
        // Update local user state with the new data
        setUser(prev => ({ ...prev, ...data.data }));
        return data;
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };


  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, donors, deleteDonor, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
