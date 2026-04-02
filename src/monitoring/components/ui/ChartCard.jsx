/**
 * Professional Chart Card Component
 * Glassmorphism design with premium chart styling
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  TrendingUp,
  Download,
  Maximize2,
  RefreshCw,
  Settings,
  Info
} from 'lucide-react';

const ChartCard = ({ 
  title, 
  subtitle, 
  icon: Icon,
  children,
  loading = false,
  error = null,
  actions = [],
  className = '',
  height = 'auto',
  showControls = true,
  onRefresh,
  onExport,
  onFullscreen,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const chartRef = useRef(null);

  const defaultActions = [
    {
      icon: RefreshCw,
      label: 'Refresh',
      onClick: onRefresh,
      disabled: loading
    },
    {
      icon: Download,
      label: 'Export',
      onClick: onExport
    },
    {
      icon: Maximize2,
      label: 'Fullscreen',
      onClick: onFullscreen
    }
  ];

  const chartActions = actions.length > 0 ? actions : defaultActions;

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    hover: {
      scale: 1.01,
      boxShadow: '0 20px 40px 0 rgba(31, 38, 135, 0.4)',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const loadingSkeleton = (
    <div className="animate-pulse">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-6 h-6 bg-dark-surface/50 rounded-lg" />
        <div className="h-4 bg-dark-surface/50 rounded w-1/3" />
      </div>
      <div className="h-64 bg-dark-surface/50 rounded-xl" />
    </div>
  );

  const errorState = (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mb-4">
        <Info className="w-8 h-8 text-error" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Chart Error</h3>
      <p className="text-gray-400 text-sm max-w-md">{error}</p>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-error/20 text-error rounded-lg hover:bg-error/30 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );

  return (
    <motion.div
      ref={chartRef}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={`chart-container ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
              <Icon className="w-5 h-5 text-blue-400" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        {showControls && (
          <div className="flex items-center space-x-2">
            <AnimatePresence>
              {isHovered && chartActions.map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`p-2 rounded-lg transition-all ${
                      action.disabled
                        ? 'bg-dark-surface/30 text-gray-600 cursor-not-allowed'
                        : 'bg-dark-surface/50 hover:bg-dark-surface/70 text-gray-400 hover:text-white'
                    }`}
                    title={action.label}
                  >
                    <ActionIcon className="w-4 h-4" />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Chart Content */}
      <div 
        className="relative"
        style={{ height: height === 'auto' ? '300px' : height }}
      >
        {loading && loadingSkeleton}
        
        {!loading && error && errorState}
        
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        )}

        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark-card/80 backdrop-blur-sm rounded-xl flex items-center justify-center"
            >
              <div className="flex flex-col items-center space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                <span className="text-gray-400 text-sm">Loading chart data...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gradient overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-card/20 to-transparent rounded-2xl pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

// Specialized chart cards
export const LineChartCard = ({ title, data, ...props }) => (
  <ChartCard
    title={title}
    icon={LineChart}
    {...props}
  >
    <div className="h-full flex items-center justify-center text-gray-500">
      <LineChart className="w-16 h-16" />
      <span className="ml-3">Line Chart Data</span>
    </div>
  </ChartCard>
);

export const BarChartCard = ({ title, data, ...props }) => (
  <ChartCard
    title={title}
    icon={BarChart3}
    {...props}
  >
    <div className="h-full flex items-center justify-center text-gray-500">
      <BarChart3 className="w-16 h-16" />
      <span className="ml-3">Bar Chart Data</span>
    </div>
  </ChartCard>
);

export const PieChartCard = ({ title, data, ...props }) => (
  <ChartCard
    title={title}
    icon={PieChart}
    {...props}
  >
    <div className="h-full flex items-center justify-center text-gray-500">
      <PieChart className="w-16 h-16" />
      <span className="ml-3">Pie Chart Data</span>
    </div>
  </ChartCard>
);

export const ActivityChartCard = ({ title, data, ...props }) => (
  <ChartCard
    title={title}
    icon={Activity}
    {...props}
  >
    <div className="h-full flex items-center justify-center text-gray-500">
      <Activity className="w-16 h-16" />
      <span className="ml-3">Activity Data</span>
    </div>
  </ChartCard>
);

export const TrendChartCard = ({ title, data, trend, ...props }) => (
  <ChartCard
    title={title}
    icon={TrendingUp}
    subtitle={trend && `Trend: ${trend > 0 ? '+' : ''}${trend}%`}
    {...props}
  >
    <div className="h-full flex items-center justify-center text-gray-500">
      <TrendingUp className="w-16 h-16" />
      <span className="ml-3">Trend Data</span>
    </div>
  </ChartCard>
);

export default ChartCard;
