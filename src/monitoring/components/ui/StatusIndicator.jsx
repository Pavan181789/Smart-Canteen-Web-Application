/**
 * Professional Status Indicator Component
 * Animated status indicators with glassmorphism design
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Wifi,
  WifiOff,
  Zap,
  Clock
} from 'lucide-react';

const StatusIndicator = ({ 
  status, 
  size = 'medium', 
  showText = true, 
  animated = true,
  variant = 'default',
  customText = null
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'UP':
      case 'LIVE':
      case 'OPERATIONAL':
      case 'SUCCESS':
        return {
          color: 'success',
          bgColor: 'bg-success/20',
          borderColor: 'border-success/50',
          textColor: 'text-success',
          icon: CheckCircle,
          text: customText || 'System Operational',
          pulseColor: 'rgba(16, 185, 129, 0.6)',
          gradient: 'from-success to-emerald-600'
        };
      case 'DOWN':
      case 'FAILURE':
      case 'ERROR':
      case 'CRITICAL':
        return {
          color: 'error',
          bgColor: 'bg-error/20',
          borderColor: 'border-error/50',
          textColor: 'text-error',
          icon: XCircle,
          text: customText || 'System Failure',
          pulseColor: 'rgba(239, 68, 68, 0.6)',
          gradient: 'from-error to-red-600'
        };
      case 'WARNING':
      case 'DEGRADED':
      case 'ISSUE':
        return {
          color: 'warning',
          bgColor: 'bg-warning/20',
          borderColor: 'border-warning/50',
          textColor: 'text-warning',
          icon: AlertTriangle,
          text: customText || 'System Warning',
          pulseColor: 'rgba(245, 158, 11, 0.6)',
          gradient: 'from-warning to-amber-600'
        };
      case 'LOADING':
      case 'PENDING':
      case 'CONNECTING':
        return {
          color: 'info',
          bgColor: 'bg-info/20',
          borderColor: 'border-info/50',
          textColor: 'text-info',
          icon: Activity,
          text: customText || 'Loading...',
          pulseColor: 'rgba(59, 130, 246, 0.6)',
          gradient: 'from-info to-blue-600'
        };
      default:
        return {
          color: 'gray',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/50',
          textColor: 'text-gray-400',
          icon: Activity,
          text: customText || 'Unknown Status',
          pulseColor: 'rgba(107, 114, 128, 0.6)',
          gradient: 'from-gray-500 to-gray-600'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'px-3 py-2',
          dot: 'w-2 h-2',
          icon: 'w-4 h-4',
          text: 'text-sm'
        };
      case 'large':
        return {
          container: 'px-6 py-4',
          dot: 'w-4 h-4',
          icon: 'w-8 h-8',
          text: 'text-lg'
        };
      default:
        return {
          container: 'px-4 py-3',
          dot: 'w-3 h-3',
          icon: 'w-6 h-6',
          text: 'text-base'
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = getSizeClasses();
  const Icon = config.icon;

  const pulseVariants = {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: config.color === 'error' ? 1 : 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const renderDefaultVariant = () => (
    <div className={`flex items-center space-x-3 ${sizeClasses.container} rounded-xl border ${config.bgColor} ${config.borderColor}`}>
      {/* Animated dot */}
      <div className="relative">
        {animated ? (
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            className={`${sizeClasses.dot} ${config.color} rounded-full`}
            style={{
              boxShadow: `0 0 20px ${config.pulseColor}`
            }}
          />
        ) : (
          <div className={`${sizeClasses.dot} ${config.color} rounded-full`} />
        )}
      </div>

      {/* Icon */}
      <Icon className={`${sizeClasses.icon} ${config.textColor}`} />

      {/* Text */}
      {showText && (
        <span className={`${sizeClasses.text} ${config.textColor} font-medium`}>
          {config.text}
        </span>
      )}
    </div>
  );

  const renderCompactVariant = () => (
    <div className={`flex items-center space-x-2 ${sizeClasses.container} rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      {/* Animated dot */}
      <div className="relative">
        {animated ? (
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            className={`${sizeClasses.dot} ${config.color} rounded-full`}
            style={{
              boxShadow: `0 0 15px ${config.pulseColor}`
            }}
          />
        ) : (
          <div className={`${sizeClasses.dot} ${config.color} rounded-full`} />
        )}
      </div>

      {/* Text */}
      {showText && (
        <span className={`${sizeClasses.text} ${config.textColor} font-medium`}>
          {config.text}
        </span>
      )}
    </div>
  );

  const renderCardVariant = () => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`glass-card p-6 ${sizeClasses.container} rounded-2xl border ${config.borderColor}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Animated icon with background */}
          <div className={`p-3 rounded-xl ${config.bgColor} ${config.borderColor} relative`}>
            {animated && (
              <motion.div
                className={`absolute inset-0 ${config.color} rounded-xl opacity-20`}
                variants={pulseVariants}
                initial="initial"
                animate="animate"
              />
            )}
            <Icon className={`${sizeClasses.icon} ${config.textColor} relative z-10`} />
          </div>

          <div>
            <h3 className={`font-semibold text-white ${sizeClasses.text}`}>
              {config.text}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {status === 'UP' && 'All systems operational'}
              {status === 'DOWN' && 'Critical services unavailable'}
              {status === 'WARNING' && 'Some services experiencing issues'}
              {status === 'LOADING' && 'System initializing...'}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div className={`px-3 py-1 rounded-lg ${config.bgColor} ${config.borderColor} ${config.textColor} text-xs font-bold uppercase`}>
          {status}
        </div>
      </div>
    </motion.div>
  );

  const renderPillVariant = () => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.gradient} text-white font-medium shadow-lg`}
    >
      {/* Animated dot */}
      {animated && (
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          className={`${sizeClasses.dot} bg-white rounded-full`}
        />
      )}

      {/* Icon */}
      <Icon className={`${sizeClasses.icon} text-white`} />

      {/* Text */}
      {showText && (
        <span className={`${sizeClasses.text} text-white`}>
          {config.text}
        </span>
      )}
    </motion.div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'compact':
        return renderCompactVariant();
      case 'card':
        return renderCardVariant();
      case 'pill':
        return renderPillVariant();
      default:
        return renderDefaultVariant();
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        {renderVariant()}
      </motion.div>
    </AnimatePresence>
  );
};

// Specialized status indicators
export const SystemStatusIndicator = ({ status, ...props }) => (
  <StatusIndicator
    status={status}
    variant="card"
    size="large"
    {...props}
  />
);

export const CompactStatusIndicator = ({ status, ...props }) => (
  <StatusIndicator
    status={status}
    variant="compact"
    size="small"
    {...props}
  />
);

export const PillStatusIndicator = ({ status, ...props }) => (
  <StatusIndicator
    status={status}
    variant="pill"
    size="medium"
    {...props}
  />
);

export const NetworkStatusIndicator = ({ isConnected, ...props }) => (
  <StatusIndicator
    status={isConnected ? 'UP' : 'DOWN'}
    icon={isConnected ? Wifi : WifiOff}
    customText={isConnected ? 'Connected' : 'Disconnected'}
    {...props}
  />
);

export default StatusIndicator;
