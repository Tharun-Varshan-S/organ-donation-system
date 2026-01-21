import React from 'react';

const Button = ({ children, variant = 'primary', onClick, disabled, className = '', type = 'button', ...props }) => {
  const baseStyles = 'px-6 py-3 rounded-lg font-semibold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-red-600 hover:bg-red-700 text-white',
    secondary: 'bg-[#556B73] hover:bg-[#2C3E44] text-white',
    dark: 'bg-[#2C3E44] hover:bg-[#3d545c] text-white',
    white: 'bg-white/90 hover:bg-white text-black border-2 border-black/10 hover:border-black/30',
    outline: 'bg-transparent border-2 border-[#798E93] text-[#2C3E44] hover:bg-[#798E93]/10'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
