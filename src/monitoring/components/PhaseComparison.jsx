/**
 * Phase Comparison Component
 * Displays comparison between Phase-1 and Phase-2 results
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUp, 
  ArrowDown,
  Award,
  Target
} from 'lucide-react';

const PhaseComparison = ({ comparison }) => {
  if (!comparison) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6">Phase Comparison</h2>
        <div className="text-center text-gray-500 py-8">
          <div className="text-6xl mb-4">⏳</div>
          <p>Complete Phase-2 monitoring to see comparison results</p>
        </div>
      </motion.div>
    );
  }

  const { phase1, phase2, comparison: improvements } = comparison;

  const MetricComparison = ({ label, phase1Value, phase2Value, unit, improvement, inverse = false }) => {
    const getImprovementIcon = () => {
      if (improvement > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
      if (improvement < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
      return <Minus className="w-4 h-4 text-gray-400" />;
    };

    const getImprovementColor = () => {
      if (improvement > 0) return 'text-green-400';
      if (improvement < 0) return 'text-red-400';
      return 'text-gray-400';
    };

    const formatValue = (value) => {
      if (typeof value === 'number') {
        return value.toFixed(2);
      }
      return value;
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-700/30 rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-300">{label}</h4>
          {getImprovementIcon()}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Phase-1</div>
            <div className="text-lg font-bold text-blue-400">
              {formatValue(phase1Value)}{unit}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Phase-2</div>
            <div className="text-lg font-bold text-green-400">
              {formatValue(phase2Value)}{unit}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
          <span className="text-xs text-gray-400">Improvement</span>
          <span className={`text-sm font-bold ${getImprovementColor()}`}>
            {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
          </span>
        </div>
      </motion.div>
    );
  };

  const OverallScore = () => {
    const scores = [
      { metric: 'Downtime', score: improvements.downtimeReduction, weight: 0.3 },
      { metric: 'Availability', score: improvements.availabilityImprovement, weight: 0.3 },
      { metric: 'Error Rate', score: improvements.errorReduction, weight: 0.2 },
      { metric: 'Performance', score: improvements.lcpImprovement, weight: 0.2 }
    ];

    const weightedScore = scores.reduce((total, { score, weight }) => {
      return total + (score * weight);
    }, 0);

    const getGrade = (score) => {
      if (score >= 70) return { grade: 'A', color: 'text-green-400', bg: 'bg-green-900/20' };
      if (score >= 50) return { grade: 'B', color: 'text-blue-400', bg: 'bg-blue-900/20' };
      if (score >= 30) return { grade: 'C', color: 'text-yellow-400', bg: 'bg-yellow-900/20' };
      return { grade: 'D', color: 'text-red-400', bg: 'bg-red-900/20' };
    };

    const { grade, color, bg } = getGrade(weightedScore);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className={`p-6 rounded-xl border-2 ${bg} border-current`}
      >
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Award className={`w-8 h-8 ${color}`} />
          </div>
          <div className={`text-4xl font-bold ${color} mb-2`}>{grade}</div>
          <div className="text-sm text-gray-400 mb-2">Overall Improvement</div>
          <div className={`text-2xl font-bold ${color}`}>
            {weightedScore > 0 ? '+' : ''}{weightedScore.toFixed(1)}%
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
        <h2 className="text-xl font-bold text-white">Phase Comparison</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Target className="w-4 h-4" />
          <span>Performance Analysis</span>
        </div>
      </div>

      {/* Overall Score */}
      <div className="mb-6">
        <OverallScore />
      </div>

      {/* Detailed Comparisons */}
      <div className="space-y-4">
        <MetricComparison
          label="Downtime Reduction"
          phase1Value={phase1.downtime}
          phase2Value={phase2.downtime}
          unit=" min"
          improvement={improvements.downtimeReduction}
          inverse={true} // Lower is better
        />

        <MetricComparison
          label="Availability Improvement"
          phase1Value={phase1.availability}
          phase2Value={phase2.availability}
          unit="%"
          improvement={improvements.availabilityImprovement}
        />

        <MetricComparison
          label="Error Rate Reduction"
          phase1Value={phase1.error}
          phase2Value={phase2.error}
          unit="%"
          improvement={improvements.errorReduction}
          inverse={true} // Lower is better
        />

        <MetricComparison
          label="LCP Performance"
          phase1Value={phase1.lcp}
          phase2Value={phase2.lcp}
          unit="s"
          improvement={improvements.lcpImprovement}
          inverse={true} // Lower is better
        />
      </div>

      {/* Key Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-gray-700/30 rounded-lg"
      >
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Key Insights</h4>
        <div className="space-y-2 text-xs text-gray-400">
          {improvements.downtimeReduction > 50 && (
            <div className="flex items-center space-x-2">
              <ArrowUp className="w-3 h-3 text-green-400" />
              <span>Significant downtime reduction achieved</span>
            </div>
          )}
          {improvements.availabilityImprovement > 10 && (
            <div className="flex items-center space-x-2">
              <ArrowUp className="w-3 h-3 text-green-400" />
              <span>Major availability improvement</span>
            </div>
          )}
          {improvements.errorReduction > 50 && (
            <div className="flex items-center space-x-2">
              <ArrowUp className="w-3 h-3 text-green-400" />
              <span>Error rate significantly reduced</span>
            </div>
          )}
          {improvements.lcpImprovement > 20 && (
            <div className="flex items-center space-x-2">
              <ArrowUp className="w-3 h-3 text-green-400" />
              <span>Page load performance enhanced</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PhaseComparison;
