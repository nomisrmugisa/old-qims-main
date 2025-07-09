import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import LoginModal from './components/LoginModal';
import Loading from './components/Loading';
import BackToTop from './components/BackToTop';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';

import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeDashboardSection, setActiveDashboardSection] = useState('registration');
  const navigate = useNavigate();

  // Check for existing credentials on app load
  useEffect(() => {
    const checkExistingLogin = () => {
      const credentials = localStorage.getItem('userCredentials');
      const rememberMe = localStorage.getItem('rememberMe');
      
      if (credentials && rememberMe) {
        setIsLoggedIn(true);
        navigate('/dashboards/facility-ownership');
      }
      
      setIsLoading(false); // Finish initial loading regardless of login state
    };
    
    checkExistingLogin();
  }, [navigate]);

  const handleLogin = (status) => {
    setIsLoading(true);
    // Simulate loading time of 2 seconds
    setTimeout(() => {
      setIsLoggedIn(status);
      setIsLoading(false);
      setShowLoginModal(false);
      if (status) {
        navigate('/dashboards/facility-ownership');
      }
    }, 2000);
  };

  const handleLogout = () => {
    setIsLoading(true);
    localStorage.clear(); // Clear local storage on logout
    setTimeout(() => {
      setIsLoggedIn(false);
      setIsLoading(false);
      navigate('/'); // Redirect to home/login page after logout
    }, 2000);
  };

  return (
    <div className="app-container">
      <Header 
        onLoginClick={() => setShowLoginModal(true)} 
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        activeDashboardSection={activeDashboardSection}
        setActiveDashboardSection={setActiveDashboardSection}
      />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route 
            path="/dashboards/facility-ownership"
            element={isLoggedIn ? <Dashboard activeSection={activeDashboardSection} setActiveSection={setActiveDashboardSection} /> : <Main />}
          />
          {/* You can add more routes here for other dashboard sections if needed */}
        </Routes>
      </main>
      <Footer />
      {showLoginModal && (
        <LoginModal show={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLogin} />
      )}
      {isLoading && <Loading />}
      <BackToTop />
    </div>
  )
}

export default App
