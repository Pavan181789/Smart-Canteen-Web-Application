# Real-Time Performance Monitoring System

## 🚀 Overview

This is an advanced real-time performance monitoring and downtime analysis system for the Smart Canteen application. It provides comprehensive monitoring capabilities with live dashboards, automated downtime detection, performance metrics tracking, and detailed analytics.

## 📊 Features

### 🔴 Automated Downtime Detection
- **Real-time Pinging**: Monitors deployed URL every 2 seconds
- **Intelligent Detection**: Automatically marks system as UP/DOWN
- **Event Logging**: Records downtime start/end timestamps and duration
- **Historical Tracking**: Maintains complete downtime event history

### 📈 Real-Time Monitoring Dashboard
- **Live Status Indicators**: Real-time system status (🟢 LIVE / 🔴 DOWN)
- **Performance Metrics**: Availability %, downtime minutes, error rate
- **Dynamic Updates**: Live updating values with smooth animations
- **Modern UI**: Clean, responsive dashboard with dark theme

### 📊 Advanced Graph System
1. **Line Chart**: Availability trends over time
2. **Bar Chart**: Phase-1 vs Phase-2 comparison
3. **Radar Chart**: Multi-metric performance analysis
4. **Timeline Graph**: 60-minute UP/DOWN visualization

### ⚙️ Performance Metrics Tracking
- **LCP (Largest Contentful Paint)**: Page load performance
- **API Response Delay**: Backend response times
- **Page Load Time**: Complete page load metrics
- **Real-time Monitoring**: Continuous performance tracking

### 🧠 Phase Comparison Engine
- **Automated Analysis**: Compare Phase-1 vs Phase-2 results
- **Improvement Metrics**: Calculate percentage improvements
- **Visual Comparisons**: Side-by-side performance analysis
- **Trend Analysis**: Identify performance trends

### 🗂️ Data Storage System
- **Firestore Integration**: Secure cloud data storage
- **Real-time Sync**: Live data synchronization
- **Historical Data**: Complete monitoring history
- **Data Export**: JSON and CSV export capabilities

### 📤 Export System
- **Multiple Formats**: JSON and CSV export options
- **Selective Export**: Choose data to include
- **Download Management**: Direct file downloads
- **Data Integrity**: Complete and accurate exports

### 📉 SLA Validation Engine
- **Automated Validation**: Check SLA compliance
- **Threshold Monitoring**: Availability ≥95%, Downtime ≤5%
- **Performance Metrics**: LCP ≤2.5 seconds
- **Compliance Scoring**: Overall SLA score calculation

### 🧪 Deployment Experiment Mode
- **Direct Deployment**: Traditional deployment comparison
- **Blue-Green Deployment**: Advanced deployment strategy
- **Performance Analysis**: Compare deployment modes
- **Automatic Switching**: Easy mode switching

## 🏗️ Project Structure

```
src/monitoring/
├── core/
│   └── downtimeDetector.js      # Core downtime detection logic
├── services/
│   └── monitoringService.js     # Central monitoring service
├── components/
│   ├── MonitoringDashboard.jsx  # Main dashboard component
│   ├── StatusCard.jsx          # Status display card
│   ├── MetricsGrid.jsx         # Performance metrics grid
│   ├── PhaseComparison.jsx     # Phase comparison component
│   ├── SLAValidation.jsx       # SLA validation component
│   └── ExportModal.jsx         # Data export modal
├── charts/
│   ├── ChartContainer.jsx      # Chart wrapper component
│   └── TimelineChart.jsx       # Custom timeline chart
└── utils/
    ├── calculations.js         # Performance calculations
    └── formatters.js          # Data formatting utilities
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ 
- Firebase project configured
- React 18+
- Modern web browser

### Step 1: Install Dependencies
```bash
npm install chart.js@^4.4.0 react-chartjs-2@^5.2.0 react-helmet@^6.1.0 react-lucide@^0.441.0
```

### Step 2: Firebase Configuration
Ensure your Firebase configuration in `src/firebase.js` includes:
```javascript
import { getFirestore } from 'firebase/firestore';
import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
```

### Step 3: Add Monitoring Route
Add the monitoring route to your React Router:
```javascript
import MonitoringPage from './pages/MonitoringPage';

// In your router configuration
<Route path="/monitoring" element={<MonitoringPage />} />
```

### Step 4: Firestore Collections
The system automatically creates these collections:
- `monitoring_data` - Real-time monitoring data
- `monitoring_results` - Phase comparison results

## 🚀 Quick Start

### 1. Start Monitoring
```javascript
import MonitoringService from './monitoring/services/monitoringService';

// Initialize monitoring
const monitoringService = new MonitoringService();
await monitoringService.initializeMonitoring(window.location.origin, 'blue-green');

// Start monitoring
monitoringService.startMonitoring();
```

### 2. Access Dashboard
Navigate to `/monitoring` in your application to view the live dashboard.

### 3. Monitor Performance
- Click "Start Monitoring" to begin real-time monitoring
- View live metrics and charts
- Export data when needed

## 📊 Monitoring Metrics

### Key Performance Indicators (KPIs)
- **Availability**: System uptime percentage
- **Downtime**: Total downtime in minutes
- **Error Rate**: Percentage of failed requests
- **Response Time**: API response delay
- **LCP**: Largest Contentful Paint (seconds)

### SLA Thresholds
- **Availability**: ≥95% (Target)
- **Downtime**: ≤5 minutes (Target)
- **LCP**: ≤2.5 seconds (Target)

## 🎯 Usage Examples

### Basic Monitoring
```javascript
// Start monitoring
monitoringService.startMonitoring();

// Get current status
const status = monitoringService.getCurrentStatus();
console.log('System Status:', status.currentStatus);
console.log('Availability:', status.availability + '%');
```

### Phase Comparison
```javascript
// Compare phases
const comparison = await monitoringService.comparePhases();
console.log('Downtime Reduction:', comparison.comparison.downtimeReduction + '%');
console.log('Availability Improvement:', comparison.comparison.availabilityImprovement + '%');
```

### Export Data
```javascript
// Export as JSON
const jsonData = await monitoringService.exportData('json');

// Export as CSV
const csvData = await monitoringService.exportData('csv');
```

## 🔧 Configuration

### Monitoring Settings
```javascript
const monitoringService = new MonitoringService();

// Configure ping interval (default: 2000ms)
monitoringService.detector.pingInterval = 1000; // 1 second

// Set deployment mode
monitoringService.switchDeploymentMode('direct'); // or 'blue-green'
```

### Chart Configuration
Charts are automatically configured with:
- **Real-time Updates**: 5-second refresh intervals
- **Responsive Design**: Adapts to screen size
- **Dark Theme**: Consistent with application theme
- **Interactive Tooltips**: Hover for detailed information

## 📱 Mobile Responsiveness

The monitoring dashboard is fully responsive:
- **Desktop**: Full-featured dashboard experience
- **Tablet**: Optimized layout for touch interaction
- **Mobile**: Compact view with essential metrics

## 🔍 Troubleshooting

### Common Issues

#### 1. Monitoring Not Starting
**Problem**: Clicking "Start Monitoring" doesn't work
**Solution**: Check Firebase configuration and network connectivity

#### 2. Charts Not Loading
**Problem**: Charts show "No data available"
**Solution**: Ensure Chart.js dependencies are installed and monitoring is active

#### 3. Export Not Working
**Problem**: Export button doesn't download file
**Solution**: Check browser permissions and popup blockers

#### 4. SLA Validation Fails
**Problem**: SLA shows incorrect results
**Solution**: Verify monitoring data is being collected properly

### Debug Mode
Enable debug logging:
```javascript
// In browser console
localStorage.setItem('monitoring_debug', 'true');
```

## 🚀 Production Deployment

### Environment Variables
```bash
# .env.production
REACT_APP_MONITORING_ENABLED=true
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_DEPLOYMENT_MODE=blue-green
```

### Performance Optimization
- **Lazy Loading**: Charts load on demand
- **Data Throttling**: Prevents excessive API calls
- **Memory Management**: Automatic cleanup of old data
- **Compression**: Optimized data transfer

### Security Considerations
- **Firebase Rules**: Secure data access
- **API Rate Limiting**: Prevent abuse
- **Data Encryption**: Secure data transmission
- **Access Control**: User authentication

## 📈 Advanced Features

### Custom Metrics
Add custom performance metrics:
```javascript
// In downtimeDetector.js
addCustomMetric(name, value, unit) {
  this.customMetrics[name] = { value, unit, timestamp: new Date() };
}
```

### Alert System
Configure alerts for threshold violations:
```javascript
// Set up alerts
monitoringService.setAlert('availability', 95, (current) => {
  console.warn(`Availability dropped to ${current}%`);
});
```

### Integration with External Services
```javascript
// Webhook integration
monitoringService.addWebhook('https://your-webhook-url', {
  events: ['downtime_start', 'downtime_end', 'sla_violation']
});
```

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development: `npm start`
4. Navigate to `/monitoring`

### Code Style
- Use ES6+ features
- Follow React best practices
- Component-based architecture
- Comprehensive error handling

### Testing
```bash
# Run tests
npm test

# Run coverage
npm run test:coverage
```

## 📚 API Reference

### MonitoringService
```javascript
class MonitoringService {
  // Initialize monitoring
  async initializeMonitoring(url, deploymentMode)
  
  // Control monitoring
  startMonitoring()
  stopMonitoring()
  
  // Get data
  getCurrentStatus()
  getHistoricalData(limit)
  
  // Analysis
  comparePhases()
  validateSLA(results)
  
  // Export
  exportData(format)
  
  // Events
  addListener(event, callback)
  removeListener(event, callback)
}
```

### DowntimeDetector
```javascript
class DowntimeDetector {
  // Configuration
  constructor(url, pingInterval)
  
  // Control
  startMonitoring()
  stopMonitoring()
  
  // Data
  getMonitoringSummary()
  exportData()
  
  // Performance
  measureLCP()
  measurePageLoadTime()
}
```

## 🎯 Best Practices

### Monitoring Strategy
1. **Continuous Monitoring**: Keep monitoring active during peak hours
2. **Regular Exports**: Export data weekly for analysis
3. **SLA Tracking**: Monitor SLA compliance continuously
4. **Performance Baselines**: Establish performance baselines

### Data Management
1. **Regular Cleanup**: Remove old monitoring data
2. **Backup Strategy**: Regular data backups
3. **Retention Policy**: Define data retention periods
4. **Privacy Compliance**: Ensure data privacy compliance

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check browser console for errors
4. Contact the development team

## 🔄 Updates & Maintenance

### Version History
- **v2.0.0**: Advanced monitoring system with real-time dashboard
- **v1.0.0**: Basic downtime detection

### Future Enhancements
- **Machine Learning**: Predictive analytics
- **Mobile App**: Native mobile monitoring
- **API Integration**: External service integration
- **Advanced Alerts**: Custom alert configurations

---

## 🏆 Conclusion

This monitoring system provides enterprise-level monitoring capabilities for your Smart Canteen application. With real-time tracking, comprehensive analytics, and automated SLA validation, you can ensure optimal performance and reliability for your users.

The system is designed to be production-ready with robust error handling, scalable architecture, and comprehensive documentation. Start monitoring today to gain valuable insights into your application's performance!
