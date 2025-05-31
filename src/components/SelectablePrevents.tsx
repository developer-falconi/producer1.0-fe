import { cn, formatPrice } from '@/lib/utils';
import React from 'react';

interface Prevent {
  id: number;
  name: string;
  price: number;
}

interface SelectableCardListProps {
  activePrevents: Prevent[];
  selectedPreventId: number | null;
  setSelectedPreventId: (id: number) => void;
}

const SelectableCardList: React.FC<SelectableCardListProps> = ({
  activePrevents,
  selectedPreventId,
  setSelectedPreventId,
}) => {
  return (
    <div>
      <h3 className="mb-2 text-lg font-semibold">Elige un horario</h3>
      <div className="flex flex-col gap-2">
        {activePrevents.map(prevent => (
          <div
            key={prevent.id}
            className={cn(
              'flex items-center justify-around w-full p-4 border rounded-lg cursor-pointer',
              'transition-all duration-200 ease-in-out',
              selectedPreventId === prevent.id
                ? 'border-green-600 text-green-500 ' +
                'hover:border-green-400 hover:text-green-300'
                : 'border-gray-700 text-gray-400 ' +
                'hover:border-green-600 hover:text-white'
            )}
            onClick={() => setSelectedPreventId(prevent.id)}
          >
            <div className="text-lg font-medium">{prevent.name}</div>
            <div className="text-xl font-semibold">{formatPrice(prevent.price)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectableCardList;