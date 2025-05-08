import React from 'react';
import { Event, EventStatus } from '@/types/api';
import { cn, formatDate, getEventStatusStyles, translateEventStatus } from '@/lib/utils';

interface EventsListProps {
  events: Event[];
}

const EventsList: React.FC<EventsListProps> = ({ events }) => {
  const listEvents = events.filter(event => event.status !== EventStatus.ACTIVE);

  return (
    <div id='events' className="w-full bg-gray-900/50 backdrop-blur-sm py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8">Otros Eventos</h2>

        {listEvents.length === 0 ? (
          <p className="text-gray-400 text-lg">No hay otros eventos disponibles en este momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listEvents.map(event => (
              <div
                key={event.id}
                className="bg-gray-800/50 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:transform hover:scale-105"
              >
                <div className="relative h-48">
                  <img
                    src={event.logo}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <div className="flex w-full justify-between items-center">
                    <h3 className="text-xl font-semibold text-white mb-2">{event.name}</h3>
                    <span
                      className={cn(
                        "inline-block px-2 py-1 rounded text-xs font-medium",
                        getEventStatusStyles(event.status)
                      )}
                    >
                      {translateEventStatus(event.status)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">{event.description}</p>

                  <div className="space-y-2 text-gray-400 text-sm">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(event.startDate)}
                    </div>

                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsList;