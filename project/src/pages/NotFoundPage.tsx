import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <Calendar className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="btn btn-primary inline-flex items-center justify-center"
          >
            <Home size={18} className="mr-1.5" />
            Go Home
          </Link>
          <Link 
            to="/dashboard" 
            className="btn btn-outline inline-flex items-center justify-center"
          >
            Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;