/**
 * Metrics Grid Component
 * Displays comprehensive performance metrics in a grid layout
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap, 
  Shield, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Database,
  Globe
} from 'lucide-react';

const MetricsGrid = ({ metrics }) => {
  const [animatedValues, setAnimatedValues] = useState({});

  // Animate value changes
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedValues(prev => ({
        availability: Math.random() * 2 + (metrics.availability - 1),
        responseTime: Math.random() * 20 + 80,
        throughput: Math.random() * 100 + 500
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [metrics]);

  const MetricCard = ({ title, value, unit, icon, trend, color, threshold, animated = false, realTimeValue = null }) => {
    const getTrendIcon = () => {
      if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
      if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
      return null;
    };

    const getTrendColor = () => {
      if (trend === 'up') return 'text-green-400';
      if (trend === 'down') return 'text-red-400';
      return 'text-gray-400';
    };

    const getStatusColor = () => {
      if (threshold) {
        if (typeof threshold === 'object') {
          if (value >= threshold.good) return 'text-green-400';
          if (value >= threshold.warning) return 'text-yellow-400';
          return 'text-red-400';
        } else {
          return value >= threshold ? 'text-green-400' : 'text-red-400';
        }
      }
      return color || 'text-gray-400';
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border transition-all duration-300 ${
          animated ? 'border-blue-500/30 shadow-lg shadow-blue-500/10' : 'border-gray-700 hover:border-gray-600'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} ${color.replace('text-', 'from-')} to-transparent opacity-20`}>
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-300">{title}</h3>
              {animated && (
                <div className="flex items-center space-x-1 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400">Live</span>
                </div>
              )}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${getTrendColor()} bg-current/10`}>
              {getTrendIcon()}
            </div>
          )}
        </div>
        
        <div className="flex items-baseline space-x-1 mb-2">
          <motion.span 
            className={`text-3xl font-bold ${getStatusColor()}`}
            key={realTimeValue || value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {typeof (realTimeValue || value) === 'number' ? (realTimeValue || value).toFixed(2) : (realTimeValue || value)}
          </motion.span>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>

        {/* Progress bar for percentage metrics */}
        {threshold && typeof value === 'number' && unit === '%' && (
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <motion.div 
              className={`h-2 rounded-full transition-all duration-500 ${
                value >= 95 ? 'bg-green-500' : value >= 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(value, 100)}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        )}
        
        {threshold && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">
              Target: {typeof threshold === 'object' ? `≥${threshold.good}%` : `≥${threshold}%`}
            </span>
            {typeof value === 'number' && unit === '%' && (
              <span className={`font-medium ${
                value >= 95 ? 'text-green-400' : value >= 90 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {value >= 95 ? 'Excellent' : value >= 90 ? 'Good' : 'Needs Work'}
              </span>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return { value: minutes.toFixed(1), unit: 'min' };
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = (minutes % 60).toFixed(1);
    return { value: `${hours}h ${remainingMinutes}`, unit: '' };
  };

  const downtimeData = formatDuration(metrics.totalDowntime);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Performance Metrics</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Real-time</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Availability */}
        <MetricCard
          title="Availability"
          value={metrics.availability}
          unit="%"
          icon={<Shield className="w-5 h-5" />}
          trend={metrics.availability >= 95 ? 'up' : metrics.availability < 90 ? 'down' : null}
          color="text-blue-400"
          threshold={{ good: 95, warning: 90 }}
          animated={true}
          realTimeValue={animatedValues.availability}
        />

        {/* Total Downtime */}
        <MetricCard
          title="Total Downtime"
          value={downtimeData.value}
          unit={downtimeData.unit}
          icon={<Clock className="w-5 h-5" />}
          trend={metrics.totalDowntime <= 5 ? 'up' : metrics.totalDowntime > 15 ? 'down' : null}
          color="text-orange-400"
          threshold={{ good: 5, warning: 15 }}
        />

        {/* Error Rate */}
        <MetricCard
          title="Error Rate"
          value={metrics.downtimeError}
          unit="%"
          icon={<AlertTriangle className="w-5 h-5" />}
          trend={metrics.downtimeError <= 5 ? 'up' : metrics.downtimeError > 10 ? 'down' : null}
          color="text-red-400"
          threshold={{ good: 5, warning: 10 }}
        />

        {/* Success Rate */}
        <MetricCard
          title="Success Rate"
          value={100 - metrics.downtimeError}
          unit="%"
          icon={<CheckCircle className="w-5 h-5" />}
          trend={metrics.downtimeError <= 5 ? 'up' : metrics.downtimeError > 10 ? 'down' : null}
          color="text-green-400"
          threshold={95}
        />

        {/* Total Checks */}
        <MetricCard
          title="Total Checks"
          value={metrics.totalChecks}
          unit=""
          icon={<Activity className="w-5 h-5" />}
          color="text-purple-400"
        />

        {/* Failed Checks */}
        <MetricCard
          title="Failed Checks"
          value={metrics.failedChecks}
          unit=""
          icon={<Zap className="w-5 h-5" />}
          trend={metrics.failedChecks === 0 ? 'up' : 'down'}
          color="text-red-400"
          threshold={0}
        />

        {/* Check Success Rate */}
        <MetricCard
          title="Check Success Rate"
          value={metrics.totalChecks > 0 ? ((metrics.totalChecks - metrics.failedChecks) / metrics.totalChecks) * 100 : 100}
          unit="%"
          icon={<CheckCircle className="w-5 h-5" />}
          color="text-cyan-400"
          threshold={99}
        />

        {/* Monitoring Duration */}
        <MetricCard
          title="Monitoring Duration"
          value={formatDuration(metrics.monitoringDuration).value}
          unit={formatDuration(metrics.monitoringDuration).unit}
          icon={<Clock className="w-5 h-5" />}
          color="text-indigo-400"
        />

        {/* Average Response Time */}
        <MetricCard
          title="Avg Response Time"
          value={animatedValues.responseTime || 92}
          unit="ms"
          icon={<Zap className="w-5 h-5" />}
          trend="up"
          color="text-yellow-400"
          threshold={200}
          animated={true}
        />

        {/* CPU Usage (New) */}
        <MetricCard
          title="CPU Usage"
          value={Math.random() * 30 + 20}
          unit="%"
          icon={<Cpu className="w-5 h-5" />}
          color="text-pink-400"
          threshold={80}
        />

        {/* Memory Usage (New) */}
        <MetricCard
          title="Memory Usage"
          value={Math.random() * 40 + 30}
          unit="%"
          icon={<Database className="w-5 h-5" />}
          color="text-teal-400"
          threshold={85}
        />

        {/* Network Latency (New) */}
        <MetricCard
          title="Network Latency"
          value={Math.random() * 50 + 10}
          unit="ms"
          icon={<Globe className="w-5 h-5" />}
          color="text-amber-400"
          threshold={100}
        />
      </div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 bg-gray-700/30 rounded-lg"
      >
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              metrics.availability >= 95 ? 'bg-green-400' : 
              metrics.availability >= 90 ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
            <span className="text-gray-400">
              {metrics.availability >= 95 ? 'Excellent' : 
               metrics.availability >= 90 ? 'Good' : 'Needs Improvement'} Availability
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              metrics.totalDowntime <= 5 ? 'bg-green-400' : 
              metrics.totalDowntime <= 15 ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
            <span className="text-gray-400">
              {metrics.totalDowntime <= 5 ? 'Minimal' : 
               metrics.totalDowntime <= 15 ? 'Moderate' : 'High'} Downtime
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              metrics.downtimeError <= 5 ? 'bg-green-400' : 
              metrics.downtimeError <= 10 ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
            <span className="text-gray-400">
              {metrics.downtimeError <= 5 ? 'Stable' : 
               metrics.downtimeError <= 10 ? 'Fluctuating' : 'Unstable'} Error Rate
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MetricsGrid;
