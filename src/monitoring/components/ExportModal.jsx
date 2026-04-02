/**
 * Export Modal Component
 * Handles data export in JSON and CSV formats
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ExportModal = ({ isOpen, onClose, onExport, loading }) => {
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [includeHistorical, setIncludeHistorical] = useState(true);
  const [includeComparison, setIncludeComparison] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(false);

  const handleExport = () => {
    const options = {
      format: selectedFormat,
      includeHistorical,
      includeComparison,
      includeCharts
    };
    
    onExport(selectedFormat, options);
  };

  const formatOptions = [
    {
      value: 'json',
      label: 'JSON',
      icon: <FileJson className="w-5 h-5" />,
      description: 'Structured data format for developers',
      features: ['Full data structure', 'Easy to parse', 'Machine readable']
    },
    {
      value: 'csv',
      label: 'CSV',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      description: 'Comma-separated values for spreadsheets',
      features: ['Excel compatible', 'Data analysis', 'Reporting']
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Export Monitoring Data</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Format Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Export Format</h4>
            <div className="space-y-3">
              {formatOptions.map((format) => (
                <motion.div
                  key={format.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedFormat(format.value)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedFormat === format.value
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded ${
                      selectedFormat === format.value ? 'bg-blue-900/50 text-blue-400' : 'bg-gray-600 text-gray-400'
                    }`}>
                      {format.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-white">{format.label}</h5>
                        {selectedFormat === format.value && (
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{format.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {format.features.map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-gray-600/50 rounded text-gray-300"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Include Data</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHistorical}
                  onChange={(e) => setIncludeHistorical(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm text-white">Historical Data</div>
                  <div className="text-xs text-gray-400">All monitoring history and timestamps</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeComparison}
                  onChange={(e) => setIncludeComparison(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm text-white">Phase Comparison</div>
                  <div className="text-xs text-gray-400">Phase-1 vs Phase-2 analysis</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm text-white">Chart Data</div>
                  <div className="text-xs text-gray-400">Raw data for chart generation</div>
                </div>
              </label>
            </div>
          </div>

          {/* File Info */}
          <div className="mb-6 p-3 bg-gray-700/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Export Information</span>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>• File will be downloaded as: monitoring-data-{new Date().toISOString().split('T')[0]}.{selectedFormat}</div>
              <div>• Export contains real-time monitoring data</div>
              <div>• Large datasets may take a few moments to process</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export {selectedFormat.toUpperCase()}</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExportModal;
