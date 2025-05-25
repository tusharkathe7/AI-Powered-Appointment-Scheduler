import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, parse, isAfter, isBefore, set } from 'date-fns';
import { Calendar, Clock, CheckCircle, User, MessageSquare, ArrowRight, Mic } from 'lucide-react';
import { useAppointmentStore } from '../../store/appointmentStore';
import { useNotificationStore } from '../../store/notificationStore';
import VoiceInput from '../../components/ui/VoiceInput';
import type { Provider, Service, Appointment } from '../../types';

const BookAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State for each step of the booking process
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  
  // Voice command state
  const [processingVoice, setProcessingVoice] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  
  const { 
    providers, 
    services, 
    fetchProviders, 
    fetchServices, 
    bookAppointment,
    getAvailableSlots 
  } = useAppointmentStore();
  
  const { addNotification } = useNotificationStore();
  
  // Fetch providers and services on mount
  useEffect(() => {
    fetchProviders();
    fetchServices();
  }, []);
  
  // Fetch available slots when provider and date are selected
  useEffect(() => {
    if (selectedProvider && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedProvider, selectedDate]);
  
  const fetchAvailableSlots = async () => {
    if (!selectedProvider || !selectedDate) return;
    
    const slots = await getAvailableSlots(selectedProvider.id, selectedDate);
    setAvailableSlots(slots);
    
    // Clear selected time if it's no longer available
    if (selectedTime && !slots.includes(selectedTime)) {
      setSelectedTime('');
    }
  };
  
  // Voice command processing
  const handleVoiceCommand = async (command: string) => {
    setVoiceCommand(command);
    setProcessingVoice(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple command parsing for demo
    // In a real app, this would use NLP or LLM to extract entities and intent
    try {
      const lowercaseCommand = command.toLowerCase();
      
      // Extract provider
      const providerMatch = providers.find(p => 
        lowercaseCommand.includes(p.name.toLowerCase()) || 
        lowercaseCommand.includes(p.specialization.toLowerCase())
      );
      
      if (providerMatch) {
        setSelectedProvider(providerMatch);
        if (currentStep === 1) setCurrentStep(2);
      }
      
      // Extract service
      const serviceMatch = services.find(s => 
        lowercaseCommand.includes(s.name.toLowerCase())
      );
      
      if (serviceMatch) {
        setSelectedService(serviceMatch);
        if (currentStep <= 2) setCurrentStep(3);
      }
      
      // Extract date (simple patterns)
      if (lowercaseCommand.includes('tomorrow')) {
        const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
        setSelectedDate(tomorrow);
        if (currentStep <= 3) setCurrentStep(4);
      } else if (lowercaseCommand.includes('today')) {
        const today = format(new Date(), 'yyyy-MM-dd');
        setSelectedDate(today);
        if (currentStep <= 3) setCurrentStep(4);
      }
      
      // Extract time (simple patterns for demo)
      const timeRegex = /\b(at|for)\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?\b/i;
      const timeMatch = lowercaseCommand.match(timeRegex);
      
      if (timeMatch) {
        let hours = parseInt(timeMatch[2]);
        const minutes = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
        const period = timeMatch[4]?.toLowerCase();
        
        // Adjust hours for PM
        if (period === 'pm' && hours < 12) {
          hours += 12;
        }
        // Adjust for AM
        if (period === 'am' && hours === 12) {
          hours = 0;
        }
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // Check if this time is available
        if (availableSlots.includes(timeString)) {
          setSelectedTime(timeString);
          if (currentStep <= 4) setCurrentStep(5);
        }
      }
      
      // Extract notes
      if (lowercaseCommand.includes('note') || lowercaseCommand.includes('reason')) {
        const noteRegex = /(?:note|reason|because|that)\s+(.+)/i;
        const noteMatch = lowercaseCommand.match(noteRegex);
        
        if (noteMatch && noteMatch[1]) {
          setNotes(noteMatch[1]);
        }
      }
      
      // Handle booking command
      if (
        (lowercaseCommand.includes('book') || lowercaseCommand.includes('schedule')) &&
        selectedProvider &&
        selectedService &&
        selectedDate &&
        selectedTime
      ) {
        handleBookAppointment();
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
    } finally {
      setProcessingVoice(false);
    }
  };
  
  // Handle the final booking submission
  const handleBookAppointment = async () => {
    if (!selectedProvider || !selectedService || !selectedDate || !selectedTime) {
      setBookingError('Please complete all required fields');
      return;
    }
    
    setIsBooking(true);
    setBookingError(null);
    
    try {
      const appointmentData = {
        providerId: selectedProvider.id,
        serviceId: selectedService.id,
        date: selectedDate,
        startTime: selectedTime,
        // Calculate end time based on service duration
        endTime: calculateEndTime(selectedTime, selectedService.duration),
        notes: notes
      };
      
      const newAppointment = await bookAppointment(appointmentData);
      setCreatedAppointment(newAppointment);
      
      // Create a notification for the booking
      addNotification({
        id: `notification-${Date.now()}`,
        userId: 'user-1',
        type: 'appointment_confirmation',
        title: 'Appointment Confirmed',
        message: `Your appointment with ${selectedProvider.name} on ${format(parseISO(selectedDate), 'MMMM d')} at ${formatTime(selectedTime)} has been confirmed.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
      
      setBookingComplete(true);
      
      // Navigate to appointment details after a delay
      setTimeout(() => {
        navigate(`/appointments/${newAppointment.id}`);
      }, 3000);
    } catch (error: any) {
      setBookingError(error.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };
  
  // Helper to calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // Helper to format time for display
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return format(date, 'h:mm a');
  };
  
  // Parse ISO date string to Date object
  const parseISO = (dateString: string): Date => {
    return new Date(dateString);
  };
  
  // Generate date options for the next 14 days
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEEE, MMMM d')
    };
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Voice assistant */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <Mic className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Book with Voice</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Use your voice to schedule an appointment. Try saying:
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-white/60 px-3 py-1 rounded-full text-sm text-gray-700">
              "Book with Dr. Johnson tomorrow at 2 PM"
            </span>
            <span className="bg-white/60 px-3 py-1 rounded-full text-sm text-gray-700">
              "Schedule a consultation with Dr. Wilson on Friday"
            </span>
          </div>
          <VoiceInput onCommandSubmit={handleVoiceCommand} />
          
          {/* Voice command processing feedback */}
          <AnimatePresence>
            {processingVoice && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-white/80 p-4 rounded-lg"
              >
                <p className="text-sm text-gray-600 mb-2">Processing: "{voiceCommand}"</p>
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  <span className="text-sm text-primary-600">Analyzing your request...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Booking complete message */}
        {bookingComplete && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-8 flex items-start"
          >
            <CheckCircle className="h-6 w-6 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-800 text-lg">Appointment Booked Successfully!</h3>
              <p className="mt-1">
                Your appointment with {createdAppointment?.provider?.name} on {format(parseISO(createdAppointment?.date || ''), 'MMMM d, yyyy')} at {formatTime(createdAppointment?.startTime || '')} has been confirmed. You will be redirected to the appointment details.
              </p>
            </div>
          </motion.div>
        )}
        
        {/* Error message */}
        {bookingError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8"
          >
            <h3 className="font-medium">Error</h3>
            <p>{bookingError}</p>
          </motion.div>
        )}
        
        {/* Booking form */}
        {!bookingComplete && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Booking steps */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <BookingStep
                  number={1}
                  title="Service"
                  isActive={currentStep === 1}
                  isCompleted={currentStep > 1}
                  onClick={() => setCurrentStep(1)}
                />
                <BookingStep
                  number={2}
                  title="Provider"
                  isActive={currentStep === 2}
                  isCompleted={currentStep > 2}
                  onClick={() => selectedService ? setCurrentStep(2) : null}
                  isDisabled={!selectedService}
                />
                <BookingStep
                  number={3}
                  title="Date"
                  isActive={currentStep === 3}
                  isCompleted={currentStep > 3}
                  onClick={() => selectedProvider ? setCurrentStep(3) : null}
                  isDisabled={!selectedProvider}
                />
                <BookingStep
                  number={4}
                  title="Time"
                  isActive={currentStep === 4}
                  isCompleted={currentStep > 4}
                  onClick={() => selectedDate ? setCurrentStep(4) : null}
                  isDisabled={!selectedDate}
                />
                <BookingStep
                  number={5}
                  title="Confirm"
                  isActive={currentStep === 5}
                  isCompleted={currentStep > 5}
                  onClick={() => selectedTime ? setCurrentStep(5) : null}
                  isDisabled={!selectedTime}
                />
              </div>
            </div>
            
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Select Service */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Service</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services.map(service => (
                        <motion.div
                          key={service.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedService?.id === service.id 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                          onClick={() => setSelectedService(service)}
                          whileHover={{ y: -3 }}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-lg">{service.name}</h3>
                            <span className="font-medium">${service.price}</span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                          <div className="flex items-center mt-3 text-gray-500">
                            <Clock size={16} className="mr-1.5" />
                            <span className="text-sm">{service.duration} minutes</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={() => setCurrentStep(2)}
                        disabled={!selectedService}
                        className="btn btn-primary"
                      >
                        Next: Choose Provider
                        <ArrowRight size={16} className="ml-1.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
                
                {/* Step 2: Select Provider */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Provider</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {providers.map(provider => (
                        <motion.div
                          key={provider.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedProvider?.id === provider.id 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                          onClick={() => setSelectedProvider(provider)}
                          whileHover={{ y: -3 }}
                        >
                          <div className="flex items-start space-x-4">
                            {provider.imageUrl ? (
                              <img 
                                src={provider.imageUrl} 
                                alt={provider.name} 
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                                <User size={24} className="text-primary-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-medium text-lg">{provider.name}</h3>
                              <p className="text-primary-600">{provider.specialization}</p>
                              <div className="flex items-center mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(provider.rating) ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                    />
                                  </svg>
                                ))}
                                <span className="text-xs text-gray-600 ml-1">
                                  {provider.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="mt-8 flex justify-between">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="btn btn-outline"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setCurrentStep(3)}
                        disabled={!selectedProvider}
                        className="btn btn-primary"
                      >
                        Next: Choose Date
                        <ArrowRight size={16} className="ml-1.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
                
                {/* Step 3: Select Date */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Date</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dateOptions.map(date => (
                        <motion.div
                          key={date.value}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedDate === date.value 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                          onClick={() => setSelectedDate(date.value)}
                          whileHover={{ y: -3 }}
                        >
                          <div className="flex items-center">
                            <Calendar size={20} className="mr-3 text-primary-600" />
                            <span className="font-medium">{date.label}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="mt-8 flex justify-between">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="btn btn-outline"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setCurrentStep(4)}
                        disabled={!selectedDate}
                        className="btn btn-primary"
                      >
                        Next: Choose Time
                        <ArrowRight size={16} className="ml-1.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
                
                {/* Step 4: Select Time */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Time</h2>
                    
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {availableSlots.map(time => (
                          <motion.div
                            key={time}
                            className={`border rounded-lg p-3 cursor-pointer transition-all text-center ${
                              selectedTime === time 
                                ? 'border-primary-500 bg-primary-50' 
                                : 'border-gray-200 hover:border-primary-300'
                            }`}
                            onClick={() => setSelectedTime(time)}
                            whileHover={{ y: -2 }}
                          >
                            <div className="flex justify-center items-center">
                              <Clock size={16} className="mr-1.5 text-primary-600" />
                              <span className="font-medium">{formatTime(time)}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
                        <h3 className="font-medium">No available time slots</h3>
                        <p className="mt-1">There are no available slots for the selected date. Please select a different date.</p>
                      </div>
                    )}
                    
                    <div className="mt-8 flex justify-between">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="btn btn-outline"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setCurrentStep(5)}
                        disabled={!selectedTime}
                        className="btn btn-primary"
                      >
                        Next: Confirm Details
                        <ArrowRight size={16} className="ml-1.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
                
                {/* Step 5: Confirm Booking */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Your Appointment</h2>
                    
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="font-medium text-lg mb-4">Appointment Details</h3>
                      
                      <div className="space-y-4">
                        {selectedService && (
                          <div className="flex">
                            <span className="font-medium w-24">Service:</span>
                            <span className="flex-1">{selectedService.name}</span>
                          </div>
                        )}
                        
                        {selectedProvider && (
                          <div className="flex">
                            <span className="font-medium w-24">Provider:</span>
                            <span className="flex-1">{selectedProvider.name}</span>
                          </div>
                        )}
                        
                        {selectedDate && (
                          <div className="flex">
                            <span className="font-medium w-24">Date:</span>
                            <span className="flex-1">
                              {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
                            </span>
                          </div>
                        )}
                        
                        {selectedTime && (
                          <div className="flex">
                            <span className="font-medium w-24">Time:</span>
                            <span className="flex-1">{formatTime(selectedTime)}</span>
                          </div>
                        )}
                        
                        {selectedService && (
                          <div className="flex">
                            <span className="font-medium w-24">Duration:</span>
                            <span className="flex-1">{selectedService.duration} minutes</span>
                          </div>
                        )}
                        
                        {selectedService && (
                          <div className="flex">
                            <span className="font-medium w-24">Price:</span>
                            <span className="flex-1">${selectedService.price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        <MessageSquare size={16} className="inline mr-1.5" />
                        Notes (optional)
                      </label>
                      <textarea
                        id="notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any special requests or information for your provider..."
                        className="input w-full"
                      ></textarea>
                    </div>
                    
                    <div className="mt-8 flex justify-between">
                      <button
                        onClick={() => setCurrentStep(4)}
                        className="btn btn-outline"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleBookAppointment}
                        disabled={isBooking}
                        className="btn btn-primary"
                      >
                        {isBooking ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Booking...
                          </span>
                        ) : (
                          <>
                            <CheckCircle size={16} className="mr-1.5" />
                            Confirm Booking
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

interface BookingStepProps {
  number: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

const BookingStep: React.FC<BookingStepProps> = ({
  number,
  title,
  isActive,
  isCompleted,
  isDisabled = false,
  onClick
}) => {
  return (
    <button
      className={`flex-1 relative py-4 px-1 sm:px-4 text-center ${
        isDisabled 
          ? 'cursor-not-allowed text-gray-400' 
          : isActive 
            ? 'cursor-default text-primary-600'
            : isCompleted
              ? 'cursor-pointer text-primary-800'
              : 'cursor-pointer text-gray-500 hover:text-gray-700'
      }`}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
    >
      <div className="flex flex-col items-center">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          isActive 
            ? 'bg-primary-100 text-primary-600 border-2 border-primary-500' 
            : isCompleted
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-600'
        }`}>
          {isCompleted ? (
            <CheckCircle size={16} />
          ) : (
            <span className="text-sm font-medium">{number}</span>
          )}
        </div>
        <span className="mt-1 text-sm">{title}</span>
      </div>
      
      {isActive && (
        <motion.div
          layoutId="activeStep"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
        />
      )}
    </button>
  );
};

export default BookAppointmentPage;