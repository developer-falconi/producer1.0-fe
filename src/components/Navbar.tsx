import React, { useRef, useEffect } from 'react';

interface NavbarProps {
  logo: string;
  producerName: string;
  onScrollToForm: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ logo, producerName, onScrollToForm }) => {
  const eventsLinkRef = useRef<HTMLAnchorElement>(null);
  const contactLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleScrollToForm = (event: MouseEvent) => {
      event.preventDefault();
      const target = event.currentTarget as HTMLAnchorElement;
      const href = target?.getAttribute('href');

      if (href === '#tickets') {
        onScrollToForm();
      } else if (href) {
        const targetElement = document.querySelector(href);
        if (targetElement instanceof HTMLElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 60,
            behavior: 'smooth',
          });
        }
      }
    };

    const handleOtherScroll = (event: MouseEvent) => {
      event.preventDefault();
      const target = event.currentTarget as HTMLAnchorElement;
      const href = target?.getAttribute('href');

      if (href) {
        const targetElement = document.querySelector(href);
        if (targetElement instanceof HTMLElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 60,
            behavior: 'smooth',
          });
        }
      }
    };

    const eventsLink = eventsLinkRef.current;
    const contactLink = contactLinkRef.current;

    if (eventsLink) {
      eventsLink.addEventListener('click', handleScrollToForm);
    }
    if (contactLink) {
      contactLink.addEventListener('click', handleOtherScroll);
    }

    return () => {
      if (eventsLink) {
        eventsLink.removeEventListener('click', handleScrollToForm);
      }
      if (contactLink) {
        contactLink.removeEventListener('click', handleOtherScroll);
      }
    };
  }, [onScrollToForm]);

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
          <a href="#events" ref={eventsLinkRef} className="hover:text-green-600 transition-colors">Eventos</a>
          <a href="#tickets" onClick={(e) => { e.preventDefault(); onScrollToForm(); }} className="hover:text-green-600 transition-colors">Tickets</a>
          <a href="#contact" ref={contactLinkRef} className="hover:text-green-600 transition-colors">Contacto</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;