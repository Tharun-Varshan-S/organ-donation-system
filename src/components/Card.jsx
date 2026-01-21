import React from 'react';

const Card = ({ children, className = '', hover = false }) => {
  const hoverStyles = hover ? 'transition-all duration-300 hover:shadow-2xl hover:-translate-y-3 cursor-pointer' : '';
  return (
    <div className={`bg-white/60 backdrop-blur-lg rounded-2xl border border-[#798E93]/30 p-8 shadow-xl ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
