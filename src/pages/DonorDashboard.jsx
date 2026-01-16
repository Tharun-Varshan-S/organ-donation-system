import React, { useState } from 'react';
import { Users, Activity, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import Card from '../components/Card';
import Button from '../components/Button';

const DonorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D4E8E8] via-[#A2BFC6] to-[#798E93]">
      <AnimatedBackground />
      <Navbar user={user} onLogout={logout} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card>
              <div className="space-y-2">
                {[
                  { id: 'profile', icon: Users, label: 'My Profile' },
                  { id: 'status', icon: Activity, label: 'Donation Status' },
                  { id: 'settings', icon: Settings, label: 'Settings' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      activeTab === tab.id ? 'bg-red-600 text-white shadow-lg' : 'text-[#2C3E44] hover:bg-white/40'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <div className="md:col-span-3">
            {activeTab === 'profile' && (
              <Card>
                <h2 className="text-2xl font-bold text-[#2C3E44] mb-6">Donor Profile</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { label: 'Full Name', value: user.name },
                    { label: 'Email', value: user.email },
                    { label: 'Blood Type', value: user.bloodType || 'A+' },
                    { label: 'Organ', value: user.organ || 'Kidney' },
                    { label: 'Status', value: 'Active Donor', special: 'green' },
                    { label: 'Registration Date', value: 'Jan 5, 2026' }
                  ].map((field, index) => (
                    <div key={index}>
                      <label className="block text-[#556B73] mb-2 font-medium">{field.label}</label>
                      <div className={`${field.special === 'green' ? 'bg-green-600/20 border-green-600/50 text-green-700 font-semibold' : 'bg-white/40 border-[#798E93]/30 text-[#2C3E44]'} border rounded-lg px-4 py-3`}>
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'status' && (
              <Card>
                <h2 className="text-2xl font-bold text-[#2C3E44] mb-6">Donation Status</h2>
                <div className="bg-white/40 border border-[#798E93]/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#2C3E44]">Current Status</h3>
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow">Available</span>
                  </div>
                  <p className="text-[#556B73] mb-4">You are currently registered as an active organ donor. Your profile is visible to verified hospitals.</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-red-600">1</div>
                      <div className="text-sm text-[#798E93]">Profile Views</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#556B73]">0</div>
                      <div className="text-sm text-[#798E93]">Match Requests</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#2C3E44]">Active</div>
                      <div className="text-sm text-[#798E93]">Status</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'settings' && (
              <Card>
                <h2 className="text-2xl font-bold text-[#2C3E44] mb-6">Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[#2C3E44] font-semibold">Email Notifications</h3>
                      <p className="text-[#798E93] text-sm">Receive updates about your donation status</p>
                    </div>
                    <input type="checkbox" className="w-12 h-6" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[#2C3E44] font-semibold">Profile Visibility</h3>
                      <p className="text-[#798E93] text-sm">Allow hospitals to view your profile</p>
                    </div>
                    <input type="checkbox" className="w-12 h-6" defaultChecked />
                  </div>
                  <Button variant="primary">Save Changes</Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DonorDashboard;
