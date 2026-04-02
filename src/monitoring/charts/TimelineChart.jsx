/**
 * Timeline Chart Component
 * Custom timeline visualization for UP/DOWN status over time
 */

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const TimelineChart = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);

    // Draw axes
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Calculate bar width
    const barWidth = chartWidth / data.labels.length;

    // Find maximum value for scaling
    const maxValue = Math.max(
      ...data.datasets.flatMap(dataset => dataset.data)
    );

    // Draw bars
    data.labels.forEach((label, index) => {
      const x = padding + (index * barWidth);
      
      // Draw UP bar (green)
      const upValue = data.datasets[0].data[index];
      const upHeight = (upValue / maxValue) * chartHeight;
      const upY = canvas.height - padding - upHeight;
      
      ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.fillRect(x + barWidth * 0.1, upY, barWidth * 0.35, upHeight);
      
      // Draw DOWN bar (red)
      const downValue = data.datasets[1].data[index];
      const downHeight = (downValue / maxValue) * chartHeight;
      const downY = canvas.height - padding - downHeight;
      
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.fillRect(x + barWidth * 0.55, downY, barWidth * 0.35, downHeight);

      // Draw x-axis labels (every 5th label to avoid crowding)
      if (index % 5 === 0) {
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + barWidth / 2, canvas.height - padding + 20);
      }
    });

    // Draw y-axis labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue / 5) * i;
      const y = canvas.height - padding - ((i / 5) * chartHeight);
      ctx.fillText(Math.round(value), padding - 10, y + 3);
      
      // Draw grid lines
      if (i > 0) {
        ctx.strokeStyle = 'rgba(55, 65, 81, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
      }
    }

    // Draw legend
    const legendY = 20;
    const legendX = canvas.width - 150;
    
    // UP legend
    ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('UP', legendX + 20, legendY + 12);
    
    // DOWN legend
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.fillRect(legendX + 50, legendY, 15, 15);
    ctx.fillStyle = '#9CA3AF';
    ctx.fillText('DOWN', legendX + 70, legendY + 12);

  }, [data]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default TimelineChart;
