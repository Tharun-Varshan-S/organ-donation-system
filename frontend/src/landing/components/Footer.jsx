import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative z-10 bg-[#2C3E44]/90 backdrop-blur-lg border-t border-[#556B73]/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-8 h-8 text-red-600" />
              <span className="text-white text-xl font-bold">LifeBridge</span>
            </div>
            <p className="text-gray-300 text-sm">
              Connecting donors with recipients to save lives through a seamless, transparent platform.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-red-600 transition text-sm">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-red-600 transition text-sm">How It Works</a></li>
              <li><a href="#" className="text-gray-300 hover:text-red-600 transition text-sm">Donor Stories</a></li>
              <li><a href="#" className="text-gray-300 hover:text-red-600 transition text-sm">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-red-600 transition text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-red-600 transition text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-red-600 transition text-sm">Help Center</a></li>
              <li><a href="#" className="text-gray-300 hover:text-red-600 transition text-sm">Contact Support</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-300 text-sm">
                <Mail className="w-4 h-4 text-red-600" />
                <span>info@lifebridge.org</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300 text-sm">
                <Phone className="w-4 h-4 text-red-600" />
                <span>+1 (800) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300 text-sm">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#556B73]/30 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 LifeBridge. All rights reserved. Saving lives through organ donation.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
