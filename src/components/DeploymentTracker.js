import React, { useState, useEffect } from 'react';
import { Box, Badge, Text, useColorModeValue } from '@chakra-ui/react';

const DeploymentTracker = () => {
  const [deploymentInfo, setDeploymentInfo] = useState({
    environment: 'unknown',
    timestamp: null,
    version: '1.0.0'
  });

  const bgColor = useColorModeValue('gray.100', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.200');

  useEffect(() => {
    // Detect environment from URL or headers
    const detectEnvironment = () => {
      const hostname = window.location.hostname;
      const url = window.location.href;
      const isPreview = hostname.includes('--') || url.includes('--green-preview') || hostname.includes('preview');
      const isLocal = hostname === 'localhost';
      
      let env = 'blue'; // Default to production (blue)
      if (isPreview) env = 'green';
      if (isLocal) env = 'development';
      
      // Try to get deployment info from headers (if available via server)
      fetch('/api/deployment-info')
        .then(res => res.json())
        .then(data => {
          setDeploymentInfo({
            environment: data.environment || env,
            timestamp: data.timestamp || new Date().toISOString(),
            version: data.version || '1.0.0'
          });
        })
        .catch(() => {
          // Fallback to URL-based detection
          setDeploymentInfo({
            environment: env,
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          });
        });
    };

    detectEnvironment();
    
    // Log deployment info for tracking
    const logDeployment = () => {
      console.log('🚀 Deployment Info:', {
        environment: deploymentInfo.environment,
        timestamp: deploymentInfo.timestamp,
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    };

    logDeployment();
  }, [deploymentInfo.environment, deploymentInfo.timestamp]);

  const getEnvironmentColor = () => {
    switch (deploymentInfo.environment) {
      case 'blue': return 'blue';
      case 'green': return 'green';
      case 'development': return 'orange';
      default: return 'gray';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      bg={bgColor}
      p={3}
      borderRadius="md"
      boxShadow="md"
      zIndex={1000}
      maxWidth="250px"
    >
      <Box display="flex" alignItems="center" mb={2}>
        <Badge colorScheme={getEnvironmentColor()} mr={2}>
          {deploymentInfo.environment.toUpperCase()}
        </Badge>
        <Text fontSize="xs" color={textColor}>
          v{deploymentInfo.version}
        </Text>
      </Box>
      {deploymentInfo.timestamp && (
        <Text fontSize="xs" color={textColor}>
          Deployed: {formatTimestamp(deploymentInfo.timestamp)}
        </Text>
      )}
    </Box>
  );
};

export default DeploymentTracker;
