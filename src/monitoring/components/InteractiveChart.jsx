/**
 * Interactive Chart Component
 * Enhanced chart with zoom, pan, and real-time data streaming
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Download, 
  TrendingUp,
  Activity,
  Clock,
  Play,
  Pause
} from 'lucide-react';

const InteractiveChart = ({ 
  title, 
  data = [], 
  type = 'line', 
  height = 300,
  realTime = false,
  onDataPointClick,
  color = '#3B82F6'
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [timeRange, setTimeRange] = useState('1h'); // 1h, 6h, 24h, 7d
  const canvasRef = useRef(null);

  // Generate mock real-time data
  const generateRealTimeData = useCallback(() => {
    const now = Date.now();
    return Array.from({ length: 50 }, (_, i) => ({
      timestamp: now - (49 - i) * 2000,
      value: Math.random() * 20 + 80,
      label: new Date(now - (49 - i) * 2000).toLocaleTimeString()
    }));
  }, []);

  const [chartData, setChartData] = useState(data.length > 0 ? data : generateRealTimeData());

  // Update data in real-time
  useEffect(() => {
    if (realTime && !isPaused) {
      const interval = setInterval(() => {
        setChartData(prev => {
          const newData = [...prev.slice(1), {
            timestamp: Date.now(),
            value: Math.random() * 20 + 80,
            label: new Date().toLocaleTimeString()
          }];
          return newData;
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [realTime, isPaused]);

  // Draw chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = (canvas.height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = (canvas.width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw data
    if (chartData.length > 0) {
      const padding = 40;
      const chartWidth = canvas.width - padding * 2;
      const chartHeight = canvas.height - padding * 2;
      
      const maxValue = Math.max(...chartData.map(d => d.value));
      const minValue = Math.min(...chartData.map(d => d.value));
      const valueRange = maxValue - minValue || 1;

      // Draw line chart
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      chartData.forEach((point, index) => {
        const x = padding + (chartWidth / (chartData.length - 1)) * index;
        const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw gradient fill
      const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
      gradient.addColorStop(0, color + '40');
      gradient.addColorStop(1, color + '00');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      
      chartData.forEach((point, index) => {
        const x = padding + (chartWidth / (chartData.length - 1)) * index;
        const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.lineTo(padding + chartWidth, canvas.height - padding);
      ctx.lineTo(padding, canvas.height - padding);
      ctx.closePath();
      ctx.fill();

      // Draw data points
      chartData.forEach((point, index) => {
        const x = padding + (chartWidth / (chartData.length - 1)) * index;
        const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Highlight selected point
        if (selectedPoint === index) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    }

    // Draw axes labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px sans-serif';
    
    // Y-axis labels
    const maxValue = Math.max(...chartData.map(d => d.value));
    for (let i = 0; i <= 5; i++) {
      const value = maxValue - (maxValue / 5) * i;
      const y = (canvas.height / 5) * i;
      ctx.fillText(value.toFixed(1), 5, y + 4);
    }

  }, [chartData, color, selectedPoint, zoomLevel, panOffset]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;

    // Find closest data point
    const index = Math.round(((x - padding) / chartWidth) * (chartData.length - 1));
    
    if (index >= 0 && index < chartData.length) {
      setSelectedPoint(index);
      if (onDataPointClick) {
        onDataPointClick(chartData[index], index);
      }
    }
  };

  const exportChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 m-0' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {realTime && (
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Activity className="w-4 h-4" />
              <span>Live</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Time Range Selector */}
          {realTime && (
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="1h">1 Hour</option>
              <option value="6h">6 Hours</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
            </select>
          )}

          {/* Control Buttons */}
          {realTime && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetZoom}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportChart}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          >
            <Download className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="p-6">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full cursor-crosshair"
          style={{ height: isFullscreen ? 'calc(100vh - 200px)' : `${height}px` }}
        />
      </div>

      {/* Selected Point Info */}
      {selectedPoint !== null && chartData[selectedPoint] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pb-6"
        >
          <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                  {chartData[selectedPoint].label}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-white">
                  {chartData[selectedPoint].value.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default InteractiveChart;
