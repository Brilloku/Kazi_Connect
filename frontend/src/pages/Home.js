import React from 'react';
import LandingPage from '../components/LandingPage';
import PublicNavbar from '../components/PublicNavbar';
import UserNavbar from '../components/UserNavbar';

const Home = ({ user, setUser }) => {
  return (
    <>
      {user ? <UserNavbar user={user} setUser={setUser} /> : <PublicNavbar />}
      <LandingPage />
    </>
  );
};

export default Home;
