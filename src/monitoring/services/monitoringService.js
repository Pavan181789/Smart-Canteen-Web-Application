/**
 * Monitoring Service - Central service for all monitoring operations
 * Integrates with Firestore for data persistence
 */

import { db } from '../../firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import DowntimeDetector from '../core/downtimeDetector';

class MonitoringService {
  constructor() {
    this.detector = null;
    this.currentPhase = 'Phase-2';
    this.isMonitoring = false;
    this.listeners = [];
    
    // Phase-1 baseline data (as provided)
    this.phase1Data = {
      phase: 'Phase-1',
      downtime: 10.09,
      availability: 83.18,
      error: 16.82,
      lcp: 2.8,
      timestamp: new Date('2026-03-30T00:00:00Z')
    };
  }

  /**
   * Initialize monitoring for a specific URL
   */
  async initializeMonitoring(url, deploymentMode = 'blue-green') {
    console.log(`🔧 Initializing monitoring for ${url} in ${deploymentMode} mode`);
    
    this.detector = new DowntimeDetector(url);
    this.deploymentMode = deploymentMode;
    
    // Measure initial performance metrics
    await this.measureInitialPerformance();
    
    return this.detector;
  }

  /**
   * Start monitoring session
   */
  startMonitoring() {
    if (!this.detector) {
      throw new Error('Detector not initialized. Call initializeMonitoring first.');
    }

    console.log(`🚀 Starting ${this.currentPhase} monitoring`);
    this.isMonitoring = true;
    this.detector.startMonitoring();
    
    // Start periodic data storage
    this.startDataStorage();
    
    // Notify listeners
    this.notifyListeners('monitoringStarted', { phase: this.currentPhase });
  }

  /**
   * Stop monitoring session
   */
  async stopMonitoring() {
    if (!this.detector || !this.isMonitoring) {
      return;
    }

    console.log(`⏹️ Stopping ${this.currentPhase} monitoring`);
    this.isMonitoring = false;
    this.detector.stopMonitoring();
    
    // Store final results
    await this.storeMonitoringResults();
    
    // Notify listeners
    this.notifyListeners('monitoringStopped', { 
      phase: this.currentPhase,
      results: this.detector.getMonitoringSummary()
    });
  }

  /**
   * Store monitoring data to Firestore periodically
   */
  startDataStorage() {
    if (!this.isMonitoring) return;
    
    this.storageInterval = setInterval(async () => {
      if (this.detector && this.isMonitoring) {
        await this.storeMonitoringData();
      }
    }, 30000); // Store every 30 seconds
  }

  /**
   * Store monitoring data to Firestore
   */
  async storeMonitoringData() {
    try {
      const summary = this.detector.getMonitoringSummary();
      
      const docRef = await addDoc(collection(db, 'monitoring_data'), {
        phase: this.currentPhase,
        deploymentMode: this.deploymentMode,
        timestamp: Timestamp.now(),
        ...summary
      });
      
      console.log(`📊 Monitoring data stored: ${docRef.id}`);
    } catch (error) {
      console.error('❌ Error storing monitoring data:', error);
    }
  }

  /**
   * Store final monitoring results
   */
  async storeMonitoringResults() {
    try {
      const summary = this.detector.getMonitoringSummary();
      const phase2Data = {
        phase: this.currentPhase,
        deploymentMode: this.deploymentMode,
        downtime: summary.totalDowntime,
        availability: summary.availability,
        error: summary.downtimeError,
        lcp: summary.performanceMetrics.lcp / 1000, // Convert to seconds
        pageLoadTime: summary.performanceMetrics.pageLoadTime / 1000,
        apiResponseDelay: summary.performanceMetrics.apiResponseDelay,
        totalChecks: summary.totalChecks,
        failedChecks: summary.failedChecks,
        monitoringDuration: summary.monitoringDuration,
        timestamp: Timestamp.now(),
        downtimeEvents: summary.downtimeEvents.length
      };
      
      await addDoc(collection(db, 'monitoring_results'), phase2Data);
      console.log('📈 Final monitoring results stored');
      
      return phase2Data;
    } catch (error) {
      console.error('❌ Error storing monitoring results:', error);
      throw error;
    }
  }

  /**
   * Get current monitoring status
   */
  getCurrentStatus() {
    if (!this.detector) return null;
    
    return {
      isMonitoring: this.isMonitoring,
      currentPhase: this.currentPhase,
      deploymentMode: this.deploymentMode,
      ...this.detector.getMonitoringSummary()
    };
  }

  /**
   * Compare Phase-1 and Phase-2 results
   */
  async comparePhases() {
    try {
      // Get Phase-2 results from Firestore
      const q = query(
        collection(db, 'monitoring_results'),
        where('phase', '==', 'Phase-2'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.warn('No Phase-2 results found for comparison');
        return null;
      }
      
      const phase2Data = querySnapshot.docs[0].data();
      const phase2Results = {
        ...phase2Data,
        timestamp: phase2Data.timestamp.toDate()
      };
      
      // Calculate improvements
      const comparison = this.calculateImprovements(this.phase1Data, phase2Results);
      
      return {
        phase1: this.phase1Data,
        phase2: phase2Results,
        comparison,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Error comparing phases:', error);
      throw error;
    }
  }

  /**
   * Calculate improvement percentages between phases
   */
  calculateImprovements(phase1, phase2) {
    const improvements = {};
    
    // Downtime improvement (lower is better)
    improvements.downtimeReduction = phase1.downtime > 0 ? 
      ((phase1.downtime - phase2.downtime) / phase1.downtime) * 100 : 0;
    
    // Availability improvement (higher is better)
    improvements.availabilityImprovement = phase2.availability - phase1.availability;
    
    // Error reduction (lower is better)
    improvements.errorReduction = phase1.error > 0 ? 
      ((phase1.error - phase2.error) / phase1.error) * 100 : 0;
    
    // LCP improvement (lower is better)
    improvements.lcpImprovement = phase1.lcp > 0 ? 
      ((phase1.lcp - phase2.lcp) / phase1.lcp) * 100 : 0;
    
    return improvements;
  }

  /**
   * Validate SLA compliance
   */
  validateSLA(results) {
    const sla = {
      availabilityThreshold: 95,
      downtimeThreshold: 5,
      lcpThreshold: 2.5 // seconds
    };
    
    const validation = {
      availability: results.availability >= sla.availabilityThreshold,
      downtime: results.downtime <= sla.downtimeThreshold,
      lcp: results.lcp <= sla.lcpThreshold,
      overall: false
    };
    
    validation.overall = validation.availability && validation.downtime && validation.lcp;
    validation.slaPassed = validation.overall;
    validation.slaScore = this.calculateSLAScore(validation, sla);
    
    return validation;
  }

  /**
   * Calculate SLA score
   */
  calculateSLAScore(validation, sla) {
    let score = 0;
    let totalWeight = 0;
    
    // Availability weight: 40%
    if (validation.availability) score += 40;
    totalWeight += 40;
    
    // Downtime weight: 35%
    if (validation.downtime) score += 35;
    totalWeight += 35;
    
    // LCP weight: 25%
    if (validation.lcp) score += 25;
    totalWeight += 25;
    
    return totalWeight > 0 ? (score / totalWeight) * 100 : 0;
  }

  /**
   * Get historical monitoring data
   */
  async getHistoricalData(limit = 100) {
    try {
      const q = query(
        collection(db, 'monitoring_data'),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      const data = [];
      
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        });
      });
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching historical data:', error);
      return [];
    }
  }

  /**
   * Export monitoring data
   */
  async exportData(format = 'json') {
    try {
      const currentData = this.detector ? this.detector.exportData() : null;
      const historicalData = await this.getHistoricalData(1000);
      const comparison = await this.comparePhases();
      
      const exportData = {
        currentData,
        historicalData,
        comparison,
        phase1Baseline: this.phase1Data,
        exportTimestamp: new Date().toISOString(),
        format
      };
      
      if (format === 'csv') {
        return this.convertToCSV(exportData);
      }
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    const csvRows = [];
    
    // Headers
    csvRows.push('Timestamp,Phase,Status,Availability,Downtime,Error,LCP,PageLoadTime,APIResponse');
    
    // Historical data rows
    data.historicalData.forEach(record => {
      csvRows.push([
        record.timestamp.toISOString(),
        record.phase,
        record.currentStatus,
        record.availability.toFixed(2),
        record.totalDowntime.toFixed(2),
        record.downtimeError.toFixed(2),
        (record.performanceMetrics.lcp / 1000).toFixed(2),
        (record.performanceMetrics.pageLoadTime / 1000).toFixed(2),
        record.performanceMetrics.apiResponseDelay.toFixed(2)
      ].join(','));
    });
    
    return csvRows.join('\n');
  }

  /**
   * Measure initial performance metrics
   */
  async measureInitialPerformance() {
    if (!this.detector) return;
    
    try {
      // Measure LCP
      await this.detector.measureLCP();
      
      // Measure page load time
      this.detector.measurePageLoadTime();
      
      console.log('📊 Initial performance metrics measured');
    } catch (error) {
      console.error('❌ Error measuring performance:', error);
    }
  }

  /**
   * Add event listener
   */
  addListener(event, callback) {
    this.listeners.push({ event, callback });
  }

  /**
   * Remove event listener
   */
  removeListener(event, callback) {
    this.listeners = this.listeners.filter(
      listener => listener.event !== event || listener.callback !== callback
    );
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data) {
    this.listeners
      .filter(listener => listener.event === event)
      .forEach(listener => {
        try {
          listener.callback(data);
        } catch (error) {
          console.error('❌ Error in listener callback:', error);
        }
      });
  }

  /**
   * Switch deployment mode
   */
  switchDeploymentMode(mode) {
    if (['direct', 'blue-green'].includes(mode)) {
      this.deploymentMode = mode;
      console.log(`🔄 Switched to ${mode} deployment mode`);
      this.notifyListeners('deploymentModeChanged', { mode });
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.storageInterval) {
      clearInterval(this.storageInterval);
    }
    
    if (this.detector) {
      this.detector.stopMonitoring();
    }
    
    this.listeners = [];
  }
}

export default MonitoringService;
