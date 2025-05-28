import React from 'react';
import { Event } from '@/types/types';
import { formatDate, formatTime } from '@/lib/utils';
import CountdownTimer from './CountdownTimer';
import { Button } from './ui/button';

interface ActiveEventProps {
  event: Event;
  onGetTickets: () => void;
}

const ActiveEvent: React.FC<ActiveEventProps> = ({ event, onGetTickets }) => {

  const renderDescriptionWithLineBreaks = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="w-full z-10 p-4">
      <div className="inline-block px-4 py-1 bg-green-800 rounded-full mb-4">
        <p className="text-white font-medium">Active Event</p>
      </div>

      <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 line-clamp-2 leading-tight">
        {event.name}
      </h1>

      <div className="flex flex-col space-y-3 text-white mb-4">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>{formatDate(event.startDate)}</p>
        </div>

        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{formatTime(event.startDate)}</p>
        </div>

        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>{event.location}</p>
        </div>
      </div>

      <p className="text-gray-200 mb-6">
        {renderDescriptionWithLineBreaks(event.description)}
      </p>

      <CountdownTimer targetDate={event.startDate} />

      <div className="mt-6">
        <Button
          onClick={onGetTickets}
          disabled={event.prevents.length === 0}
          className="px-8 py-3 bg-green-800 hover:bg-green-700 text-white rounded-md text-lg transition-all duration-300 transform hover:scale-105"
        >
          Obtener Tickets
        </Button>
      </div>
    </div>
  );
};

export default ActiveEvent;