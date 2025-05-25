import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Plus, ChevronRight, Mic } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { useAppointmentStore } from '../../store/appointmentStore';
import { useNotificationStore } from '../../store/notificationStore';
import AppointmentCard from '../../components/ui/AppointmentCard';
import VoiceInput from '../../components/ui/VoiceInput';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { appointments, fetchAppointments, isLoading: appointmentsLoading } = useAppointmentStore();
  const { notifications, fetchNotifications, isLoading: notificationsLoading } = useNotificationStore();
  
  useEffect(() => {
    fetchAppointments();
    fetchNotifications();
  }, []);
  
  const upcomingAppointments = appointments
    .filter(app => new Date(app.date) >= new Date() && app.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
  
  const recentNotifications = notifications.slice(0, 3);
  
  const handleVoiceCommand = (command: string) => {
    console.log('Voice command received:', command);
    // In a real app, this would process the command using AI
    // and take appropriate action (book appointment, reschedule, etc.)
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.fullName.split(' ')[0]}</h1>
        <p className="text-gray-600 mt-1">Here's an overview of your appointments and schedule.</p>
      </motion.div>
      
      {/* Voice command section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 mb-8"
      >
        <div className="flex items-center mb-4">
          <Mic className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Voice Assistant</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Use your voice to schedule, reschedule, or cancel appointments. Try saying:
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-white/60 px-3 py-1 rounded-full text-sm text-gray-700">
            "Book an appointment with Dr. Johnson"
          </span>
          <span className="bg-white/60 px-3 py-1 rounded-full text-sm text-gray-700">
            "Reschedule my appointment on Friday"
          </span>
          <span className="bg-white/60 px-3 py-1 rounded-full text-sm text-gray-700">
            "What's my next appointment?"
          </span>
        </div>
        <VoiceInput onCommandSubmit={handleVoiceCommand} />
      </motion.section>
      
      {/* Quick actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <Link to="/book">
          <motion.div 
            className="bg-primary-600 text-white rounded-xl p-6 flex items-center justify-between"
            whileHover={{ y: -5 }}
          >
            <div>
              <h3 className="text-xl font-semibold mb-1">Book Appointment</h3>
              <p className="text-primary-100">Schedule a new appointment</p>
            </div>
            <Plus className="h-8 w-8" />
          </motion.div>
        </Link>
        
        <Link to="/appointments">
          <motion.div 
            className="bg-secondary-600 text-white rounded-xl p-6 flex items-center justify-between"
            whileHover={{ y: -5 }}
          >
            <div>
              <h3 className="text-xl font-semibold mb-1">My Appointments</h3>
              <p className="text-secondary-100">View all your appointments</p>
            </div>
            <Calendar className="h-8 w-8" />
          </motion.div>
        </Link>
        
        <Link to="/settings">
          <motion.div 
            className="bg-accent-600 text-white rounded-xl p-6 flex items-center justify-between"
            whileHover={{ y: -5 }}
          >
            <div>
              <h3 className="text-xl font-semibold mb-1">Account Settings</h3>
              <p className="text-accent-100">Update your preferences</p>
            </div>
            <Clock className="h-8 w-8" />
          </motion.div>
        </Link>
      </motion.section>
      
      {/* Upcoming appointments */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
          <Link 
            to="/appointments" 
            className="text-primary-600 hover:text-primary-800 flex items-center"
          >
            View all <ChevronRight size={16} />
          </Link>
        </div>
        
        {appointmentsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : upcomingAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No upcoming appointments</h3>
            <p className="text-gray-500 mb-4">You don't have any scheduled appointments.</p>
            <Link to="/book" className="btn btn-primary">
              Book an Appointment
            </Link>
          </div>
        )}
      </motion.section>
      
      {/* Recent notifications */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Notifications</h2>
        </div>
        
        {notificationsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : recentNotifications.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {recentNotifications.map((notification, index) => (
              <motion.div 
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 ${index !== recentNotifications.length - 1 ? 'border-b border-gray-200' : ''} ${!notification.isRead ? 'bg-blue-50' : ''}`}
              >
                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                <p className="text-gray-600 text-sm">{notification.message}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {format(parseISO(notification.createdAt), 'MMM d, yyyy • h:mm a')}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No notifications</h3>
            <p className="text-gray-500">You don't have any recent notifications.</p>
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default DashboardPage;