import React, { useEffect, useState } from 'react';
import { calculateTimeRemaining } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining(targetDate);
      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="w-full mt-8">
      <h3 className="text-white text-xl mb-4">Countdown to Event</h3>
      <div className="flex justify-start gap-4">
        <div className="bg-black/70 w-20 h-20 flex flex-col items-center justify-center rounded-md">
          <span className="text-white text-3xl font-bold">{timeRemaining.days}</span>
          <span className="text-white text-sm">Days</span>
        </div>
        
        <div className="bg-black/70 w-20 h-20 flex flex-col items-center justify-center rounded-md">
          <span className="text-white text-3xl font-bold">{timeRemaining.hours}</span>
          <span className="text-white text-sm">Hours</span>
        </div>
        
        <div className="bg-black/70 w-20 h-20 flex flex-col items-center justify-center rounded-md">
          <span className="text-white text-3xl font-bold">{timeRemaining.minutes}</span>
          <span className="text-white text-sm">Minutes</span>
        </div>
        
        <div className="bg-black/70 w-20 h-20 flex flex-col items-center justify-center rounded-md">
          <span className="text-white text-3xl font-bold">{timeRemaining.seconds}</span>
          <span className="text-white text-sm">Seconds</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;