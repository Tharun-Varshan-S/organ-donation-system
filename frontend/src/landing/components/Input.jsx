import React from 'react';

const Input = ({ label, type = 'text', placeholder, value, onChange, required, className = '' }) => {
  return (
    <div className={className}>
      {label && <label className="block text-[#2C3E44] mb-2 font-medium">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white/50 border border-[#556B73]/30 rounded-lg px-4 py-3 text-[#2C3E44] placeholder-[#798E93] focus:outline-none focus:border-red-600"
      />
    </div>
  );
};

export default Input;
