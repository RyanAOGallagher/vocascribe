'use client';

import React, { useState } from 'react';
import SideMenu from './SideMenu';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "VocaScribe", 
  subtitle = "Voice Recording & File Upload Transcription" 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center text-center space-y-2 flex-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {title}
              </h1>
              <p className="text-blue-100 text-sm md:text-base font-medium">
                {subtitle}
              </p>
            </div>
            
            {/* Hamburger Menu Icon */}
            <button 
              onClick={toggleMenu}
              className="p-2 text-white hover:text-blue-100 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Side Menu */}
      <SideMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
};

export default Header; 