class DeploymentLogger {
  constructor() {
    this.logs = [];
    this.startTime = Date.now();
  }

  log(message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data,
      elapsed: Date.now() - this.startTime
    };
    
    this.logs.push(logEntry);
    console.log(`🔧 [${timestamp}] ${message}`, data);
    
    // Store in localStorage for persistence
    try {
      const existingLogs = JSON.parse(localStorage.getItem('deploymentLogs') || '[]');
      existingLogs.push(logEntry);
      // Keep only last 100 logs
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      localStorage.setItem('deploymentLogs', JSON.stringify(existingLogs));
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error);
    }
  }

  startDeployment(environment) {
    this.log(`🚀 Starting deployment to ${environment} environment`, {
      environment,
      startTime: this.startTime
    });
  }

  endDeployment(environment, success = true, error = null) {
    const duration = Date.now() - this.startTime;
    this.log(`✅ Deployment ${success ? 'completed' : 'failed'} for ${environment}`, {
      environment,
      duration,
      success,
      error,
      endTime: Date.now()
    });
  }

  measureDowntime(callback) {
    const startTime = performance.now();
    this.log('⏱️ Measuring deployment downtime...');
    
    return callback().then(result => {
      const endTime = performance.now();
      const downtime = endTime - startTime;
      this.log(`📊 Measured downtime: ${downtime.toFixed(2)}ms`, {
        downtime,
        startTime,
        endTime
      });
      return result;
    }).catch(error => {
      const endTime = performance.now();
      const downtime = endTime - startTime;
      this.log(`❌ Error during measurement: ${downtime.toFixed(2)}ms`, {
        downtime,
        error: error.message
      });
      throw error;
    });
  }

  getLogs() {
    try {
      return JSON.parse(localStorage.getItem('deploymentLogs') || '[]');
    } catch (error) {
      return this.logs;
    }
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('deploymentLogs');
    this.log('🗑️ Deployment logs cleared');
  }

  exportLogs() {
    const logs = this.getLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployment-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export default new DeploymentLogger();
