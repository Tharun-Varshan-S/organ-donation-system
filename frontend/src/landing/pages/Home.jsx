import React, { useState } from 'react';
import { Heart, Users, Activity, Building2, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import Button from '../components/Button';
import Card from '../components/Card';
import Login from './Login';
import DonorDashboard from './DonorDashboard';
import HospitalDashboard from './HospitalDashboard';
import AdminDashboard from './AdminDashboard';

const Home = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  if (user) {
    if (user.role === 'donor') return <DonorDashboard />;
    if (user.role === 'hospital') return <HospitalDashboard />;
    if (user.role === 'admin') return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D4E8E8] via-[#A2BFC6] to-[#798E93] relative">
      <AnimatedBackground />

      <Navbar showPortalButton onPortalClick={() => setCurrentPage('login')} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Hero Card */}
        <div className="relative bg-white/40 backdrop-blur-md rounded-3xl border border-[#798E93]/30 p-12 md:p-16 shadow-2xl mb-16 overflow-hidden">
          {/* Hero background image (use your organ-donation image here) */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/organ-hero.jpg"
              alt="Organ donation - hands holding a heart and stethoscope"
              className="w-full h-full object-cover opacity-40"
            />
          </div>

          <div className="relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-black mb-4 drop-shadow-sm">
              Life-Saving
            </h1>
            <h1 className="text-5xl md:text-7xl font-bold text-red-600 mb-8 drop-shadow-sm">
              Organ Donation
            </h1>
            <p className="text-xl md:text-2xl text-black mb-12 max-w-3xl mx-auto font-normal drop-shadow-sm">
              Connecting donors with recipients to save lives through a seamless, transparent platform
            </p>

            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-6 drop-shadow-sm">Total Pledger Count</h2>
              <div className="flex justify-center items-center space-x-3 flex-wrap gap-y-3">
                {['4', '6', '9', '0', '2', '1'].map((digit, index) => (
                  <div
                    key={index}
                    className="bg-white text-black text-4xl md:text-5xl font-bold px-6 py-4 rounded-xl shadow-lg border border-[#798E93]/20"
                    style={{ minWidth: '70px', textAlign: 'center' }}
                  >
                    {digit}
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="white"
              onClick={() => setCurrentPage('login')}
              className="text-lg px-8 py-4 rounded-full inline-flex items-center space-x-2"
            >
              <span className="font-bold">JOIN AS DONOR</span>
              <Heart className="w-5 h-5 text-red-600" />
            </Button>
          </div>
        </div>

        {/* Organ and Tissue Donation Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2C3E44] mb-4">
              ORGAN AND TISSUE DONATION
            </h2>
            <p className="text-lg text-[#556B73] max-w-4xl mx-auto">
              Organ donation is a process to implant of an organ from a living being or a cadaver to another living being to replace the lost function of one's organs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl border-2 border-dashed border-[#798E93]/40 p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-red-600/50 active:scale-95 cursor-pointer group">
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-[#798E93]/50 flex items-center justify-center bg-white/50 group-hover:border-red-600/50 transition-colors">
                  <Heart className="w-16 h-16 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#2C3E44] mb-4 text-center">
                WHAT IS ORGAN AND TISSUE DONATION?
              </h3>
              <p className="text-[#556B73] text-center leading-relaxed">
                Organ donation means that a person during his life time pledges that after his/her death, organs from his/her body can be donated to save lives.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-lg rounded-3xl border-2 border-dashed border-[#798E93]/40 p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-red-600/50 active:scale-95 cursor-pointer group">
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-[#798E93]/50 flex items-center justify-center bg-white/50 group-hover:border-red-600/50 transition-colors">
                  <Activity className="w-16 h-16 text-[#556B73]" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#2C3E44] mb-4 text-center">
                WHAT IS TRANSPLANTATION?
              </h3>
              <p className="text-[#556B73] text-center leading-relaxed">
                Transplantation of human cells, tissues or organs saves many lives and restores essential functions where no alternatives exist.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-lg rounded-3xl border-2 border-dashed border-[#798E93]/40 p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-red-600/50 active:scale-95 cursor-pointer group">
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-[#798E93]/50 flex items-center justify-center bg-white/50 group-hover:border-red-600/50 transition-colors">
                  <Users className="w-16 h-16 text-[#798E93]" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#2C3E44] mb-4 text-center">
                WHO CAN DONATE?
              </h3>
              <p className="text-[#556B73] text-center leading-relaxed">
                Any person not less than 18 years of age, who voluntarily authorizes the removal of any of his organ and/or tissue can become a donor.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <Card hover className="hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 hover:border-red-600/50 group">
            <Users className="w-12 h-12 text-red-600 mb-4 transition-transform duration-300 group-hover:scale-110" />
            <h3 className="text-xl font-bold text-[#2C3E44] mb-2">Register as Donor</h3>
            <p className="text-[#556B73]">Join thousands of donors making a difference</p>
          </Card>
          <Card hover className="hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 hover:border-[#556B73] group">
            <Building2 className="w-12 h-12 text-[#556B73] mb-4 transition-transform duration-300 group-hover:scale-110" />
            <h3 className="text-xl font-bold text-[#2C3E44] mb-2">Hospital Network</h3>
            <p className="text-[#556B73]">Access verified donor database instantly</p>
          </Card>
          <Card hover className="hover:bg-gradient-to-br hover:from-slate-50 hover:to-gray-50 hover:border-[#798E93] group">
            <Shield className="w-12 h-12 text-[#798E93] mb-4 transition-transform duration-300 group-hover:scale-110" />
            <h3 className="text-xl font-bold text-[#2C3E44] mb-2">Secure Platform</h3>
            <p className="text-[#556B73]">HIPAA compliant with end-to-end encryption</p>
          </Card>
        </div>
      </div>

      <Footer />

      {currentPage === 'login' && <Login onBack={() => setCurrentPage('home')} />}
    </div>
  );
};

export default Home;
