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
  };

  const register = async (userData) => {
    setLoading(true);
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
  };

  const logout = () => {
    setUser(null);
  };

  const deleteDonor = (id) => {
    setDonors(prev => prev.filter(donor => donor.id !== id));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, donors, deleteDonor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
