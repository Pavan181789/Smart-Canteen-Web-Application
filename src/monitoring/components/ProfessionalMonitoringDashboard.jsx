/**
 * Professional Monitoring Dashboard
 * Industry-level monitoring interface with glassmorphism design
 * Similar to Grafana, Firebase Console, Datadog
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import MetricCard, {
  SystemStatusCard,
  AvailabilityCard,
  DowntimeCard,
  ErrorRateCard,
  MonitoringDurationCard
} from './ui/MetricCard';
import StatusIndicator from './ui/StatusIndicator';
import ChartCard from './ui/ChartCard';
import {
  AvailabilityTrendChart,
  PhaseComparisonChart,
  RealTimeActivityChart,
  PerformanceRadarChart
} from './ui/ProfessionalChartCard';
import {
  Activity,
  BarChart3,
  LineChart,
  Radar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  Server,
  Wifi,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react';
import MonitoringService from '../services/monitoringService';

const ProfessionalMonitoringDashboard = () => {
  const { theme, isDarkMode, toggleTheme, colors, gradients } = useTheme();
  const [monitoringService] = useState(() => new MonitoringService());
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('UP');
  const [metrics, setMetrics] = useState({
    totalDowntime: 0,
    availability: 100,
    downtimeError: 0,
    lastDowntime: null,
    totalChecks: 0,
    failedChecks: 0,
    monitoringDuration: 0,
    errorRate: 0,
    responseTime: 0,
    throughput: 0
  });
  const [phaseComparison, setPhaseComparison] = useState(null);
  const [deploymentMode, setDeploymentMode] = useState('blue-green');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Update metrics periodically
  const updateMetrics = useCallback(() => {
    const status = monitoringService.getCurrentStatus();
    if (status) {
      setCurrentStatus(status.currentStatus);
      setMetrics(prev => ({
        ...prev,
        totalDowntime: status.totalDowntime,
        availability: status.availability,
        downtimeError: status.downtimeError,
        lastDowntime: status.lastDowntime,
        totalChecks: status.totalChecks,
        failedChecks: status.failedChecks,
        monitoringDuration: status.monitoringDuration,
        errorRate: status.failedChecks / status.totalChecks * 100 || 0,
        responseTime: Math.random() * 100 + 50, // Simulated
        throughput: Math.random() * 1000 + 500 // Simulated
      }));
      setLastUpdated(new Date());
    }
  }, [monitoringService]);

  // Initialize monitoring
  useEffect(() => {
    const initializeMonitoring = async () => {
      try {
        setLoading(true);
        const deployedUrl = window.location.origin;
        await monitoringService.initializeMonitoring(deployedUrl, deploymentMode);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initializeMonitoring();
    return () => monitoringService.cleanup();
  }, [deploymentMode, monitoringService]);

  // Update metrics periodically
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      updateMetrics();
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isMonitoring, updateMetrics]);

  const startMonitoring = async () => {
    try {
      setLoading(true);
      await monitoringService.startMonitoring();
      setIsMonitoring(true);
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
      setIsMonitoring(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const data = await monitoringService.exportData('json');
      
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monitoring-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    updateMetrics();
  };

  // Loading state
  if (loading && !isMonitoring) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Activity className="w-full h-full text-blue-500" />
          </motion.div>
          <p style={{ color: colors.textSecondary }}>Initializing Professional Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.bg }}>
      {/* Sidebar */}
      <Sidebar
        activeItem={activeNavItem}
        onItemChange={setActiveNavItem}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          title="Cloud Migration Monitoring Dashboard"
          subtitle="Blue-Green Deployment Analysis"
          status={currentStatus}
          lastUpdated={lastUpdated}
          deploymentVersion="2.1.0"
          environment="Production"
          onExport={handleExport}
          onRefresh={handleRefresh}
          onToggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
        />

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SystemStatusCard 
                status={currentStatus} 
                metrics={metrics}
                animationDelay={0}
              />
              <AvailabilityCard 
                availability={metrics.availability}
                target={99.9}
                animationDelay={0.1}
              />
              <DowntimeCard 
                totalDowntime={metrics.totalDowntime}
                animationDelay={0.2}
              />
              <ErrorRateCard 
                errorRate={metrics.errorRate}
                trend={Math.random() * 10 - 5} // Simulated trend
                animationDelay={0.3}
              />
            </div>

            {/* Secondary Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricCard
                title="Response Time"
                value={metrics.responseTime}
                unit="ms"
                icon={Zap}
                status={metrics.responseTime < 100 ? 'success' : 'warning'}
                description="Average response time"
                trend={-5.2}
                animationDelay={0.4}
              />
              <MetricCard
                title="Throughput"
                value={metrics.throughput}
                unit="req/s"
                icon={Server}
                status="success"
                description="Requests per second"
                trend={12.3}
                animationDelay={0.5}
              />
              <MonitoringDurationCard 
                duration={metrics.monitoringDuration}
                animationDelay={0.6}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AvailabilityTrendChart
                loading={loading}
                onRefresh={handleRefresh}
                onExport={handleExport}
              />
              <PhaseComparisonChart
                loading={loading}
                onRefresh={handleRefresh}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RealTimeActivityChart
                loading={loading}
                height="250px"
              />
              <PerformanceRadarChart
                loading={loading}
                height="250px"
              />
              <ChartCard
                title="System Health"
                subtitle="Overall system status"
                icon={CheckCircle}
                loading={loading}
                height="250px"
              >
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <StatusIndicator
                    status={currentStatus}
                    variant="pill"
                    size="large"
                    animated={true}
                  />
                  <div className="text-center">
                    <p style={{ color: colors.text }} className="font-semibold">
                      {currentStatus === 'UP' ? 'All Systems Operational' : 'System Issues Detected'}
                    </p>
                    <p style={{ color: colors.textSecondary }} className="text-sm mt-1">
                      Last checked: {lastUpdated.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* Control Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
                Control Panel
              </h3>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={isMonitoring ? stopMonitoring : startMonitoring}
                  disabled={loading}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isMonitoring 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25' 
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRefresh}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25"
                >
                  Refresh Data
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExport}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/25"
                >
                  Export Report
                </motion.button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfessionalMonitoringDashboard;
