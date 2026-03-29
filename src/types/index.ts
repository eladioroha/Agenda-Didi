import { AppointmentStatus } from "@prisma/client";

export type { AppointmentStatus };

export interface ServiceData {
  id: string;
  name: string;
  description?: string | null;
  durationMins: number;
  price: number;
  isActive: boolean;
}

export interface AppointmentWithService {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string | null;
  serviceId: string;
  service: ServiceData;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string | null;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationEvent =
  | "CONFIRMATION"
  | "MODIFICATION"
  | "CANCELLATION"
  | "REMINDER";

export interface BookingFormData {
  serviceId: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
}

export interface WorkingHoursData {
  id: string;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  slotGapMins: number;
}

export const DAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Concluído",
  NO_SHOW: "Não Compareceu",
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  NO_SHOW: "bg-orange-100 text-orange-800",
};
