export enum GenderEnum {
  HOMBRE = "HOMBRE",
  MUJER = "MUJER",
  OTRO = "OTRO"
}

export enum EventStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  UPCOMING = 'UPCOMING',
  SUSPENDED = 'SUSPENDED'
}

export interface Producer {
  id: number;
  name: string;
  domain: string;
  firebaseWebAppId: string;
  googleAnalyticsId: string;
  status: string;
  logo: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  events: Event[];
  users: User[];
  email: Email;
}

export interface Email {
  id: number;
  email: string;
  key: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Event {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: EventStatus;
  folder: boolean;
  alias: string | null;
  logo: string;
  createdAt: string;
  updatedAt: string;
  prevents: Prevent[];
  oAuthMercadoPago?: MercadoPagoConfigDto;
}

export interface Prevent {
  id: number;
  name: string;
  price: number;
  quantity: number;
  remaining?: number;
  status: PreventStatusEnum;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum PreventStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  SOLD_OUT = 'SOLD_OUT',
}

export interface User {
  id?: number;
  email?: string;
  name?: string;
}

export interface Participant {
  fullName: string;
  phone: string;
  docNumber: string;
  gender: GenderEnum;
  email?: string;
}

export interface TicketFormData {
  participants: Participant[];
  email: string;
  comprobante?: File | null;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; data?: never; message?: string };

export enum SpinnerSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large"
}

export enum ClientTypeEnum {
  FREE = 'FREE',
  REGULAR = 'REGULAR',
  OTRO = 'OTRO'
}

export interface PreferenceData {
  preferenceId: string;
  publicKey: string;
}

export interface MercadoPagoConfigDto {
  id: number;
  mpUserName: string;
  mpPublicKey: string;
  createdAt: string;
}