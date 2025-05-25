export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  createdAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  preferredDays?: string[];
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';
  preferredProviders?: string[];
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    reminderHoursBefore: number;
  };
}

export interface Provider {
  id: string;
  name: string;
  specialization: string;
  bio: string;
  imageUrl?: string;
  availability: AvailabilitySlot[];
  rating: number;
}

export interface AvailabilitySlot {
  id: string;
  providerId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  userId: string;
  providerId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  provider?: Provider;
  service?: Service;
}

export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'completed' 
  | 'cancelled' 
  | 'no-show'
  | 'rescheduled';

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'appointment_reminder' | 'appointment_confirmation' | 'appointment_cancellation' | 'appointment_rescheduled';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface VoiceCommand {
  text: string;
  timestamp: string;
  action?: string;
  parameters?: Record<string, any>;
  successful: boolean;
}