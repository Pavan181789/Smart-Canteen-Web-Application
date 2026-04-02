import React from 'react';
import Nav from '../components/Navbar';
import Landing from '../components/Landing';
import DefNavbarBtn from '../components/buttons/DefNavbarBtn';
import { UserAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import LayoutContainer from '../components/LayoutContainer';

export default function Home() {
  const { user } = UserAuth();
  return (
    <>
      {user ? (
        <Navigate to="/menu" />
      ) : (
        <>
          <Nav title="ScanToEat" navBtn={<DefNavbarBtn />} />
          <LayoutContainer>
            <Landing />
          </LayoutContainer>
        </>
      )}
    </>
  );
}
