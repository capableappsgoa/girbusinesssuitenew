import React from 'react';

const Logo = ({ size = 48, className = "" }) => {
  const pixelSize = size === 48 ? 'w-12 h-12' : size === 24 ? 'w-6 h-6' : 'w-8 h-8';
  
  return (
    <img 
      src="https://i.ibb.co/0RLKgHD6/GIR-2.png"
      alt="GET IT RENDERED Logo"
      className={`${pixelSize} object-contain ${className}`}
      style={{
        width: size === 48 ? '48px' : size === 24 ? '24px' : '32px',
        height: size === 48 ? '48px' : size === 24 ? '24px' : '32px'
      }}
    />
  );
};

export default Logo; 