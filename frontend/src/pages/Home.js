import React from 'react';
import LandingPage from '../components/LandingPage';
import PublicNavbar from '../components/PublicNavbar';
import UserNavbar from '../components/UserNavbar';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <>
      {user ? <UserNavbar user={user} setUser={() => {}} /> : <PublicNavbar />}
      <LandingPage />
    </>
  );
};

export default Home;
