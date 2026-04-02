/**
 * Professional Header Component
 * Glassmorphism design with status indicators and controls
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Settings,
  Download,
  Moon,
  Sun,
  RefreshCw,
  Activity,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  User
} from 'lucide-react';

const Header = ({ 
  title, 
  subtitle, 
  status, 
  lastUpdated, 
  deploymentVersion,
  environment,
  onExport,
  onRefresh,
  onToggleTheme,
  isDarkMode
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusIndicator = () => {
    switch (status) {
      case 'UP':
      case 'LIVE':
        return {
          icon: CheckCircle,
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/30',
          pulseColor: 'bg-success',
          text: 'System Operational'
        };
      case 'DOWN':
        return {
          icon: AlertTriangle,
          color: 'text-error',
          bgColor: 'bg-error/10',
          borderColor: 'border-error/30',
          pulseColor: 'bg-error',
          text: 'System Failure'
        };
      default:
        return {
          icon: Activity,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/30',
          pulseColor: 'bg-warning',
          text: 'System Warning'
        };
    }
  };

  const statusInfo = getStatusIndicator();
  const StatusIcon = statusInfo.icon;

  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'System Recovery',
      message: 'All services are now operational',
      time: '2 minutes ago'
    },
    {
      id: 2,
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Memory usage exceeded 80%',
      time: '15 minutes ago'
    },
    {
      id: 3,
      type: 'info',
      title: 'Deployment Complete',
      message: 'Version 2.1.0 deployed successfully',
      time: '1 hour ago'
    }
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-b border-glass-border sticky top-0 z-30"
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Title and Status */}
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${statusInfo.pulseColor} animate-pulse`} />
                <h1 className="text-3xl font-bold gradient-text">{title}</h1>
              </div>
              
              {/* Status Badge */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 rounded-full border ${statusInfo.bgColor} ${statusInfo.borderColor} ${statusInfo.color} font-medium flex items-center space-x-2`}
              >
                <StatusIcon className="w-4 h-4" />
                <span>{statusInfo.text}</span>
              </motion.div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center space-x-2">
                <span className="text-gray-500">Environment:</span>
                <span className={`px-2 py-1 rounded-lg font-medium ${
                  environment === 'Production' 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {environment}
                </span>
              </span>
              
              <span className="flex items-center space-x-2">
                <span className="text-gray-500">Version:</span>
                <span className="px-2 py-1 bg-dark-surface/50 rounded-lg font-mono">
                  {deploymentVersion}
                </span>
              </span>
              
              <span className="flex items-center space-x-2">
                <span className="text-gray-500">Last updated:</span>
                <span className="text-gray-300">
                  {currentTime.toLocaleTimeString()}
                </span>
              </span>
            </div>
          </div>

          {/* Right Section - Controls */}
          <div className="flex items-center space-x-3">
            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              className="p-3 rounded-xl bg-dark-surface/50 hover:bg-dark-surface/70 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </motion.button>

            {/* Export Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExport}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleTheme}
              className="p-3 rounded-xl bg-dark-surface/50 hover:bg-dark-surface/70 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-400" />
              )}
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 rounded-xl bg-dark-surface/50 hover:bg-dark-surface/70 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-400" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full text-xs flex items-center justify-center text-white">
                    {notifications.length}
                  </span>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 glass-card border border-glass-border rounded-xl shadow-2xl"
                  >
                    <div className="p-4 border-b border-glass-border">
                      <h3 className="font-semibold text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-glass-border hover:bg-dark-surface/30 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'success' ? 'bg-success' :
                              notification.type === 'warning' ? 'bg-warning' :
                              'bg-info'
                            }`} />
                            <div className="flex-1">
                              <p className="font-medium text-white text-sm">
                                {notification.title}
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                {notification.message}
                              </p>
                              <p className="text-gray-500 text-xs mt-2">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 p-2 rounded-xl bg-dark-surface/50 hover:bg-dark-surface/70 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 glass-card border border-glass-border rounded-xl shadow-2xl"
                  >
                    <div className="p-4 border-b border-glass-border">
                      <p className="font-medium text-white">Admin User</p>
                      <p className="text-xs text-gray-400">admin@monitoring.com</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-dark-surface/50 transition-colors text-gray-300 hover:text-white">
                        Profile Settings
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-dark-surface/50 transition-colors text-gray-300 hover:text-white">
                        Preferences
                      </button>
                      <hr className="my-2 border-glass-border" />
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-dark-surface/50 transition-colors text-error hover:text-error">
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
