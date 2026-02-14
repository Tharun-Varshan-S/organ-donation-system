import React, { useState } from 'react';
import { Heart, LogOut, Menu, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import Button from './Button';

const Navbar = ({ showPortalButton = false, user, onLogout }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleLoginClick = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/mission', label: 'Our Mission' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact Us' },
  ];

  return (
    <nav className="relative z-50 bg-[#2C3E44]/80 backdrop-blur-lg border-b border-[#556B73]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center space-x-2 focus:outline-none shrink-0"
          >
            <Heart className="w-8 h-8 text-red-600" />
            <span className="text-white text-xl font-bold">LifeBridge</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `transition font-medium text-sm lg:text-base ${isActive ? 'text-red-400 border-b-2 border-red-400' : 'text-white hover:text-red-400'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user && <span className="text-white text-sm">Welcome, {user.name}</span>}
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

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-red-400 focus:outline-none p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#2C3E44] border-b border-[#556B73]/30 animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium transition ${isActive ? 'bg-red-600/20 text-red-400' : 'text-white hover:bg-[#556B73]/20 hover:text-red-400'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-4 border-t border-[#556B73]/30">
              {user && (
                <div className="px-3 py-2 text-white text-sm mb-2">
                  Welcome, {user.name}
                </div>
              )}
              {showPortalButton ? (
                <button
                  onClick={handleLoginClick}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 transition"
                >
                  Login
                </button>
              ) : (
                user && (
                  <button
                    onClick={() => { onLogout(); setIsMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-red-600/20 transition flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
