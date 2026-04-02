/**
 * Professional Metric Card Component
 * Glassmorphism design with animations and progress indicators
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
  Server,
  Wifi,
  WifiOff
} from 'lucide-react';

const MetricCard = ({ 
  title, 
  value, 
  unit = '', 
  icon: Icon,
  trend = null,
  status = 'normal',
  description,
  progress = null,
  targetValue = null,
  format = 'number',
  animationDelay = 0,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  // Animate value on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = parseFloat(value) / steps;
      let current = 0;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= parseFloat(value)) {
          setDisplayValue(parseFloat(value));
          clearInterval(interval);
        } else {
          setDisplayValue(current);
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    }, animationDelay * 1000);
    
    return () => clearTimeout(timer);
  }, [value, animationDelay]);

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return {
          bg: 'bg-success/10',
          border: 'border-success/30',
          text: 'text-success',
          icon: CheckCircle
        };
      case 'warning':
        return {
          bg: 'bg-warning/10',
          border: 'border-warning/30',
          text: 'text-warning',
          icon: AlertTriangle
        };
      case 'error':
        return {
          bg: 'bg-error/10',
          border: 'border-error/30',
          text: 'text-error',
          icon: AlertTriangle
        };
      default:
        return {
          bg: 'bg-info/10',
          border: 'border-info/30',
          text: 'text-info',
          icon: Activity
        };
    }
  };

  const statusConfig = getStatusColor();
  const StatusIcon = statusConfig.icon;

  const formatValue = (val) => {
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'time':
        const hours = Math.floor(val / 3600);
        const minutes = Math.floor((val % 3600) / 60);
        const seconds = Math.floor(val % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
      case 'bytes':
        if (val < 1024) return `${val} B`;
        if (val < 1024 * 1024) return `${(val / 1024).toFixed(1)} KB`;
        return `${(val / (1024 * 1024)).toFixed(1)} MB`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend > 0 ? TrendingUp : TrendingDown;
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 20px 40px 0 rgba(31, 38, 135, 0.5)'
      }}
      onClick={onClick}
      className={`metric-card cursor-pointer ${onClick ? 'hover:scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}>
              {Icon ? <Icon className="w-6 h-6" /> : <StatusIcon className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">{title}</h3>
              {description && (
                <p className="text-gray-400 text-sm mt-1">{description}</p>
              )}
            </div>
          </div>
          
          {/* Status indicator */}
          <div className={`px-2 py-1 rounded-lg ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text} text-xs font-medium`}>
            {status.toUpperCase()}
          </div>
        </div>

        {/* Value Display */}
        <div className="mb-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">
              {formatValue(displayValue)}
            </span>
            {unit && (
              <span className="text-gray-400 text-lg">{unit}</span>
            )}
          </div>
          
          {/* Target comparison */}
          {targetValue && (
            <div className="text-sm text-gray-400 mt-1">
              Target: {formatValue(targetValue)} {unit}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {progress !== null && (
          <div className="mb-4">
            <div className="progress-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1.5, delay: animationDelay + 0.5 }}
                className="progress-fill"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Trend Indicator */}
        {trend !== null && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {TrendIcon && (
                <div className={`p-1 rounded ${trend > 0 ? 'text-success' : 'text-error'}`}>
                  <TrendIcon className="w-4 h-4" />
                </div>
              )}
              <span className={`text-sm font-medium ${trend > 0 ? 'text-success' : 'text-error'}`}>
                {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
              </span>
              <span className="text-gray-400 text-sm">vs last period</span>
            </div>
          </div>
        )}

        {/* Hover effect overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent rounded-2xl pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Specialized metric cards
export const SystemStatusCard = ({ status, metrics }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'UP':
      case 'LIVE':
        return {
          icon: Wifi,
          color: 'success',
          text: 'System Operational',
          description: 'All systems running normally'
        };
      case 'DOWN':
        return {
          icon: WifiOff,
          color: 'error',
          text: 'System Failure',
          description: 'Critical services unavailable'
        };
      default:
        return {
          icon: Activity,
          color: 'warning',
          text: 'System Warning',
          description: 'Some services experiencing issues'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <MetricCard
      title="System Status"
      value={config.text}
      icon={config.icon}
      status={config.color}
      description={config.description}
      format="text"
    />
  );
};

export const AvailabilityCard = ({ availability, target = 99.9 }) => {
  return (
    <MetricCard
      title="Availability"
      value={availability}
      unit="%"
      icon={CheckCircle}
      status={availability >= target ? 'success' : availability >= 95 ? 'warning' : 'error'}
      description="Uptime percentage"
      progress={availability}
      targetValue={target}
      format="percentage"
    />
  );
};

export const DowntimeCard = ({ totalDowntime }) => {
  return (
    <MetricCard
      title="Total Downtime"
      value={totalDowntime}
      icon={Clock}
      status={totalDowntime === 0 ? 'success' : totalDowntime < 300 ? 'warning' : 'error'}
      description="Cumulative downtime"
      format="time"
    />
  );
};

export const ErrorRateCard = ({ errorRate, trend }) => {
  return (
    <MetricCard
      title="Error Rate"
      value={errorRate}
      unit="%"
      icon={AlertTriangle}
      status={errorRate < 1 ? 'success' : errorRate < 5 ? 'warning' : 'error'}
      description="Percentage of failed requests"
      trend={trend}
      format="percentage"
    />
  );
};

export const MonitoringDurationCard = ({ duration }) => {
  return (
    <MetricCard
      title="Monitoring Duration"
      value={duration}
      icon={Activity}
      status="normal"
      description="Time since monitoring started"
      format="time"
    />
  );
};

export default MetricCard;
