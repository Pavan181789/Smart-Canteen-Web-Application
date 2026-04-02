# Blue-Green Deployment Guide for Firebase Hosting

This guide explains how to implement and use Blue-Green deployment strategy with Firebase Preview Channels for your Smart Canteen web application.

## Overview

**Blue-Green Deployment** is a deployment strategy that minimizes downtime by running two identical production environments:
- **Blue**: Current production environment
- **Green**: New version with updates

Users are seamlessly switched from Blue to Green after testing, ensuring zero downtime.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Blue (Live)   │    │  Green (Preview)│
│   Production    │    │   Environment   │
│                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Users     │ │    │ │   Testing   │ │
│ │   Traffic   │ │    │ │   Traffic   │ │
│ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
            ┌────────▼────────┐
            │   Firebase      │
            │   Hosting       │
            │   Infrastructure│
            └─────────────────┘
```

## Setup Requirements

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project configured
- Node.js and npm installed

### Project Structure
```
smart-canteen/
├── scripts/
│   ├── deploy-blue-green.sh    # Unix/Linux/Mac deployment script
│   └── deploy-blue-green.bat   # Windows deployment script
├── src/
│   ├── components/
│   │   └── DeploymentTracker.js    # UI indicator component
│   └── utils/
│       └── deploymentLogger.js     # Logging utility
├── firebase.json                 # Firebase configuration
└── package.json
```

## Step-by-Step Deployment Guide

### 1. Initial Setup

#### Update Firebase Configuration
Your `firebase.json` is already configured with custom headers for deployment tracking:

```json
{
  "hosting": {
    "public": "build",
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Deployment-Environment",
            "value": "$(DEPLOYMENT_ENVIRONMENT)"
          },
          {
            "key": "X-Deployment-Timestamp",
            "value": "$(DEPLOYMENT_TIMESTAMP)"
          }
        ]
      }
    ]
  }
}
```

#### Install Dependencies
The deployment tracking components are already integrated into your app.

### 2. Deployment Commands

#### For Windows Users:
```bash
# Deploy to Blue (Production)
.\scripts\deploy-blue-green.bat blue

# Deploy to Green (Preview)
.\scripts\deploy-blue-green.bat green

# Promote Green to Production
.\scripts\deploy-blue-green.bat promote

# List active channels
.\scripts\deploy-blue-green.bat list

# Delete Green environment
.\scripts\deploy-blue-green.bat delete

# Open Green in browser
.\scripts\deploy-blue-green.bat open
```

#### For Unix/Linux/Mac Users:
```bash
# Make script executable
chmod +x scripts/deploy-blue-green.sh

# Deploy to Blue (Production)
./scripts/deploy-blue-green.sh blue

# Deploy to Green (Preview)
./scripts/deploy-blue-green.sh green

# Promote Green to Production
./scripts/deploy-blue-green.sh promote

# List active channels
./scripts/deploy-blue-green.sh list

# Delete Green environment
./scripts/deploy-blue-green.sh delete

# Open Green in browser
./scripts/deploy-blue-green.sh open
```

### 3. Manual Firebase CLI Commands

If you prefer using Firebase CLI directly:

#### Create Green Environment (Preview Channel)
```bash
# Deploy to preview channel
firebase hosting:channel:deploy green-preview \
  --project my-amrita-eec28 \
  --only hosting \
  --message "Green deployment: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"

# Set environment variables
export DEPLOYMENT_ENVIRONMENT="green"
export DEPLOYMENT_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

#### Deploy to Blue (Production)
```bash
# Deploy to production
firebase hosting:channel:deploy live \
  --project my-amrita-eec28 \
  --only hosting \
  --message "Blue deployment: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"

# Set environment variables
export DEPLOYMENT_ENVIRONMENT="blue"
export DEPLOYMENT_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

#### List Active Channels
```bash
firebase hosting:channels:list --project my-amrita-eec28
```

#### Promote Green to Blue
```bash
firebase hosting:channel:promote green-preview \
  --project my-amrita-eec28 \
  --message "Promote green to production: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
```

#### Delete Preview Channel
```bash
firebase hosting:channel:delete green-preview --project my-amrita-eec28
```

#### Open Preview in Browser
```bash
firebase hosting:channel:open green-preview --project my-amrita-eec28
```

## Testing the Green Environment

### 1. Access Preview URL
After deploying to Green, use the preview URL:
```
https://my-amrita-eec28--green-preview.web.app
```

### 2. Test Features
- Verify all functionality works correctly
- Test user authentication
- Check database connectivity
- Validate UI components
- Test responsive design

### 3. Monitor Logs
Open browser console to see deployment logs:
```javascript
// Access logs programmatically
deploymentLogger.getLogs();
deploymentLogger.exportLogs();
```

## Deployment Tracking

### UI Indicator
The app includes a **DeploymentTracker** component that shows:
- Current environment (Blue/Green/Development)
- Deployment timestamp
- Version number
- Color-coded badge

### Console Logging
Automatic logging includes:
- Deployment timestamps
- Environment detection
- Performance metrics
- Error tracking

### Metrics Collection
Deployment metrics are saved to `deployment-metrics.csv`:
```csv
date,deployment_type,duration_seconds
2024-01-15 10:30:00,green,45.2
2024-01-15 10:35:00,blue,42.8
```

## Switching from Blue to Green

### Safe Promotion Process
1. **Test Green Environment**
   ```bash
   .\scripts\deploy-blue-green.bat green
   .\scripts\deploy-blue-green.bat open
   ```

2. **Verify Functionality**
   - Manual testing
   - Automated tests
   - Performance checks

3. **Promote to Production**
   ```bash
   .\scripts\deploy-blue-green.bat promote
   ```

4. **Verify Production**
   - Check live site
   - Monitor logs
   - Validate user experience

5. **Clean Up** (Optional)
   ```bash
   .\scripts\deploy-blue-green.bat delete
   ```

## Downtime Measurement

### Automatic Measurement
The deployment scripts automatically measure and log deployment times:

```bash
# Measure deployment time
.\scripts\deploy-blue-green.bat measure green
```

### Manual Measurement
```javascript
// Using the deployment logger
deploymentLogger.measureDowntime(async () => {
  // Your deployment process here
  await deployToEnvironment();
});
```

### Comparison Metrics
Compare deployment strategies:

| Strategy | Avg Downtime | Rollback | Risk Level |
|----------|---------------|----------|------------|
| Direct Deploy | 2-5 minutes | Difficult | High |
| Blue-Green | <30 seconds | Instant | Low |

## Troubleshooting

### Common Issues

#### 1. Preview Channel Not Found
```bash
# List all channels to verify
firebase hosting:channels:list --project my-amrita-eec28
```

#### 2. Deployment Fails
```bash
# Check Firebase project configuration
firebase projects:list
firebase use my-amrita-eec28
```

#### 3. Build Errors
```bash
# Clean and rebuild
npm run build
rm -rf build
npm run build
```

#### 4. Permission Issues
```bash
# Login to Firebase
firebase login
firebase projects:list
```

### Recovery Procedures

#### Rollback to Previous Version
```bash
# If promotion fails, redeploy previous version
git checkout previous-commit-hash
npm run build
.\scripts\deploy-blue-green.bat blue
```

#### Emergency Cleanup
```bash
# Delete problematic preview channel
firebase hosting:channel:delete green-preview --project my-amrita-eec28
```

## Best Practices

### 1. Pre-Deployment Checklist
- [ ] All tests pass
- [ ] Build completes successfully
- [ ] Environment variables set
- [ ] Backup current version
- [ ] Rollback plan ready

### 2. Testing Strategy
- Unit tests: `npm test`
- Integration tests: Manual verification
- User acceptance testing: Preview channel
- Performance testing: Load testing

### 3. Monitoring
- Console logs for errors
- Deployment metrics tracking
- User feedback collection
- Performance monitoring

### 4. Security Considerations
- Environment-specific configurations
- API key management
- Access control for preview channels
- Secure rollout process

## Advanced Features

### Custom Environment Detection
The `DeploymentTracker` component automatically detects environments:
- **Blue**: Production URL (`my-amrita-eec28.web.app`)
- **Green**: Preview URL (`--green-preview.web.app`)
- **Development**: Localhost (`localhost`)

### Automated Testing Integration
```bash
# Run tests before deployment
npm test && .\scripts\deploy-blue-green.bat green
```

### CI/CD Integration
Add to your CI/CD pipeline:
```yaml
# GitHub Actions example
- name: Deploy to Green
  run: ./scripts/deploy-blue-green.sh green
  
- name: Run Integration Tests
  run: npm run test:integration
  
- name: Promote to Production
  run: ./scripts/deploy-blue-green.sh promote
```

## Summary

This Blue-Green deployment implementation provides:
- ✅ **Zero downtime deployments**
- ✅ **Instant rollback capability**
- ✅ **Comprehensive logging and tracking**
- ✅ **Automated testing integration**
- ✅ **Cross-platform support** (Windows/Unix)
- ✅ **Visual deployment indicators**
- ✅ **Performance metrics collection**

Your Smart Canteen application now has a robust deployment strategy that ensures smooth updates and excellent user experience.
