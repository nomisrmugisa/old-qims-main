import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import LoginModal from './components/LoginModal';
import Loading from './components/Loading';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {eventBus, useEvent, EVENTS } from './events';
import './App.css'

function App() {
  const [loadingProcesses, setLoadingProcesses] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeDashboardSection, setActiveDashboardSection] = useState('registration');
  const navigate = useNavigate();

    /*----------------------------
    * Loading screen Management
    * START
    ----------------------------*/
    const updateLoadingState = useCallback((increment) => {
        setLoadingProcesses(prev => {
            const newVal = Math.max(0, prev + increment);
            setIsLoading(newVal > 0);
            console.log("isLoading: "+ isLoading);
            console.log(`Loading update: ${increment > 0 ? '+' : '-'}${Math.abs(increment)} -> ${newVal}`);
            return newVal;
        });
    }, []);

    const handleShow = useCallback((source) => {
        window.console.log("handleShow");
        window.console.log(source);
        updateLoadingState(1);
    }, [updateLoadingState]);
    const handleHide = useCallback((source) => {
        window.console.log("handleHide");
        window.console.log(source);
        updateLoadingState(-1);
    }, [updateLoadingState]);
    useEffect(() => {

        eventBus.on(EVENTS.LOADING_SHOW, handleShow);
        eventBus.on(EVENTS.LOADING_HIDE, handleHide);

        return () => {
            eventBus.off(EVENTS.LOADING_SHOW, handleShow);
            eventBus.off(EVENTS.LOADING_HIDE, handleHide);
        };
    }, [updateLoadingState]);
  /*----------------------------
   * END
   * Loading screen Management
   ----------------------------*/

    const checkExistingLogin = () => {
        const credentials = localStorage.getItem('userCredentials');
        const rememberMe = localStorage.getItem('rememberMe');

        if (credentials && rememberMe) {
            setIsLoggedIn(true);
            navigate('/dashboards/facility-ownership');
        }

        setIsLoading(false); // Finish initial loading regardless of login state
    };
  // Check for existing credentials on app load
  useEffect(() => {

    
    checkExistingLogin();

  }, [navigate]);

  const handleLogin = (status) => {
    // Simulate loading time of 2 seconds
      setIsLoggedIn(status);
      setShowLoginModal(false);
      if (status) {
          navigate('/dashboards/facility-ownership');
      }
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
    </div>
  )
}

export default App
