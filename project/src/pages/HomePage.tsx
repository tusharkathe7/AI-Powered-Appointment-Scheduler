import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Mic, Bell, Brain, Clock, Shield } from 'lucide-react';
import VoiceInput from '../components/ui/VoiceInput';
import { useAuthStore } from '../store/authStore';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  const handleVoiceCommand = (command: string) => {
    console.log('Voice command received:', command);
    // In a real app, this would process the command and take appropriate action
    // For demo purposes, we'll just log it
  };
  
  return (
    <div>
      {/* Hero section */}
      <section className="bg-gradient-to-br from-primary-50 to-accent-50 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              AI-Powered Appointment Scheduling
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-700 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Schedule appointments using natural voice commands. Our AI assistants handle everything from booking to rescheduling with intelligent conflict resolution.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary text-lg px-8 py-3 rounded-full">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary text-lg px-8 py-3 rounded-full">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn btn-outline text-lg px-8 py-3 rounded-full">
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
            
            {/* Voice command demo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <p className="text-gray-500 mb-3 text-sm">Try saying: "Book me with Dr. Johnson at 2 PM tomorrow"</p>
                <VoiceInput onCommandSubmit={handleVoiceCommand} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Intelligent Scheduling Made Simple</h2>
            <p className="text-xl text-gray-600">
              Our AI-powered platform makes scheduling appointments effortless with cutting-edge features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Mic className="h-8 w-8 text-primary-600" />}
              title="Voice-Driven Scheduling"
              description="Book, reschedule, or cancel appointments by simply talking to our AI assistant. No more complex forms or phone calls."
            />
            
            <FeatureCard 
              icon={<Brain className="h-8 w-8 text-primary-600" />}
              title="Intelligent Conflict Resolution"
              description="Our agentic AI automatically resolves scheduling conflicts and suggests optimal alternatives based on your preferences."
            />
            
            <FeatureCard 
              icon={<Bell className="h-8 w-8 text-primary-600" />}
              title="Smart Notifications"
              description="Receive timely reminders and updates via email or SMS about your appointments, changes, and recommendations."
            />
            
            <FeatureCard 
              icon={<Calendar className="h-8 w-8 text-primary-600" />}
              title="Adaptive Learning"
              description="Our system learns your preferences over time to provide increasingly personalized scheduling recommendations."
            />
            
            <FeatureCard 
              icon={<Clock className="h-8 w-8 text-primary-600" />}
              title="Real-Time Availability"
              description="See provider availability instantly and book appointments without waiting for confirmation."
            />
            
            <FeatureCard 
              icon={<Shield className="h-8 w-8 text-primary-600" />}
              title="Secure & Private"
              description="Your data is always protected with enterprise-grade security and compliance with privacy regulations."
            />
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="bg-accent-600 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to transform your scheduling experience?</h2>
            <p className="text-xl text-accent-100 mb-8">
              Join thousands of users who have simplified their appointment management with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn bg-white text-accent-700 hover:bg-accent-50 text-lg px-8 py-3 rounded-full">
                Sign Up Free
              </Link>
              <Link to="/login" className="btn border-2 border-white text-white hover:bg-accent-700 text-lg px-8 py-3 rounded-full">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <motion.div 
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      whileHover={{ y: -5 }}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

export default HomePage;