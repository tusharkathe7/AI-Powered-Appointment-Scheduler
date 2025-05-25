import { useNavigate } from 'react-router-dom';
import { useAppointmentStore } from '../store/appointmentStore';
import { useNotificationStore } from '../store/notificationStore';

interface VoiceCommand {
  intent: string;
  parameters: Record<string, any>;
}

export class VoiceAssistant {
  private static processCommand(text: string): VoiceCommand {
    const lowercaseText = text.toLowerCase();
    
    // Book appointment intent
    if (lowercaseText.includes('book') || lowercaseText.includes('schedule')) {
      const params: Record<string, any> = {};
      
      // Extract provider name
      const providerMatch = lowercaseText.match(/with (dr\.|doctor)?\s*([a-z]+)/i);
      if (providerMatch) {
        params.providerName = providerMatch[2];
      }
      
      // Extract time
      const timeMatch = lowercaseText.match(/at (\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
      if (timeMatch) {
        params.time = timeMatch[1];
      }
      
      // Extract date
      if (lowercaseText.includes('tomorrow')) {
        params.date = 'tomorrow';
      } else if (lowercaseText.includes('today')) {
        params.date = 'today';
      } else {
        const dateMatch = lowercaseText.match(/on ([a-z]+day)/i);
        if (dateMatch) {
          params.date = dateMatch[1];
        }
      }
      
      return {
        intent: 'bookAppointment',
        parameters: params
      };
    }
    
    // Cancel appointment intent
    if (lowercaseText.includes('cancel')) {
      const timeMatch = lowercaseText.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
      return {
        intent: 'cancelAppointment',
        parameters: {
          time: timeMatch ? timeMatch[1] : null
        }
      };
    }
    
    // Reschedule appointment intent
    if (lowercaseText.includes('reschedule')) {
      const params: Record<string, any> = {};
      
      const timeMatch = lowercaseText.match(/to (\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
      if (timeMatch) {
        params.newTime = timeMatch[1];
      }
      
      if (lowercaseText.includes('next')) {
        const dayMatch = lowercaseText.match(/next ([a-z]+day)/i);
        if (dayMatch) {
          params.newDate = `next ${dayMatch[1]}`;
        }
      }
      
      return {
        intent: 'rescheduleAppointment',
        parameters: params
      };
    }
    
    // Navigation intents
    if (lowercaseText.includes('show') || lowercaseText.includes('go to') || lowercaseText.includes('open')) {
      if (lowercaseText.includes('profile') || lowercaseText.includes('account')) {
        return {
          intent: 'navigate',
          parameters: { route: '/settings' }
        };
      }
      if (lowercaseText.includes('appointment') || lowercaseText.includes('booking')) {
        return {
          intent: 'navigate',
          parameters: { route: '/appointments' }
        };
      }
      if (lowercaseText.includes('dashboard')) {
        return {
          intent: 'navigate',
          parameters: { route: '/dashboard' }
        };
      }
    }
    
    return {
      intent: 'unknown',
      parameters: {}
    };
  }
  
  static async handleCommand(text: string): Promise<string> {
    const command = this.processCommand(text);
    
    switch (command.intent) {
      case 'bookAppointment':
        return this.handleBooking(command.parameters);
      case 'cancelAppointment':
        return this.handleCancellation(command.parameters);
      case 'rescheduleAppointment':
        return this.handleRescheduling(command.parameters);
      case 'navigate':
        return this.handleNavigation(command.parameters);
      default:
        return "I'm not sure what you want to do. Could you please rephrase that?";
    }
  }
  
  private static async handleBooking(params: Record<string, any>): Promise<string> {
    if (!params.providerName || !params.time) {
      return "Please specify both a provider and time for the appointment.";
    }
    
    // In a real app, this would validate availability and actually book
    return `I'll help you book an appointment with ${params.providerName} at ${params.time}${params.date ? ` on ${params.date}` : ''}. Should I proceed?`;
  }
  
  private static async handleCancellation(params: Record<string, any>): Promise<string> {
    if (params.time) {
      return `Are you sure you want to cancel your ${params.time} appointment?`;
    }
    return "Which appointment would you like to cancel?";
  }
  
  private static async handleRescheduling(params: Record<string, any>): Promise<string> {
    if (params.newTime || params.newDate) {
      return `I'll help you reschedule your appointment${params.newTime ? ` to ${params.newTime}` : ''}${params.newDate ? ` on ${params.newDate}` : ''}. Should I proceed?`;
    }
    return "When would you like to reschedule your appointment to?";
  }
  
  private static handleNavigation(params: Record<string, any>): string {
    return `Navigating to ${params.route}...`;
  }
}