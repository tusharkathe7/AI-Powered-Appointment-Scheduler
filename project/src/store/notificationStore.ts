import { create } from 'zustand';
import type { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

// Generate mock notifications
const generateMockNotifications = (): Notification[] => {
  const types: Notification['type'][] = [
    'appointment_reminder',
    'appointment_confirmation',
    'appointment_cancellation',
    'appointment_rescheduled'
  ];
  
  const notifications: Notification[] = [];
  
  for (let i = 0; i < 5; i++) {
    const type = types[i % types.length];
    let title = '';
    let message = '';
    
    switch (type) {
      case 'appointment_reminder':
        title = 'Upcoming Appointment Reminder';
        message = 'You have an appointment with Dr. Sarah Johnson tomorrow at 10:00 AM.';
        break;
      case 'appointment_confirmation':
        title = 'Appointment Confirmed';
        message = 'Your appointment with Dr. Michael Chen on Friday has been confirmed.';
        break;
      case 'appointment_cancellation':
        title = 'Appointment Cancelled';
        message = 'Your appointment for next Monday has been cancelled.';
        break;
      case 'appointment_rescheduled':
        title = 'Appointment Rescheduled';
        message = 'Your appointment has been rescheduled to Wednesday at 2:30 PM.';
        break;
    }
    
    notifications.push({
      id: `notification-${i + 1}`,
      userId: 'user-1',
      type,
      title,
      message,
      isRead: i > 2, // First 3 are unread
      createdAt: new Date(Date.now() - i * 86400000).toISOString(), // Each 1 day older
    });
  }
  
  return notifications;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use mock data for development
      const mockNotifications = generateMockNotifications();
      const unreadCount = mockNotifications.filter(n => !n.isRead).length;
      
      set({ 
        notifications: mockNotifications, 
        unreadCount,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  markAsRead: async (id) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedNotifications = get().notifications.map(notification => {
        if (notification.id === id && !notification.isRead) {
          return { ...notification, isRead: true };
        }
        return notification;
      });
      
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      
      set({ notifications: updatedNotifications, unreadCount });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  markAllAsRead: async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedNotifications = get().notifications.map(notification => ({
        ...notification,
        isRead: true
      }));
      
      set({ notifications: updatedNotifications, unreadCount: 0 });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  addNotification: (notification) => {
    set(state => {
      const notifications = [notification, ...state.notifications];
      const unreadCount = notification.isRead 
        ? state.unreadCount 
        : state.unreadCount + 1;
      
      return { notifications, unreadCount };
    });
  },
}));