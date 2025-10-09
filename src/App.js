import React from 'react';
import { ChakraProvider, theme } from '@chakra-ui/react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Auth from './pages/Auth';
import Home from './pages/Home';
import { AuthContextProvider, useAuth } from './context/AuthContext';
import Menu from './pages/Menu';
import Protected from './components/Protected';
import Orders from './components/Orders';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';
import Payment from './pages/Payment';
import OrderConfirmation from './pages/OrderConfirmation';
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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/menu"
            element={
              <Protected>
                <Menu />
              </Protected>
            }
          />
          <Route
            path="/orders"
            element={
              <Protected>
                <Orders />
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected>
                <Admin />
              </Protected>
            }
          />
          <Route
            path="/payment"
            element={
              <Protected>
                <Payment />
              </Protected>
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <Protected>
                <OrderConfirmation />
              </Protected>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatbotWrapper />
      </AuthContextProvider>
    </ChakraProvider>
  );
}

export default App;