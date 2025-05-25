import { create } from 'zustand';
import { format, addDays, parse, isAfter, isBefore } from 'date-fns';
import type { Appointment, AppointmentStatus, Provider, Service } from '../types';

interface AppointmentState {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  
  fetchAppointments: () => Promise<void>;
  getAppointmentById: (id: string) => Appointment | undefined;
  bookAppointment: (appointment: Partial<Appointment>) => Promise<Appointment>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
  
  providers: Provider[];
  services: Service[];
  fetchProviders: () => Promise<void>;
  fetchServices: () => Promise<void>;
  getAvailableSlots: (providerId: string, date: string) => Promise<string[]>;
}

// Mock data for development
const mockProviders: Provider[] = [
  {
    id: 'provider-1',
    name: 'Dr. Sarah Johnson',
    specialization: 'Dermatologist',
    bio: 'Board certified dermatologist with 10+ years of experience in medical and cosmetic dermatology.',
    imageUrl: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    availability: [],
    rating: 4.9,
  },
  {
    id: 'provider-2',
    name: 'Dr. Michael Chen',
    specialization: 'Cardiologist',
    bio: 'Experienced cardiologist focused on preventive care and treatment of heart conditions.',
    imageUrl: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    availability: [],
    rating: 4.8,
  },
  {
    id: 'provider-3',
    name: 'Dr. Emma Wilson',
    specialization: 'Therapist',
    bio: 'Licensed therapist specializing in anxiety, depression, and relationship counseling.',
    imageUrl: 'https://images.pexels.com/photos/5207104/pexels-photo-5207104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    availability: [],
    rating: 4.7,
  },
];

const mockServices: Service[] = [
  {
    id: 'service-1',
    name: 'Initial Consultation',
    description: 'First-time appointment to discuss your health concerns and create a treatment plan.',
    duration: 60,
    price: 150,
    category: 'consultation',
  },
  {
    id: 'service-2',
    name: 'Follow-up Visit',
    description: 'Check on your progress and adjust treatment as needed.',
    duration: 30,
    price: 100,
    category: 'follow-up',
  },
  {
    id: 'service-3',
    name: 'Urgent Care',
    description: 'Same-day appointment for urgent health concerns.',
    duration: 45,
    price: 200,
    category: 'urgent',
  },
];

// Generate mock appointments
const generateMockAppointments = (): Appointment[] => {
  const statuses: AppointmentStatus[] = ['scheduled', 'confirmed', 'completed', 'cancelled'];
  const appointments: Appointment[] = [];
  
  // Generate 5 appointments
  for (let i = 0; i < 5; i++) {
    const isUpcoming = i < 3; // First 3 are upcoming
    const date = isUpcoming 
      ? format(addDays(new Date(), i + 1), 'yyyy-MM-dd')
      : format(addDays(new Date(), -(i - 2)), 'yyyy-MM-dd');
    
    appointments.push({
      id: `appointment-${i + 1}`,
      userId: 'user-1',
      providerId: mockProviders[i % mockProviders.length].id,
      serviceId: mockServices[i % mockServices.length].id,
      date,
      startTime: '10:00',
      endTime: '11:00',
      status: isUpcoming ? (i === 0 ? 'scheduled' : 'confirmed') : statuses[i % statuses.length],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      provider: mockProviders[i % mockProviders.length],
      service: mockServices[i % mockServices.length],
    });
  }
  
  return appointments;
};

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  providers: [],
  services: [],
  isLoading: false,
  error: null,
  
  fetchAppointments: async () => {
    set({ isLoading: true });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use mock data for development
      const mockAppointments = generateMockAppointments();
      
      set({ appointments: mockAppointments, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  getAppointmentById: (id) => {
    return get().appointments.find(appointment => appointment.id === id);
  },
  
  bookAppointment: async (appointmentData) => {
    set({ isLoading: true });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAppointment: Appointment = {
        id: `appointment-${Date.now()}`,
        userId: 'user-1',
        providerId: appointmentData.providerId || '',
        serviceId: appointmentData.serviceId || '',
        date: appointmentData.date || format(new Date(), 'yyyy-MM-dd'),
        startTime: appointmentData.startTime || '09:00',
        endTime: appointmentData.endTime || '10:00',
        status: 'scheduled',
        notes: appointmentData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        provider: get().providers.find(p => p.id === appointmentData.providerId),
        service: get().services.find(s => s.id === appointmentData.serviceId),
      };
      
      set(state => ({
        appointments: [...state.appointments, newAppointment],
        isLoading: false,
      }));
      
      return newAppointment;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  updateAppointment: async (id, data) => {
    set({ isLoading: true });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedAppointments = get().appointments.map(appointment => {
        if (appointment.id === id) {
          return {
            ...appointment,
            ...data,
            updatedAt: new Date().toISOString(),
          };
        }
        return appointment;
      });
      
      const updatedAppointment = updatedAppointments.find(a => a.id === id);
      
      if (!updatedAppointment) {
        throw new Error('Appointment not found');
      }
      
      set({ appointments: updatedAppointments, isLoading: false });
      
      return updatedAppointment;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  cancelAppointment: async (id) => {
    set({ isLoading: true });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedAppointments = get().appointments.map(appointment => {
        if (appointment.id === id) {
          return {
            ...appointment,
            status: 'cancelled',
            updatedAt: new Date().toISOString(),
          };
        }
        return appointment;
      });
      
      set({ appointments: updatedAppointments, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  fetchProviders: async () => {
    set({ isLoading: true });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ providers: mockProviders, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  fetchServices: async () => {
    set({ isLoading: true });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ services: mockServices, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  getAvailableSlots: async (providerId, date) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock available time slots
      const allTimeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
      ];
      
      // Filter out booked slots
      const bookedAppointments = get().appointments.filter(
        app => app.providerId === providerId && 
              app.date === date && 
              app.status !== 'cancelled'
      );
      
      const bookedSlots = bookedAppointments.map(app => app.startTime);
      
      return allTimeSlots.filter(slot => !bookedSlots.includes(slot));
    } catch (error: any) {
      set({ error: error.message });
      return [];
    }
  },
}));