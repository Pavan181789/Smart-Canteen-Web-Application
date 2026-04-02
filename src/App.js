import React from 'react';
import { ChakraProvider, theme } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthContextProvider, useAuth } from './context/AuthContext';
import Chatbot from './components/Chatbot';
import DeploymentTracker from './components/DeploymentTracker';
import deploymentLogger from './utils/deploymentLogger';
import './styles.css';

// Wrapper component to conditionally render Chatbot
const ChatbotWrapper = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Hide chatbot on auth page or when not signed in
  if (location.pathname === '/auth' || !user || !user?.uid) {
    return null;
  }

  return <Chatbot />;
};

function App() {
  // Log app initialization for deployment tracking
  React.useEffect(() => {
    deploymentLogger.log('🚀 Smart Canteen application initialized', {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <AuthContextProvider>
        {/* Child routes render here */}
        <Outlet />
        <ChatbotWrapper />
        <DeploymentTracker />
      </AuthContextProvider>
    </ChakraProvider>
  );
}

export default App;