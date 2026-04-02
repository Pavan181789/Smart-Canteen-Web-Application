/**
 * Performance Optimization Hook
 * Provides performance monitoring and optimization utilities
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export const usePerformanceOptimization = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    frameRate: 0,
    networkLatency: 0
  });
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationIdRef = useRef(null);

  // Measure render performance
  const measureRenderTime = useCallback(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const renderTime = end - start;
      
      setMetrics(prev => ({
        ...prev,
        renderTime: Math.max(prev.renderTime, renderTime)
      }));
      
      return renderTime;
    };
  }, []);

  // Monitor memory usage
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memoryInfo = performance.memory;
      const usedMemory = memoryInfo.usedJSHeapSize / 1024 / 1024; // MB
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage: usedMemory
      }));
      
      return usedMemory;
    }
    return 0;
  }, []);

  // Monitor frame rate
  const measureFrameRate = useCallback(() => {
    const measure = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTimeRef.current;
      
      if (deltaTime >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
        
        setMetrics(prev => ({
          ...prev,
          frameRate: fps
        }));
        
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }
      
      animationIdRef.current = requestAnimationFrame(measure);
    };
    
    animationIdRef.current = requestAnimationFrame(measure);
  }, []);

  // Measure network latency
  const measureNetworkLatency = useCallback(async () => {
    const start = performance.now();
    
    try {
      await fetch('/api/health', { method: 'HEAD' });
      const end = performance.now();
      const latency = end - start;
      
      setMetrics(prev => ({
        ...prev,
        networkLatency: Math.round(latency)
      }));
      
      return latency;
    } catch (error) {
      console.error('Network latency measurement failed:', error);
      return 0;
    }
  }, []);

  // Debounce function for performance
  const debounce = useCallback((func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // Throttle function for performance
  const throttle = useCallback((func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  // Virtual scroll helper
  const createVirtualScrollConfig = useCallback((itemHeight, containerHeight, totalItems) => {
    return {
      itemHeight,
      containerHeight,
      totalItems,
      visibleCount: Math.ceil(containerHeight / itemHeight) + 2,
      startIndex: 0,
      endIndex: Math.ceil(containerHeight / itemHeight) + 1
    };
  }, []);

  // Memoization helper
  const memoize = useCallback((fn) => {
    const cache = new Map();
    
    return (...args) => {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  }, []);

  // Performance monitoring setup
  useEffect(() => {
    measureFrameRate();
    
    const memoryInterval = setInterval(measureMemoryUsage, 5000);
    const networkInterval = setInterval(measureNetworkLatency, 10000);
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      clearInterval(memoryInterval);
      clearInterval(networkInterval);
    };
  }, [measureFrameRate, measureMemoryUsage, measureNetworkLatency]);

  // Performance recommendations
  const getPerformanceRecommendations = useCallback(() => {
    const recommendations = [];
    
    if (metrics.renderTime > 16) {
      recommendations.push({
        type: 'warning',
        message: 'High render time detected. Consider optimizing components.',
        action: 'Use useMemo, useCallback, or React.memo'
      });
    }
    
    if (metrics.memoryUsage > 100) {
      recommendations.push({
        type: 'error',
        message: 'High memory usage detected. Check for memory leaks.',
        action: 'Review event listeners and intervals'
      });
    }
    
    if (metrics.frameRate < 30) {
      recommendations.push({
        type: 'warning',
        message: 'Low frame rate detected. Optimize animations.',
        action: 'Use CSS transforms or reduce animation complexity'
      });
    }
    
    if (metrics.networkLatency > 500) {
      recommendations.push({
        type: 'info',
        message: 'High network latency detected.',
        action: 'Consider implementing caching or request optimization'
      });
    }
    
    return recommendations;
  }, [metrics]);

  return {
    metrics,
    measureRenderTime,
    measureMemoryUsage,
    measureFrameRate,
    measureNetworkLatency,
    debounce,
    throttle,
    createVirtualScrollConfig,
    memoize,
    getPerformanceRecommendations
  };
};

export default usePerformanceOptimization;
