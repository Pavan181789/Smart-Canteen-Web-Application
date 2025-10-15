import { ColorModeScript } from '@chakra-ui/react';
import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
// Pages and components for routes
import Home from './pages/Home';
import Auth from './pages/Auth';
import Menu from './pages/Menu';
import Orders from './components/Orders';
import Admin from './pages/Admin';
import Payment from './pages/Payment';
import OrderConfirmation from './pages/OrderConfirmation';
import NotFound from './pages/NotFound';
import Protected from './components/Protected';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <Home /> },
        { path: 'auth', element: <Auth /> },
        {
          path: 'menu',
          element: (
            <Protected>
              <Menu />
            </Protected>
          ),
        },
        {
          path: 'orders',
          element: (
            <Protected>
              <Orders />
            </Protected>
          ),
        },
        {
          path: 'admin',
          element: (
            <Protected>
              <Admin />
            </Protected>
          ),
        },
        {
          path: 'payment',
          element: (
            <Protected>
              <Payment />
            </Protected>
          ),
        },
        {
          path: 'order-confirmation',
          element: (
            <Protected>
              <OrderConfirmation />
            </Protected>
          ),
        },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

root.render(
  <StrictMode>
    <RecoilRoot>
      <ColorModeScript initialColorMode="system" />
      <RouterProvider router={router} />
    </RecoilRoot>
  </StrictMode>
);

serviceWorkerRegistration.register();
