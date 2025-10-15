import React from 'react';
import { ChakraProvider, theme } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthContextProvider, useAuth } from './context/AuthContext';
import Chatbot from './components/Chatbot';

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
  return (
    <ChakraProvider theme={theme}>
      <AuthContextProvider>
        {/* Child routes render here */}
        <Outlet />
        <ChatbotWrapper />
      </AuthContextProvider>
    </ChakraProvider>
  );
}

export default App;