import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-gradient-to-br from-[#A2BFC6] to-[#798E93] p-8 rounded-2xl ${sizes[size]} w-full border border-[#556B73]/30 relative shadow-2xl`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#2C3E44] hover:text-red-600 transition"
        >
          <X className="w-6 h-6" />
        </button>
        {title && <h2 className="text-3xl font-bold text-[#2C3E44] mb-6">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
