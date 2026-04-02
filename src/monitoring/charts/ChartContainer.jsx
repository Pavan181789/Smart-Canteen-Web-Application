/**
 * Chart Container Component
 * Wrapper for different chart types with Chart.js integration
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';
import TimelineChart from './TimelineChart';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartContainer = ({ title, icon, type, monitoringService, phaseComparison }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadChartData();

    if (type === 'line' || type === 'timeline') {
      // Set up real-time updates for line and timeline charts
      intervalRef.current = setInterval(() => {
        loadChartData();
      }, 5000); // Update every 5 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [type, monitoringService, phaseComparison]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      
      switch (type) {
        case 'line':
          await loadLineChartData();
          break;
        case 'bar':
          await loadBarChartData();
          break;
        case 'radar':
          await loadRadarChartData();
          break;
        case 'timeline':
          await loadTimelineChartData();
          break;
        default:
          setChartData(null);
      }
    } catch (error) {
      console.error(`Error loading ${type} chart data:`, error);
    } finally {
      setLoading(false);
    }
  };

  const loadLineChartData = async () => {
    if (!monitoringService) return;

    const historicalData = await monitoringService.getHistoricalData(20);
    
    const labels = historicalData.map(record => 
      new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
    
    const availabilityData = historicalData.map(record => record.availability);
    const errorData = historicalData.map(record => record.downtimeError);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Availability %',
          data: availabilityData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Error Rate %',
          data: errorData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    });
  };

  const loadBarChartData = async () => {
    if (!phaseComparison) {
      // Generate sample data if no comparison available
      setChartData({
        labels: ['Downtime (min)', 'Availability (%)', 'Error Rate (%)', 'LCP (s)'],
        datasets: [
          {
            label: 'Phase-1',
            data: [10.09, 83.18, 16.82, 2.8],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2
          },
          {
            label: 'Phase-2',
            data: [2.87, 95.21, 4.79, 1.2],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 2
          }
        ]
      });
      return;
    }

    setChartData({
      labels: ['Downtime (min)', 'Availability (%)', 'Error Rate (%)', 'LCP (s)'],
      datasets: [
        {
          label: 'Phase-1',
          data: [
            phaseComparison.phase1.downtime,
            phaseComparison.phase1.availability,
            phaseComparison.phase1.error,
            phaseComparison.phase1.lcp
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2
        },
        {
          label: 'Phase-2',
          data: [
            phaseComparison.phase2.downtime,
            phaseComparison.phase2.availability,
            phaseComparison.phase2.error,
            phaseComparison.phase2.lcp
          ],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2
        }
      ]
    });
  };

  const loadRadarChartData = async () => {
    if (!phaseComparison) {
      // Generate sample data
      setChartData({
        labels: ['Availability', 'Performance', 'Reliability', 'Error Control', 'Response Time'],
        datasets: [
          {
            label: 'Phase-1',
            data: [83.18, 71.4, 83.18, 83.18, 70],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgb(59, 130, 246)',
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(59, 130, 246)'
          },
          {
            label: 'Phase-2',
            data: [95.21, 91.7, 95.21, 95.21, 85],
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            borderColor: 'rgb(34, 197, 94)',
            pointBackgroundColor: 'rgb(34, 197, 94)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(34, 197, 94)'
          }
        ]
      });
      return;
    }

    const calculatePerformanceScore = (lcp) => {
      // LCP performance score (inverse relationship)
      return Math.max(0, 100 - (lcp * 20));
    };

    const calculateResponseTime = (apiDelay) => {
      // Response time score (lower is better)
      return Math.max(0, 100 - (apiDelay / 10));
    };

    setChartData({
      labels: ['Availability', 'Performance', 'Reliability', 'Error Control', 'Response Time'],
      datasets: [
        {
          label: 'Phase-1',
          data: [
            phaseComparison.phase1.availability,
            calculatePerformanceScore(phaseComparison.phase1.lcp),
            phaseComparison.phase1.availability,
            100 - phaseComparison.phase1.error,
            70 // Sample response time score
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)',
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(59, 130, 246)'
        },
        {
          label: 'Phase-2',
          data: [
            phaseComparison.phase2.availability,
            calculatePerformanceScore(phaseComparison.phase2.lcp),
            phaseComparison.phase2.availability,
            100 - phaseComparison.phase2.error,
            calculateResponseTime(phaseComparison.phase2.apiResponseDelay || 100)
          ],
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgb(34, 197, 94)',
          pointBackgroundColor: 'rgb(34, 197, 94)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(34, 197, 94)'
        }
      ]
    });
  };

  const loadTimelineChartData = async () => {
    if (!monitoringService) return;

    const status = monitoringService.getCurrentStatus();
    if (!status || !status.pingHistory) return;

    // Get last 60 minutes of ping history
    const now = new Date();
    const sixtyMinutesAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentPings = status.pingHistory.filter(ping => 
      new Date(ping.timestamp) >= sixtyMinutesAgo
    );

    // Create timeline data (1-minute intervals)
    const timelineData = [];
    for (let i = 59; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 1000);
      const pingsInMinute = recentPings.filter(ping => {
        const pingTime = new Date(ping.timestamp);
        return pingTime >= time && pingTime < new Date(time.getTime() + 60 * 1000);
      });

      const upCount = pingsInMinute.filter(ping => ping.status === 'UP').length;
      const downCount = pingsInMinute.filter(ping => ping.status === 'DOWN').length;
      
      timelineData.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        up: upCount,
        down: downCount,
        status: upCount > downCount ? 'UP' : downCount > upCount ? 'DOWN' : 'UNKNOWN'
      });
    }

    setChartData({
      labels: timelineData.map(d => d.time),
      datasets: [
        {
          label: 'UP',
          data: timelineData.map(d => d.up),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        },
        {
          label: 'DOWN',
          data: timelineData.map(d => d.down),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1
        }
      ]
    });
  };

  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'rgb(156, 163, 175)',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleColor: 'rgb(243, 244, 246)',
          bodyColor: 'rgb(156, 163, 175)',
          borderColor: 'rgb(55, 65, 81)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(55, 65, 81, 0.5)'
          },
          ticks: {
            color: 'rgb(156, 163, 175)'
          }
        },
        y: {
          grid: {
            color: 'rgba(55, 65, 81, 0.5)'
          },
          ticks: {
            color: 'rgb(156, 163, 175)'
          }
        }
      }
    };

    // Type-specific options
    if (type === 'radar') {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'rgb(156, 163, 175)'
            }
          }
        },
        scales: {
          r: {
            angleLines: {
              color: 'rgba(55, 65, 81, 0.5)'
            },
            grid: {
              color: 'rgba(55, 65, 81, 0.5)'
            },
            pointLabels: {
              color: 'rgb(156, 163, 175)'
            },
            ticks: {
              color: 'rgb(156, 163, 175)',
              backdropColor: 'transparent'
            }
          }
        }
      };
    }

    if (type === 'timeline') {
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          title: {
            display: true,
            text: 'Last 60 Minutes',
            color: 'rgb(156, 163, 175)'
          }
        },
        scales: {
          ...baseOptions.scales,
          x: {
            ...baseOptions.scales.x,
            stacked: true
          },
          y: {
            ...baseOptions.scales.y,
            stacked: true,
            title: {
              display: true,
              text: 'Ping Count',
              color: 'rgb(156, 163, 175)'
            }
          }
        }
      };
    }

    return baseOptions;
  };

  const renderChart = () => {
    if (!chartData) return null;

    switch (type) {
      case 'line':
        return <Line data={chartData} options={getChartOptions()} />;
      case 'bar':
        return <Bar data={chartData} options={getChartOptions()} />;
      case 'radar':
        return <Radar data={chartData} options={getChartOptions()} />;
      case 'timeline':
        return <TimelineChart data={chartData} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-700 rounded-lg text-blue-400">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        
        {loading && (
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Loading...</span>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="relative h-80">
        {chartData ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p>No data available</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChartContainer;
