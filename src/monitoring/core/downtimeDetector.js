/**
 * Advanced Downtime Detection System
 * Pings deployed URL every 2 seconds and records downtime events
 */

class DowntimeDetector {
  constructor(url, pingInterval = 2000) {
    this.url = url;
    this.pingInterval = pingInterval;
    this.isMonitoring = false;
    this.currentStatus = 'UP';
    this.downtimeEvents = [];
    this.currentDowntimeStart = null;
    this.totalDowntime = 0;
    this.totalChecks = 0;
    this.failedChecks = 0;
    this.pingHistory = [];
    this.monitoringStartTime = null;
    this.intervalId = null;
    
    // Performance tracking
    this.performanceMetrics = {
      lcp: 0,
      pageLoadTime: 0,
      apiResponseDelay: 0,
      lastMeasured: null
    };
  }

  /**
   * Start monitoring the deployed URL
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.warn('Monitoring already active');
      return;
    }

    console.log(`🚀 Starting downtime detection for: ${this.url}`);
    this.isMonitoring = true;
    this.monitoringStartTime = new Date();
    
    // Initial ping
    this.ping();
    
    // Set up interval for continuous monitoring
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.pingInterval);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      console.warn('Monitoring not active');
      return;
    }

    console.log('⏹️ Stopping downtime detection');
    this.isMonitoring = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Close any ongoing downtime event
    if (this.currentStatus === 'DOWN') {
      this.endDowntime();
    }
  }

  /**
   * Single ping operation
   */
  async ping() {
    const startTime = performance.now();
    this.totalChecks++;

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(this.url, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      const responseTime = performance.now() - startTime;
      
      // Update API response delay
      this.performanceMetrics.apiResponseDelay = responseTime;
      
      // Record ping history
      this.pingHistory.push({
        timestamp: new Date(),
        status: 'UP',
        responseTime,
        success: true
      });

      // Keep only last 100 pings for memory efficiency
      if (this.pingHistory.length > 100) {
        this.pingHistory = this.pingHistory.slice(-100);
      }

      if (this.currentStatus === 'DOWN') {
        this.endDowntime();
      }

      this.currentStatus = 'UP';
      
    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.failedChecks++;

      // Record failed ping
      this.pingHistory.push({
        timestamp: new Date(),
        status: 'DOWN',
        responseTime,
        success: false,
        error: error.message
      });

      if (this.pingHistory.length > 100) {
        this.pingHistory = this.pingHistory.slice(-100);
      }

      if (this.currentStatus === 'UP') {
        this.startDowntime();
      }

      this.currentStatus = 'DOWN';
      console.warn(`❌ Ping failed: ${error.message}`);
    }
  }

  /**
   * Start recording a downtime event
   */
  startDowntime() {
    this.currentDowntimeStart = new Date();
    console.log(`🔴 Downtime started at: ${this.currentDowntimeStart.toISOString()}`);
  }

  /**
   * End recording a downtime event
   */
  endDowntime() {
    if (!this.currentDowntimeStart) return;

    const endTime = new Date();
    const duration = endTime - this.currentDowntimeStart;
    const durationMinutes = duration / (1000 * 60);

    const downtimeEvent = {
      status: 'DOWN',
      startTime: this.currentDowntimeStart.toISOString(),
      endTime: endTime.toISOString(),
      duration: durationMinutes,
      durationMs: duration
    };

    this.downtimeEvents.push(downtimeEvent);
    this.totalDowntime += durationMinutes;

    console.log(`🟢 Downtime ended. Duration: ${durationMinutes.toFixed(2)} minutes`);
    
    this.currentDowntimeStart = null;
  }

  /**
   * Calculate current availability percentage
   */
  getAvailability() {
    if (this.totalChecks === 0) return 100;
    
    const successfulChecks = this.totalChecks - this.failedChecks;
    return (successfulChecks / this.totalChecks) * 100;
  }

  /**
   * Calculate downtime error percentage
   */
  getDowntimeError() {
    if (this.totalChecks === 0) return 0;
    return (this.failedChecks / this.totalChecks) * 100;
  }

  /**
   * Get last downtime event
   */
  getLastDowntime() {
    if (this.downtimeEvents.length === 0) return null;
    return this.downtimeEvents[this.downtimeEvents.length - 1];
  }

  /**
   * Get monitoring summary
   */
  getMonitoringSummary() {
    const now = new Date();
    const monitoringDuration = this.monitoringStartTime ? 
      (now - this.monitoringStartTime) / (1000 * 60) : 0; // in minutes

    return {
      currentStatus: this.currentStatus,
      totalDowntime: this.totalDowntime,
      availability: this.getAvailability(),
      downtimeError: this.getDowntimeError(),
      lastDowntime: this.getLastDowntime(),
      totalChecks: this.totalChecks,
      failedChecks: this.failedChecks,
      monitoringDuration,
      monitoringStartTime: this.monitoringStartTime,
      downtimeEvents: [...this.downtimeEvents],
      pingHistory: [...this.pingHistory],
      performanceMetrics: { ...this.performanceMetrics }
    };
  }

  /**
   * Measure LCP (Largest Contentful Paint)
   */
  measureLCP() {
    return new Promise((resolve) => {
      if (!('PerformanceObserver' in window)) {
        resolve(0);
        return;
      }

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.performanceMetrics.lcp = lastEntry.startTime;
        this.performanceMetrics.lastMeasured = new Date();
        resolve(lastEntry.startTime);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Fallback timeout
      setTimeout(() => {
        observer.disconnect();
        resolve(this.performanceMetrics.lcp || 0);
      }, 5000);
    });
  }

  /**
   * Measure page load time
   */
  measurePageLoadTime() {
    if (typeof performance !== 'undefined' && performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.performanceMetrics.pageLoadTime = loadTime;
      this.performanceMetrics.lastMeasured = new Date();
      return loadTime;
    }
    return 0;
  }

  /**
   * Export monitoring data
   */
  exportData() {
    return {
      summary: this.getMonitoringSummary(),
      downtimeEvents: this.downtimeEvents,
      pingHistory: this.pingHistory,
      performanceMetrics: this.performanceMetrics,
      exportTimestamp: new Date().toISOString()
    };
  }

  /**
   * Reset monitoring data
   */
  reset() {
    this.downtimeEvents = [];
    this.currentDowntimeStart = null;
    this.totalDowntime = 0;
    this.totalChecks = 0;
    this.failedChecks = 0;
    this.pingHistory = [];
    this.monitoringStartTime = null;
    this.currentStatus = 'UP';
  }
}

export default DowntimeDetector;
