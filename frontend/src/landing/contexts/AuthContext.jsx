<<<<<<< HEAD
import React, { useState, createContext, useContext, useEffect } from 'react';
import apiService from '../../services/api';

const AuthContext = createContext();

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
          setUser({ ...data.data, role: 'user' });
          localStorage.setItem('userToken', data.token);
        } else {
          throw new Error(data.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
=======
import React, { useState, createContext, useContext } from 'react';

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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState(initialDonors);

  const login = async (email, password, role) => {
    setLoading(true);
    setTimeout(() => {
      setUser({ email, role, name: email.split('@')[0] });
      setLoading(false);
    }, 1000);
>>>>>>> ec10091 (Implemented Admin Dashboard UI enhancements)
  };

  const register = async (userData) => {
    setLoading(true);
<<<<<<< HEAD
    try {
      // userData keys depend on what AuthForm provides.
      // We map them to backend expectations.
      const apiData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        // checks for donor registration
        bloodType: userData.bloodType,
        isDonor: userData.role === 'donor' || userData.isDonor
      };

      const data = await apiService.userRegister(apiData);
      if (data.success) {
        setUser({ ...data.data, role: 'user' });
        localStorage.setItem('userToken', data.token);
        // We do NOT add to 'donors' list here locally. Data must come from DB.
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
=======
    setTimeout(() => {
      setUser({ ...userData });
      
      // If registering as a donor, add to donors list
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
    }, 1000);
>>>>>>> ec10091 (Implemented Admin Dashboard UI enhancements)
  };

  const logout = () => {
    setUser(null);
<<<<<<< HEAD
    localStorage.removeItem('userToken');
    // Also clear other roles if merged?
    localStorage.removeItem('token'); // Hospital
    localStorage.removeItem('adminToken'); // Admin
    localStorage.removeItem('hospital');
  };

  const deleteDonor = (id) => {
    // Placeholder to prevent crash, but strictly unauthorized for random users
    console.warn("deleteDonor in AuthContext Recrecated");
=======
  };

  const deleteDonor = (id) => {
    setDonors(prev => prev.filter(donor => donor.id !== id));
>>>>>>> ec10091 (Implemented Admin Dashboard UI enhancements)
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, donors, deleteDonor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
