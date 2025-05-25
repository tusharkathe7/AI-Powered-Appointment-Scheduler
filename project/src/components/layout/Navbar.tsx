import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Bell, LogOut, User, Calendar, Home, Settings 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotificationStore();
  
  // Fetch notifications when notifications panel is opened
  const handleNotificationsToggle = () => {
    if (!isNotificationsOpen) {
      fetchNotifications();
    }
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsMenuOpen(false); // Close mobile menu if open
  };
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Calendar className="h-8 w-8 text-accent-600" />
          <span className="font-bold text-xl text-gray-900">AI Scheduler</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/" icon={<Home size={18} />} label="Home" />
          
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" icon={<Calendar size={18} />} label="Dashboard" />
              <NavLink to="/appointments" icon={<Calendar size={18} />} label="Appointments" />
              <NavLink to="/settings" icon={<Settings size={18} />} label="Settings" />
              
              {/* Notifications */}
              <div className="relative">
                <motion.button
                  onClick={handleNotificationsToggle}
                  className="p-2 rounded-full hover:bg-gray-100 relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </motion.button>
                
                {/* Notifications dropdown */}
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-medium">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllAsRead()}
                            className="text-xs text-primary-600 hover:text-primary-800"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                !notification.isRead ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex items-start">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <span className="h-2 w-2 bg-primary-600 rounded-full"></span>
                                )}
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* User menu button */}
              <div className="relative ml-2">
                <motion.div
                  className="flex items-center cursor-pointer"
                  onClick={() => navigate('/settings')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User size={16} className="text-primary-600" />
                  </div>
                </motion.div>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" label="Login" />
              <NavLink to="/register" label="Register" className="btn btn-primary" />
            </>
          )}
        </nav>
        
        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          {isAuthenticated && (
            <motion.button
              onClick={handleNotificationsToggle}
              className="p-2 rounded-full hover:bg-gray-100 relative mr-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </motion.button>
          )}
          
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="container mx-auto px-4 py-3 space-y-1">
              <MobileNavLink to="/" icon={<Home size={18} />} label="Home" onClick={() => setIsMenuOpen(false)} />
              
              {isAuthenticated ? (
                <>
                  <MobileNavLink to="/dashboard" icon={<Calendar size={18} />} label="Dashboard" onClick={() => setIsMenuOpen(false)} />
                  <MobileNavLink to="/appointments" icon={<Calendar size={18} />} label="Appointments" onClick={() => setIsMenuOpen(false)} />
                  <MobileNavLink to="/settings" icon={<User size={18} />} label="Account" onClick={() => setIsMenuOpen(false)} />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2.5 text-gray-600 rounded-md hover:bg-gray-100"
                  >
                    <LogOut size={18} className="mr-2" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink to="/login" label="Login" onClick={() => setIsMenuOpen(false)} />
                  <MobileNavLink to="/register" label="Register" onClick={() => setIsMenuOpen(false)} />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// Desktop navigation link
interface NavLinkProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, label, icon, className }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  return (
    <Link
      to={to}
      className={`${className || 'relative px-3 py-2 rounded-md text-sm font-medium transition-colors'} ${
        isActive 
          ? 'text-primary-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center space-x-1.5">
        {icon}
        <span>{label}</span>
      </div>
      
      {isActive && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute -bottom-1 left-3 right-3 h-0.5 bg-primary-600 rounded-full"
          initial={false}
        />
      )}
    </Link>
  );
};

// Mobile navigation link
interface MobileNavLinkProps extends NavLinkProps {
  onClick?: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, label, icon, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2.5 rounded-md ${
        isActive 
          ? 'bg-primary-50 text-primary-700' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      {icon && <span className="mr-2">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
};

export default Navbar;