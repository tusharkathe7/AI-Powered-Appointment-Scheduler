import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Filter, Search, Plus, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { useAppointmentStore } from '../../store/appointmentStore';
import AppointmentCard from '../../components/ui/AppointmentCard';
import type { Appointment, AppointmentStatus } from '../../types';

const AppointmentsPage: React.FC = () => {
  const { appointments, fetchAppointments, isLoading } = useAppointmentStore();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchAppointments();
  }, []);
  
  const today = new Date();
  
  const filteredAppointments = appointments.filter(appointment => {
    // Apply time filter
    if (filter === 'upcoming' && isBefore(parseISO(appointment.date), today)) {
      return false;
    }
    if (filter === 'past' && isAfter(parseISO(appointment.date), today)) {
      return false;
    }
    if (filter === 'cancelled' && appointment.status !== 'cancelled') {
      return false;
    }
    
    // Apply status filter
    if (statusFilter !== 'all' && appointment.status !== statusFilter) {
      return false;
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const providerName = appointment.provider?.name.toLowerCase() || '';
      const serviceName = appointment.service?.name.toLowerCase() || '';
      const date = format(parseISO(appointment.date), 'MMMM d, yyyy').toLowerCase();
      
      return (
        providerName.includes(query) || 
        serviceName.includes(query) || 
        date.includes(query)
      );
    }
    
    return true;
  });
  
  // Sort appointments by date (newest first for upcoming, oldest first for past)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (filter === 'past') {
      return parseISO(b.date).getTime() - parseISO(a.date).getTime();
    }
    return parseISO(a.date).getTime() - parseISO(b.date).getTime();
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage all your scheduled appointments</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 md:mt-0"
        >
          <Link 
            to="/book" 
            className="btn btn-primary inline-flex items-center"
          >
            <Plus size={18} className="mr-1.5" />
            Book Appointment
          </Link>
        </motion.div>
      </div>
      
      {/* Filters and search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Time period filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Filter size={16} className="inline mr-1" /> Filter by
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'all' 
                    ? 'bg-primary-100 text-primary-800 font-medium' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'upcoming' 
                    ? 'bg-primary-100 text-primary-800 font-medium' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Clock size={14} className="inline mr-1" /> Upcoming
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'past' 
                    ? 'bg-primary-100 text-primary-800 font-medium' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Past
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'cancelled' 
                    ? 'bg-red-100 text-red-800 font-medium' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <XCircle size={14} className="inline mr-1" /> Cancelled
              </button>
            </div>
          </div>
          
          {/* Status filter */}
          <div className="flex-1">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
              className="input py-1 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
          
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                id="search"
                type="text"
                placeholder="Search provider, service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input py-1 pl-9 text-sm"
              />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Appointments list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : sortedAppointments.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {sortedAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <AppointmentCard appointment={appointment} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 rounded-xl p-8 text-center"
        >
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No appointments found</h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? "You don't have any appointments yet." 
              : filter === 'upcoming'
                ? "You don't have any upcoming appointments."
                : filter === 'past'
                  ? "You don't have any past appointments."
                  : "You don't have any cancelled appointments."
            }
          </p>
          <Link to="/book" className="btn btn-primary">
            Book an Appointment
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default AppointmentsPage;