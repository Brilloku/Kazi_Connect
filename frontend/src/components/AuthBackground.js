import React from 'react';

const AuthBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Orange shape */}
      <div className="absolute -top-1/4 -right-1/4 w-2/3 h-2/3 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 opacity-80" />
      
      {/* Blue shape */}
      <div className="absolute -bottom-1/4 -left-1/4 w-2/3 h-2/3 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 opacity-80" />
      
      {/* Dots pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1rem 1rem, #e5e7eb 2px, transparent 2px)`,
        backgroundSize: '3rem 3rem',
        opacity: '0.1'
      }} />
    </div>
  );
};

export default AuthBackground;