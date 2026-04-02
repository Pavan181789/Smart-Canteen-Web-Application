/**
 * SLA Validation Component
 * Validates Service Level Agreement compliance
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Target,
  Shield,
  Clock,
  Zap
} from 'lucide-react';

const SLAValidation = ({ validation }) => {
  if (!validation) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6">SLA Validation</h2>
        <div className="text-center text-gray-500 py-8">
          <div className="text-6xl mb-4">🎯</div>
          <p>Complete monitoring to validate SLA compliance</p>
        </div>
      </motion.div>
    );
  }

  const slaThresholds = {
    availability: { threshold: 95, weight: 40 },
    downtime: { threshold: 5, weight: 35 },
    lcp: { threshold: 2.5, weight: 25 }
  };

  const SLACriterion = ({ 
    title, 
    current, 
    threshold, 
    unit, 
    passed, 
    icon, 
    weight,
    description 
  }) => {
    const getPercentage = () => {
      if (threshold === 0) return 100;
      return Math.min((current / threshold) * 100, 100);
    };

    const getStatusColor = () => {
      if (passed) return 'text-green-400';
      return 'text-red-400';
    };

    const getProgressColor = () => {
      if (passed) return 'bg-green-500';
      return 'bg-red-500';
    };

    const percentage = getPercentage();

    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gray-700/30 rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-1 rounded ${passed ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
              {icon}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-300">{title}</h4>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
          <div className={`p-1 rounded ${passed ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
            {passed ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Current</span>
            <span className={`font-bold ${getStatusColor()}`}>
              {typeof current === 'number' ? current.toFixed(2) : current}{unit}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Target</span>
            <span className="text-gray-300">
              ≤{threshold}{unit}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Compliance</span>
              <span>{percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-2 rounded-full ${getProgressColor()}`}
              />
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Weight: {weight}%
          </div>
        </div>
      </motion.div>
    );
  };

  const OverallSLAStatus = () => {
    const getStatusColor = () => {
      if (validation.slaScore >= 90) return 'text-green-400';
      if (validation.slaScore >= 70) return 'text-yellow-400';
      return 'text-red-400';
    };

    const getStatusBg = () => {
      if (validation.slaScore >= 90) return 'bg-green-900/20';
      if (validation.slaScore >= 70) return 'bg-yellow-900/20';
      return 'bg-red-900/20';
    };

    const getStatusText = () => {
      if (validation.slaScore >= 90) return 'Excellent';
      if (validation.slaScore >= 70) return 'Good';
      if (validation.slaScore >= 50) return 'Needs Improvement';
      return 'Critical';
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-6 rounded-xl border-2 ${getStatusBg()} border-current`}
      >
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {validation.slaPassed ? (
              <Shield className="w-8 h-8 text-green-400" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-400" />
            )}
          </div>
          
          <div className={`text-3xl font-bold ${getStatusColor()} mb-2`}>
            {validation.slaPassed ? '✅ SLA PASSED' : '❌ SLA FAILED'}
          </div>
          
          <div className={`text-xl font-bold ${getStatusColor()} mb-2`}>
            {validation.slaScore.toFixed(1)}%
          </div>
          
          <div className="text-sm text-gray-400 mb-4">{getStatusText()}</div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className={`font-bold ${validation.availability ? 'text-green-400' : 'text-red-400'}`}>
                {validation.availability ? '✓' : '✗'}
              </div>
              <div className="text-gray-500">Availability</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${validation.downtime ? 'text-green-400' : 'text-red-400'}`}>
                {validation.downtime ? '✓' : '✗'}
              </div>
              <div className="text-gray-500">Downtime</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${validation.lcp ? 'text-green-400' : 'text-red-400'}`}>
                {validation.lcp ? '✓' : '✗'}
              </div>
              <div className="text-gray-500">Performance</div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">SLA Validation</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Target className="w-4 h-4" />
          <span>Service Level Agreement</span>
        </div>
      </div>

      {/* Overall Status */}
      <div className="mb-6">
        <OverallSLAStatus />
      </div>

      {/* SLA Criteria */}
      <div className="space-y-4">
        <SLACriterion
          title="Availability"
          current={validation.metrics?.availability || 0}
          threshold={slaThresholds.availability.threshold}
          unit="%"
          passed={validation.availability}
          icon={<Shield className="w-4 h-4" />}
          weight={slaThresholds.availability.weight}
          description="System must be available 95% of the time"
        />

        <SLACriterion
          title="Downtime"
          current={validation.metrics?.downtime || 0}
          threshold={slaThresholds.downtime.threshold}
          unit=" min"
          passed={validation.downtime}
          icon={<Clock className="w-4 h-4" />}
          weight={slaThresholds.downtime.weight}
          description="Total downtime must not exceed 5 minutes"
        />

        <SLACriterion
          title="Performance (LCP)"
          current={validation.metrics?.lcp || 0}
          threshold={slaThresholds.lcp.threshold}
          unit="s"
          passed={validation.lcp}
          icon={<Zap className="w-4 h-4" />}
          weight={slaThresholds.lcp.weight}
          description="Largest Contentful Paint must be under 2.5 seconds"
        />
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 bg-gray-700/30 rounded-lg"
      >
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Recommendations</h4>
        <div className="space-y-2 text-xs text-gray-400">
          {!validation.availability && (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span>Improve system availability to meet 95% target</span>
            </div>
          )}
          {!validation.downtime && (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span>Reduce downtime to under 5 minutes</span>
            </div>
          )}
          {!validation.lcp && (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span>Optimize page load performance</span>
            </div>
          )}
          {validation.slaPassed && (
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>All SLA criteria met. Maintain current performance levels.</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SLAValidation;
