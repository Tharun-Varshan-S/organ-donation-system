import React from 'react';
import { Users, Heart, Building2, Activity, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import Card from '../components/Card';
import Button from '../components/Button';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Donor', status: 'Active' },
    { id: 2, name: 'City Hospital', email: 'contact@cityhospital.com', role: 'Hospital', status: 'Active' },
    { id: 3, name: 'Jane Smith', email: 'jane@example.com', role: 'Donor', status: 'Pending' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D4E8E8] via-[#A2BFC6] to-[#798E93]">
      <AnimatedBackground />
      <Navbar user={user} onLogout={logout} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Users', value: '1,234', icon: Users, color: '[#556B73]' },
            { label: 'Active Donors', value: '856', icon: Heart, color: 'red-600' },
            { label: 'Hospitals', value: '45', icon: Building2, color: '[#798E93]' },
            { label: 'Matches', value: '342', icon: Activity, color: 'red-600' }
          ].map((stat, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#798E93] text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#2C3E44] mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`w-12 h-12 text-${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#2C3E44]">User Management</h2>
            <Button variant="primary" className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add User</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/40 border-b border-[#798E93]/30">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Actions'].map(header => (
                    <th key={header} className="px-6 py-4 text-left text-[#2C3E44] font-semibold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-[#798E93]/20 hover:bg-white/40 transition">
                    <td className="px-6 py-4 text-[#2C3E44] font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-[#556B73]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-[#556B73]/20 text-[#2C3E44] px-3 py-1 rounded-full text-sm font-semibold">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.status === 'Active' ? 'bg-green-600/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'
                        }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="bg-[#556B73] hover:bg-[#2C3E44] text-white p-2 rounded-lg transition shadow">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition shadow">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
