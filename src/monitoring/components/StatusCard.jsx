/**
 * Status Card Component
 * Displays current system status with animated indicators
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle,
  Zap,
  Shield
} from 'lucide-react';

const StatusCard = ({ title, status, metrics, isMonitoring }) => {
  const getStatusColor = (status) => {
    return status === 'UP' ? 'text-green-500' : 'text-red-500';
  };

  const getStatusBg = (status) => {
    return status === 'UP' ? 'bg-green-900/20' : 'bg-red-900/20';
  };

  const getStatusBorder = (status) => {
    return status === 'UP' ? 'border-green-500' : 'border-red-500';
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes.toFixed(1)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = (minutes % 60).toFixed(1);
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-gray-800 rounded-xl p-6 border-2 ${getStatusBorder(status)} ${getStatusBg(status)}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <div className="flex items-center space-x-2">
          {isMonitoring && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Activity className="w-5 h-5 text-blue-500" />
            </motion.div>
          )}
          <motion.div
            animate={{ 
              scale: status === 'UP' ? [1, 1.1, 1] : [1, 0.9, 1],
              opacity: status === 'UP' ? 1 : 0.8
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {status === 'UP' ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Status Display */}
      <div className="text-center mb-6">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-3xl font-bold ${getStatusColor(status)}`}
        >
          {status === 'UP' ? '🟢 SYSTEM LIVE' : '🔴 SYSTEM DOWN'}
        </motion.div>
        <p className="text-gray-400 mt-2">
          {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="space-y-4">
        {/* Availability */}
        <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300">Availability</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`font-semibold ${
              metrics.availability >= 95 ? 'text-green-400' : 
              metrics.availability >= 90 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {formatPercentage(metrics.availability)}
            </span>
            {metrics.availability >= 95 && (
              <TrendingUp className="w-4 h-4 text-green-400" />
            )}
            {metrics.availability < 90 && (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>

        {/* Total Downtime */}
        <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-gray-300">Total Downtime</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`font-semibold ${
              metrics.totalDowntime <= 5 ? 'text-green-400' : 
              metrics.totalDowntime <= 15 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {formatDuration(metrics.totalDowntime)}
            </span>
            {metrics.totalDowntime > 15 && (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>

        {/* Error Rate */}
        <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">Error Rate</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`font-semibold ${
              metrics.downtimeError <= 5 ? 'text-green-400' : 
              metrics.downtimeError <= 10 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {formatPercentage(metrics.downtimeError)}
            </span>
            {metrics.downtimeError > 10 && (
              <TrendingUp className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>

        {/* Monitoring Duration */}
        <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300">Monitoring Duration</span>
          </div>
          <span className="font-semibold text-cyan-400">
            {formatDuration(metrics.monitoringDuration)}
          </span>
        </div>

        {/* Check Statistics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-gray-700/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-400">
              {metrics.totalChecks}
            </div>
            <div className="text-xs text-gray-400">Total Checks</div>
          </div>
          <div className="p-3 bg-gray-700/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-400">
              {metrics.failedChecks}
            </div>
            <div className="text-xs text-gray-400">Failed Checks</div>
          </div>
        </div>

        {/* Last Downtime */}
        {metrics.lastDowntime && (
          <div className="p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-gray-300">Last Downtime</span>
            </div>
            <div className="text-sm text-red-400">
              Duration: {formatDuration(metrics.lastDowntime.duration)}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(metrics.lastDowntime.startTime).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Live Indicator */}
      {isMonitoring && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-400"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
          <span>Live Monitoring Active</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StatusCard;
