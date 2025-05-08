import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchProducerData } from './services/api';
import { Event, EventStatus, PreventStatusEnum, Producer } from './types/types';
import Navbar from './components/Navbar';
import Spinner from './components/Spinner';
import ActiveEvent from './components/ActiveEvent';
import EventsList from './components/EventsList';
import TicketForm from './components/TicketForm';
import { Toaster } from 'sonner';
import Contact from './components/Contact';
import { cn } from './lib/utils';
import DynamicFavicon from './components/DynamicFavicon';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [producer, setProducer] = useState<Producer | null>(null);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [showTicketForm, setShowTicketForm] = useState<boolean>(false);
  const ticketFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchProducerData();

        if (response.success) {
          setProducer(response.data);

          // Find active event
          const active = response.data.events.find(
            event => event.status === EventStatus.ACTIVE
          );

          if (active) {
            setActiveEvent(active);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (producer) {
      document.title = `${producer.name} Platform`;

    } else {
      document.title = 'Producer Platform';
    }
  }, [producer]);

  const toggleTicketForm = () => {
    setShowTicketForm(!showTicketForm);
    if (!showTicketForm && window.innerWidth < 768 && ticketFormRef.current) {
      const formTop = ticketFormRef.current.getBoundingClientRect().top + window.scrollY;
      const screenHeight = window.innerHeight;
      const scrollToPosition = formTop - (screenHeight / 2) + (ticketFormRef.current.offsetHeight / 2);

      window.scrollTo({
        top: scrollToPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleScrollToFormFromNavbar = () => {
    toggleTicketForm();
  };

  const lastActivePrevent = useMemo(() =>
    activeEvent?.prevents
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .find((prevent) => prevent.status === PreventStatusEnum.ACTIVE),
    [activeEvent])

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <Spinner />
        <p className="mt-4 text-white text-xl">Cargando...</p>
      </div>
    );
  }

  if (!producer || !activeEvent) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <p className="text-white text-xl">No se encontro la info del productor.</p>
      </div>
    );
  }

  return (
    <>
      <DynamicFavicon producer={producer} />
      <Toaster
        richColors
        expand
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:pointer-events-auto",
          },
        }}
      />

      <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 to-gray-800">
        <Navbar
          logo={producer.logo}
          producerName={producer.name}
          onScrollToForm={handleScrollToFormFromNavbar}
        />

        <div className="min-h-screen w-full flex flex-col md:flex-row items-center justify-center pt-20 px-4 relative overflow-hidden">
          {/* Background image with overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{
              backgroundImage: `url(${producer.logo})`,
              filter: 'brightness(0.3) contrast(1.2)'
            }}
          />

          {/* Content */}
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between z-10">
            {/* Event information */}
            <ActiveEvent
              event={activeEvent}
              onGetTickets={toggleTicketForm}
            />

            {/* Event flyer/logo or Ticket Form */}
            <div
              ref={ticketFormRef}
              className="w-full md:w-1/2 flex justify-center items-center p-4 mt-8 md:mt-0 relative min-h-[700px]"
            >
              <div className={cn(
                'absolute inset-0 flex justify-center items-center transition-all',
                'duration-500 ease-in-out',
                showTicketForm ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
              )}>
                <div className="rounded-lg overflow-hidden shadow-2xl">
                  <img
                    src={activeEvent.logo}
                    alt={`${activeEvent.name} flyer`}
                    className="w-full h-auto max-w-md"
                  />
                </div>
              </div>

              <div
                className={cn(
                  'absolute inset-0 flex flex-col gap-4 justify-center items-center transition-all duration-500 ease-in-out',
                  showTicketForm ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                )}
              >
                <TicketForm
                  event={activeEvent}
                  onGetTickets={toggleTicketForm}
                  prevent={lastActivePrevent}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <EventsList events={producer.events} />

        {/* Contact Section */}
        <Contact producer={producer} />

        {/* Footer */}
        <footer className="w-full bg-gray-900 py-4 text-center">
          <p className="text-gray-400 text-sm">
            Created by{' '}
            <a
              href="https://ticketera-fe.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              ProduTik
            </a>
          </p>
        </footer>
      </div>
    </>
  );
};

export default App;