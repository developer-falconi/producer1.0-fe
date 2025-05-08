import React from 'react';

interface NavbarProps {
  logo: string;
  producerName: string;
}

const Navbar: React.FC<NavbarProps> = ({ logo, producerName }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src={logo} 
            alt={`${producerName} logo`} 
            className="h-12 w-12 rounded-full object-cover"
          />
          <span className="text-white text-xl font-bold hidden sm:inline-block">
            {producerName}
          </span>
        </div>
        
        <div className="flex space-x-6 text-white">
          <a href="#events" className="hover:text-purple-300 transition-colors">Eventos</a>
          {/* <a href="#about" className="hover:text-purple-300 transition-colors">About</a>
          <a href="#gallery" className="hover:text-purple-300 transition-colors">Gallery</a> */}
          <a href="#contact" className="hover:text-purple-300 transition-colors">Contacto</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;