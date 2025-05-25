import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { format, parse } from 'date-fns';
import { Link } from 'react-router-dom';
import type { Appointment } from '../../types';

interface AppointmentCardProps {
  appointment: Appointment;
  compact?: boolean;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  'no-show': 'bg-yellow-100 text-yellow-800',
  rescheduled: 'bg-purple-100 text-purple-800',
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, compact = false }) => {
  const {
    id,
    date,
    startTime,
    endTime,
    status,
    provider,
    service,
  } = appointment;

  // Format date and time
  const formattedDate = format(new Date(date), 'MMM d, yyyy');
  
  // Parse time strings to proper date objects
  const startTimeObj = parse(startTime, 'HH:mm', new Date());
  const endTimeObj = parse(endTime, 'HH:mm', new Date());
  
  // Format times
  const formattedStartTime = format(startTimeObj, 'h:mm a');
  const formattedEndTime = format(endTimeObj, 'h:mm a');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card overflow-hidden ${compact ? 'p-3' : 'p-4'}`}
      whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
    >
      {/* Status badge */}
      <div className="flex justify-between items-start mb-3">
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        
        {!compact && (
          <Link to={`/appointments/${id}`}>
            <motion.button 
              className="text-primary-600 hover:text-primary-800"
              whileHover={{ x: 5 }}
            >
              <ArrowRight size={18} />
            </motion.button>
          </Link>
        )}
      </div>
      
      {/* Date and Time */}
      <div className="flex items-center mb-3 text-gray-600">
        <Calendar size={16} className="mr-1.5" />
        <span className="text-sm">{formattedDate}</span>
        <span className="mx-1.5">•</span>
        <Clock size={16} className="mr-1.5" />
        <span className="text-sm">{formattedStartTime} - {formattedEndTime}</span>
      </div>
      
      {/* Provider */}
      {provider && (
        <div className="flex items-center gap-3 mb-3">
          {provider.imageUrl ? (
            <img 
              src={provider.imageUrl} 
              alt={provider.name} 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User size={20} className="text-primary-600" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{provider.name}</p>
            <p className="text-sm text-gray-500">{provider.specialization}</p>
          </div>
        </div>
      )}
      
      {/* Service */}
      {service && !compact && (
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-700">{service.name}</p>
          <p className="text-sm text-gray-500">{service.duration} minutes</p>
        </div>
      )}
      
      {/* Actions for compact mode */}
      {compact && (
        <Link to={`/appointments/${id}`} className="mt-2 block">
          <motion.button 
            className="btn btn-outline text-xs py-1 px-2 w-full"
            whileHover={{ scale: 1.02 }}
          >
            View Details
          </motion.button>
        </Link>
      )}
    </motion.div>
  );
};

export default AppointmentCard;