import React from 'react';

const Select = ({ label, value, onChange, options, required, className = '' }) => {
  return (
    <div className={className}>
      {label && <label className="block text-[#2C3E44] mb-2 font-medium">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-white/50 border border-[#556B73]/30 rounded-lg px-4 py-3 text-[#2C3E44] focus:outline-none focus:border-red-600"
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
