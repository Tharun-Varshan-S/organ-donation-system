import React from 'react';
import { Heart, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import Button from './Button';

const Navbar = ({ showPortalButton = false, user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <nav className="relative z-10 bg-[#2C3E44]/80 backdrop-blur-lg border-b border-[#556B73]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <Heart className="w-8 h-8 text-red-600" />
            <span className="text-white text-xl font-bold">LifeBridge</span>
          </button>
          <div className="hidden md:flex space-x-8">
            <NavLink
              to="/mission"
              className={({ isActive }) =>
                `transition font-medium ${isActive ? 'text-red-400' : 'text-white hover:text-red-600'}`
              }
            >
              Our Mission
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `transition font-medium ${isActive ? 'text-red-400' : 'text-white hover:text-red-600'}`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `transition font-medium ${isActive ? 'text-red-400' : 'text-white hover:text-red-600'}`
              }
            >
              Contact
            </NavLink>
          </div>
          <div className="flex items-center space-x-4">
            {user && <span className="text-white">Welcome, {user.name}</span>}
            {showPortalButton ? (
              <Button
                variant="primary"
                onClick={handleLoginClick}
                className="px-6 py-2"
              >
                Login
              </Button>
            ) : (
              user && (
                <Button
                  variant="primary"
                  onClick={onLogout}
                  className="px-4 py-2 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;