import { EventStatus } from "@/types/types";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function calculateTimeRemaining(targetDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const target = new Date(targetDate);
  const difference = target.getTime() - now.getTime();

  // If the date has passed, return all zeros
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

export const getEventStatusStyles = (status: EventStatus): string => {
  switch (status) {
    case EventStatus.ACTIVE:
      return "bg-green-600 text-white";
    case EventStatus.DRAFT:
      return "bg-yellow-500 text-black";
    case EventStatus.COMPLETED:
      return "bg-blue-600 text-white";
    case EventStatus.CANCELLED:
      return "bg-red-600 text-white";
    case EventStatus.UPCOMING:
      return "bg-purple-600 text-white";
    case EventStatus.SUSPENDED:
      return "bg-gray-600 text-white";
    default:
      return "bg-gray-600 text-white";
  }
};

export const eventStatusLabels: Record<EventStatus, string> = {
  [EventStatus.ACTIVE]: 'ACTIVO',
  [EventStatus.DRAFT]: 'BORRADOR',
  [EventStatus.COMPLETED]: 'COMPLETADO',
  [EventStatus.CANCELLED]: 'CANCELADO',
  [EventStatus.UPCOMING]: 'PRÓXIMO',
  [EventStatus.SUSPENDED]: 'SUSPENDIDO',
};

export const translateEventStatus = (status: EventStatus): string => {
  return eventStatusLabels[status] || status;
};

export const formatPrice = (price: string | number): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericPrice);
};