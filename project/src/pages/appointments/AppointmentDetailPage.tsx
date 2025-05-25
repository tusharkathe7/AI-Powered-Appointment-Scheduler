import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MapPin, ArrowLeft, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAppointmentStore } from '../../store/appointmentStore';
import type { Appointment } from '../../types';

const AppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { 
    appointments, 
    getAppointmentById, 
    fetchAppointments,
    cancelAppointment,
    isLoading 
  } = useAppointmentStore();
  
  useEffect(() => {
    if (appointments.length === 0) {
      fetchAppointments();
    }
  }, []);
  
  const appointment = id ? getAppointmentById(id) : undefined;
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!appointment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start mb-4">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Appointment not found</p>
            <p className="mt-1">The appointment you are looking for does not exist or has been deleted.</p>
          </div>
        </div>
        <Link to="/appointments" className="btn btn-outline flex items-center w-fit">
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Appointments
        </Link>
      </div>
    );
  }
  
  const handleCancelAppointment = async () => {
    if (!appointment) return;
    
    setIsCancelling(true);
    try {
      await cancelAppointment(appointment.id);
      setShowCancelDialog(false);
      setShowConfirmation(true);
      
      // Hide confirmation after 3 seconds and navigate back
      setTimeout(() => {
        navigate('/appointments');
      }, 3000);
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    } finally {
      setIsCancelling(false);
    }
  };
  
  const formattedDate = appointment.date ? format(parseISO(appointment.date), 'EEEE, MMMM d, yyyy') : '';
  
  // Parse time strings to proper date objects
  const startTimeObj = new Date();
  const endTimeObj = new Date();
  const [startHours, startMinutes] = appointment.startTime.split(':').map(Number);
  const [endHours, endMinutes] = appointment.endTime.split(':').map(Number);
  startTimeObj.setHours(startHours, startMinutes);
  endTimeObj.setHours(endHours, endMinutes);
  
  // Format times
  const formattedStartTime = format(startTimeObj, 'h:mm a');
  const formattedEndTime = format(endTimeObj, 'h:mm a');
  
  const isUpcoming = new Date(appointment.date) >= new Date() && appointment.status !== 'cancelled';
  const canCancel = isUpcoming && (appointment.status === 'scheduled' || appointment.status === 'confirmed');
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Link to="/appointments" className="text-primary-600 hover:text-primary-800 flex items-center">
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Appointments
        </Link>
      </motion.div>
      
      {/* Success confirmation */}
      {showConfirmation && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start mb-6"
        >
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Appointment Cancelled</p>
            <p className="mt-1">Your appointment has been successfully cancelled. You will be redirected shortly.</p>
          </div>
        </motion.div>
      )}
      
      {/* Appointment Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8"
      >
        {/* Status bar */}
        <div className={`py-3 px-6 ${getStatusColor(appointment.status)}`}>
          <span className="text-lg font-semibold">
            {getStatusLabel(appointment.status)}
          </span>
        </div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Appointment Details</h1>
          
          {/* Date and time */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Date & Time</h2>
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-primary-600 mr-3 mt-0.5" />
              <div>
                <p className="text-gray-900 font-medium">{formattedDate}</p>
                <p className="text-gray-600 flex items-center mt-1">
                  <Clock className="h-4 w-4 text-gray-500 mr-1.5" />
                  {formattedStartTime} - {formattedEndTime}
                </p>
              </div>
            </div>
          </div>
          
          {/* Provider */}
          {appointment.provider && (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Provider</h2>
              <div className="flex items-start">
                {appointment.provider.imageUrl ? (
                  <img 
                    src={appointment.provider.imageUrl} 
                    alt={appointment.provider.name} 
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <User size={24} className="text-primary-600" />
                  </div>
                )}
                <div>
                  <p className="text-gray-900 font-medium">{appointment.provider.name}</p>
                  <p className="text-gray-600">{appointment.provider.specialization}</p>
                  <p className="text-sm text-gray-500 mt-1">{appointment.provider.bio}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Service */}
          {appointment.service && (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Service</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-900 font-medium">{appointment.service.name}</p>
                <p className="text-gray-600 text-sm mt-1">{appointment.service.description}</p>
                <div className="flex flex-wrap gap-4 mt-3">
                  <div>
                    <span className="text-sm text-gray-500">Duration</span>
                    <p className="font-medium text-gray-900">{appointment.service.duration} minutes</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Price</span>
                    <p className="font-medium text-gray-900">${appointment.service.price}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Notes */}
          {appointment.notes && (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Notes</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700">{appointment.notes}</p>
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-8">
            {canCancel && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="btn border border-red-300 bg-white text-red-600 hover:bg-red-50"
              >
                <XCircle size={16} className="mr-1.5" />
                Cancel Appointment
              </button>
            )}
            
            {isUpcoming && appointment.status !== 'cancelled' && (
              <Link to={`/appointments/${appointment.id}/reschedule`} className="btn btn-outline">
                Reschedule
              </Link>
            )}
            
            <Link to="/appointments" className="btn btn-outline">
              Back to Appointments
            </Link>
          </div>
        </div>
      </motion.div>
      
      {/* Cancel appointment dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Appointment</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel your appointment on <span className="font-medium">{formattedDate}</span> at <span className="font-medium">{formattedStartTime}</span>?
            </p>
            
            <div className="mb-4">
              <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for cancellation (optional)
              </label>
              <textarea
                id="cancel-reason"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="input w-full"
                placeholder="Please provide a reason for cancellation..."
              ></textarea>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="btn btn-outline order-2 sm:order-1"
                disabled={isCancelling}
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancelAppointment}
                className="btn bg-red-600 text-white hover:bg-red-700 order-1 sm:order-2"
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <XCircle size={16} className="mr-1.5" />
                    Confirm Cancellation
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Helper functions for status display
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'no-show':
      return 'bg-yellow-100 text-yellow-800';
    case 'rescheduled':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return 'Scheduled';
    case 'confirmed':
      return 'Confirmed';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'no-show':
      return 'No Show';
    case 'rescheduled':
      return 'Rescheduled';
    default:
      return 'Unknown';
  }
};

export default AppointmentDetailPage;