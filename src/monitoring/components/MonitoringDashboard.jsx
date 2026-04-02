/**
 * Real-Time Monitoring Dashboard
 * Production-level monitoring interface with live updates
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Download,
  Play,
  Pause,
  RefreshCw,
  BarChart3,
  LineChart,
  Radar,
  Bell,
  Settings
} from 'lucide-react';
import MonitoringService from '../services/monitoringService';
import StatusCard from './StatusCard';
import MetricsGrid from './MetricsGrid';
import ChartContainer from '../charts/ChartContainer';
import PhaseComparison from './PhaseComparison';
import SLAValidation from './SLAValidation';
import ExportModal from './ExportModal';
import InteractiveChart from './InteractiveChart';

const MonitoringDashboard = () => {
  const [monitoringService] = useState(() => new MonitoringService());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('UP');
  const [metrics, setMetrics] = useState({
    totalDowntime: 0,
    availability: 100,
    downtimeError: 0,
    lastDowntime: null,
    totalChecks: 0,
    failedChecks: 0,
    monitoringDuration: 0
  });
  const [phaseComparison, setPhaseComparison] = useState(null);
  const [slaValidation, setSlaValidation] = useState(null);
  const [deploymentMode, setDeploymentMode] = useState('blue-green');
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  const updateMetrics = useCallback(() => {
    const status = monitoringService.getCurrentStatus();
    if (status) {
      setCurrentStatus(status.currentStatus);
      setMetrics({
        totalDowntime: status.totalDowntime,
        availability: status.availability,
        downtimeError: status.downtimeError,
        lastDowntime: status.lastDowntime,
        totalChecks: status.totalChecks,
        failedChecks: status.failedChecks,
        monitoringDuration: status.monitoringDuration
      });
    }
  }, [monitoringService]);

  const updatePhaseComparison = useCallback(async () => {
    try {
      const comparison = await monitoringService.comparePhases();
      setPhaseComparison(comparison);
    } catch (err) {
      console.error('Error updating phase comparison:', err);
    }
  }, [monitoringService]);

  const updateSLAValidation = useCallback(async () => {
    try {
      const status = monitoringService.getCurrentStatus();
      if (status) {
        const validation = monitoringService.validateSLA(status);
        setSlaValidation(validation);
      }
    } catch (err) {
      console.error('Error updating SLA validation:', err);
    }
  }, [monitoringService]);

  const handleMonitoringStarted = useCallback(() => {
    setIsMonitoring(true);
    setError(null);
  }, []);

  const handleMonitoringStopped = useCallback(async (data) => {
    setIsMonitoring(false);
    await updatePhaseComparison();
    await updateSLAValidation();
  }, [updatePhaseComparison, updateSLAValidation]);

  const handleDeploymentModeChanged = useCallback((data) => {
    setDeploymentMode(data.mode);
  }, []);

  // Initialize monitoring
  useEffect(() => {
    const initializeMonitoring = async () => {
      try {
        setLoading(true);
        const deployedUrl = window.location.origin;
        await monitoringService.initializeMonitoring(deployedUrl, deploymentMode);
        
        // Set up event listeners
        monitoringService.addListener('monitoringStarted', handleMonitoringStarted);
        monitoringService.addListener('monitoringStopped', handleMonitoringStopped);
        monitoringService.addListener('deploymentModeChanged', handleDeploymentModeChanged);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initializeMonitoring();

    return () => {
      monitoringService.cleanup();
    };
  }, [deploymentMode, handleMonitoringStarted, handleMonitoringStopped, handleDeploymentModeChanged, monitoringService]);

  // Update metrics periodically
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      updateMetrics();
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isMonitoring, updateMetrics]);

  const startMonitoring = async () => {
    try {
      setLoading(true);
      await monitoringService.startMonitoring();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stopMonitoring = async () => {
    try {
      setLoading(true);
      await monitoringService.stopMonitoring();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchDeploymentMode = async (mode) => {
    try {
      setLoading(true);
      monitoringService.switchDeploymentMode(mode);
      setDeploymentMode(mode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      setLoading(true);
      const data = await monitoringService.exportData(format);
      
      // Create download
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monitoring-data-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
      addNotification({
        type: 'success',
        message: `Data exported successfully as ${format.toUpperCase()}`,
        timestamp: new Date()
      });
    } catch (err) {
      setError(err.message);
      addNotification({
        type: 'error',
        message: `Export failed: ${err.message}`,
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 5)); // Keep only 5 latest
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getStatusColor = (status) => {
    return status === 'UP' ? 'text-green-500' : 'text-red-500';
  };

  const getStatusIcon = (status) => {
    return status === 'UP' ? 
      <CheckCircle className="w-8 h-8 text-green-500" /> : 
      <AlertCircle className="w-8 h-8 text-red-500" />;
  };

  if (loading && !isMonitoring) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Initializing monitoring system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                currentStatus === 'UP' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Real-Time Performance Monitoring
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-gray-800 rounded-full text-gray-300 border border-gray-700">
                {deploymentMode === 'blue-green' ? '🔵 Blue-Green' : '⚡ Direct'} Deployment
              </span>
              <span className={`px-3 py-1 rounded-full font-medium ${
                currentStatus === 'UP' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {currentStatus}
              </span>
              <span className="text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Status Indicator */}
            <div className={`flex items-center space-x-2 px-4 py-3 rounded-xl border ${
              currentStatus === 'UP' 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              {getStatusIcon(currentStatus)}
              <span className={`font-semibold ${getStatusColor(currentStatus)}`}>
                System {currentStatus}
              </span>
            </div>

            {/* Control Buttons */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              disabled={loading}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isMonitoring 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/25' 
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/25'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isMonitoring ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Start</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowExportModal(true)}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </motion.button>

            {/* Notifications Button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={notifications.length > 0 ? clearNotifications : undefined}
                className="flex items-center justify-center p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors relative"
                title={notifications.length > 0 ? "Clear notifications" : "No notifications"}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </motion.button>
            </div>

            {/* Settings Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center justify-center p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-400">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Status Cards */}
        <div className="lg:col-span-1">
          <StatusCard
            title="System Status"
            status={currentStatus}
            metrics={metrics}
            isMonitoring={isMonitoring}
          />
        </div>

        {/* Metrics Grid */}
        <div className="lg:col-span-2">
          <MetricsGrid metrics={metrics} />
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-6 mb-8">
        {/* Interactive Real-time Chart */}
        <InteractiveChart
          title="Real-Time Performance Metrics"
          realTime={true}
          height={400}
          onDataPointClick={(point) => {
            addNotification({
              type: 'info',
              message: `Data point: ${point.value.toFixed(2)} at ${point.label}`,
              timestamp: new Date()
            });
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer
            title="Availability Trend"
            icon={<LineChart className="w-5 h-5" />}
            type="line"
            monitoringService={monitoringService}
          />
          
          <ChartContainer
            title="Phase Comparison"
            icon={<BarChart3 className="w-5 h-5" />}
            type="bar"
            phaseComparison={phaseComparison}
          />
          
          <ChartContainer
            title="Performance Metrics"
            icon={<Radar className="w-5 h-5" />}
            type="radar"
            phaseComparison={phaseComparison}
          />
          
          <ChartContainer
            title="Uptime Timeline"
            icon={<Clock className="w-5 h-5" />}
            type="timeline"
            monitoringService={monitoringService}
          />
        </div>
      </div>

      {/* Phase Comparison and SLA Validation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PhaseComparison comparison={phaseComparison} />
        <SLAValidation validation={slaValidation} />
      </div>

      {/* Deployment Mode Switcher */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-800 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold mb-4">Deployment Experiment Mode</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => switchDeploymentMode('direct')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              deploymentMode === 'direct'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Direct Deployment
          </button>
          <button
            onClick={() => switchDeploymentMode('blue-green')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              deploymentMode === 'blue-green'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Blue-Green Deployment
          </button>
        </div>
      </motion.div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        loading={loading}
      />
    </div>
  );
};

export default MonitoringDashboard;
