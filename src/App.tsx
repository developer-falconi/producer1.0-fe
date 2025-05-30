import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import PaymentResult from './components/PaymentResult';

interface PaymentStatus {
  status: string;
  params: Record<string, string>;
}

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [producer, setProducer] = useState<Producer | null>(null);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [showTicketForm, setShowTicketForm] = useState<boolean>(false);
  const ticketFormRef = useRef<HTMLDivElement>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchProducerData();

        if (response.success) {
          setProducer(response.data!);

          const active = response.data!.events
            .sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .find(event => event.status === EventStatus.ACTIVE);

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

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const status = q.get('collection_status') || q.get('status');

    if (status) {
      const params: Record<string, string> = {};
      q.forEach((v, k) => (params[k] = v));
      setPaymentStatus({ status, params });
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        ticketFormRef.current!.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 600)
    }
  }, []);

  useEffect(() => {
    if (!paymentStatus) return;
    const timer = window.setTimeout(() => setPaymentStatus(null), 8000);
    return () => window.clearTimeout(timer);
  }, [paymentStatus]);

  const toggleTicketForm = () => {
    if (activeEvent && activeEvent?.prevents.length > 0) {
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
    }
  };

  const handleScrollToFormFromNavbar = () => {
    toggleTicketForm();
  };

  const handleSelectEvent = useCallback((event: Event) => {
    if (event.status === EventStatus.ACTIVE && event.id !== activeEvent?.id) {
      setIsTransitioning(true);
      setShowTicketForm(false);

      setTimeout(() => {
        setActiveEvent(event);
        setIsTransitioning(false);
        window.scrollTo({ top: 10, behavior: 'smooth' });
      }, 500);
    }
  }, [activeEvent]);

  const lastActivePrevent = useMemo(() =>
    activeEvent?.prevents
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .find((prevent) => prevent.status === PreventStatusEnum.ACTIVE)
    , [activeEvent]
  )

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
            <div
              className={cn(
                "transition-all duration-500 ease-in-out transform",
                isTransitioning ? "opacity-0 -translate-x-full" : "opacity-100 translate-x-0"
              )}
            >
              <ActiveEvent
                event={activeEvent}
                onGetTickets={toggleTicketForm}
              />
            </div>

            <div
              ref={ticketFormRef}
              className="w-full md:w-1/2 flex justify-center items-center p-4 mt-8 md:mt-0 relative min-h-[700px]"
            >
              {/* 1) Flyer/Form layer */}
              <div
                className={cn(
                  'absolute inset-0 flex justify-center items-center transition-opacity duration-700 ease-in-out',
                  !showTicketForm ? 'opacity-100 z-20' : 'opacity-0 -z-10 pointer-events-none'
                )}
              >
                {/* Image (Flyer) - Visible by default */}
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
                  'absolute inset-0 flex justify-center items-center transition-opacity duration-700 ease-in-out',
                  showTicketForm ? 'opacity-100 z-20' : 'opacity-0 -z-10 pointer-events-none'
                )}
              >
                {/* Ticket Form - Hidden by default */}
                {showTicketForm && activeEvent.prevents.length > 0 && (
                  <TicketForm
                    event={activeEvent}
                    onGetTickets={toggleTicketForm}
                    prevent={lastActivePrevent}
                  />
                )}
              </div>

              {/* 2) PaymentResult layer */}
              <div
                className={cn(
                  'absolute inset-0 flex justify-center items-center transition-all duration-500 ease-in-out',
                  paymentStatus ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                )}
              >
                {paymentStatus && <PaymentResult status={paymentStatus.status} />}
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <EventsList
          events={producer.events}
          selectedEvent={activeEvent}
          onSelectEvent={handleSelectEvent}
        />

        {/* Contact Section */}
        <Contact producer={producer} />

        {/* Footer */}
        <footer className="w-full bg-gray-900 py-4 text-center">
          <p className="text-gray-400 text-sm">
            Created by{' '}
            <a
              href="https://www.produtik.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Produtik
            </a>
          </p>
        </footer>
      </div>
    </>
  );
};

export default App;