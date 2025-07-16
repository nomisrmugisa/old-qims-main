import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import LoginModal from './components/LoginModal';
import Loading from './components/Loading';
import BackToTop from './components/BackToTop';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {eventBus, EVENTS} from './events';
import './App.css'
import NavigationWrapper from './components/NavigationWrapper';


import AlertNotification from './components/AlertNotification';
import { AuthService, StorageService } from './services';

//Routes
import ForgotPassword from './views/ForgotPassword';
import ResetPassword from './views/ResetPassword';
import Registration from './views/Registration';
import Login from './views/Login';
import FacilitiesPage from './views/FacilitiesPage';
import FacilityDetailPage from './views/FacilityDetails';
import ConflictResolutionPage from './views/ConflictResolverPage';
import CorrectiveActionPlanPage from './views/CorrectiveActionPlanPage';
import InspectionFinalReportPage from './views/InspectionFinalReportPage';
import FacilityUserEnrolmentManagerPage from './views/Facility/User/Enrolment/ManagerPage';
import FacilityUserEnrolmentSelfPage from './views/Facility/User/Enrolment/SelfPage';
import FacilityUserDashboardPage from './views/Facility/User/DashboardPage';
import FacilityUserManagementPage from './views/Facility/User/ManagementPage';
import PasswordChangePage from './views/ChangePassword';
import FacilityCalendarPage from './views/Facility/Calendar';

function App() {
  const [loadingProcesses, setLoadingProcesses] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeDashboardSection, setActiveDashboardSection] = useState('overview');
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

    // Safety timeout to prevent infinite loading
    /*useEffect(() => {
        if (isLoading) {
            const timeout = setTimeout(() => {
                console.warn('Loading timeout - forcing loading state to false');
                setIsLoading(false);
                setLoadingProcesses(0);
            }, 30000); // 30 second timeout

            return () => clearTimeout(timeout);
        }
    }, [isLoading]);

    useEffect(() => {
        console.log(`LoadingProcesses changed to: ${loadingProcesses}`);
    }, [loadingProcesses]);*/

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

    const checkExistingLogin = async() => {
        try {
            const credentials = await StorageService.get('userCredentials');
            const rememberMe = await StorageService.get('rememberMe');

            if (credentials) {
                window.console.log("credentials: ", credentials);
                window.console.log("remember: ", rememberMe);
                setIsLoggedIn(true);
                //navigate('/dashboards/facility-ownership');
            }
        } catch (error) {
            console.error('Error checking existing login:', error);
            // Clear potentially corrupted data
            try {
                StorageService.remove('userCredentials');
                StorageService.remove('rememberMe');
                console.log('Cleared potentially corrupted authentication data');
            } catch (clearError) {
                console.error('Failed to clear corrupted data:', clearError);
            }
        } finally {
            setIsLoading(false); // Finish initial loading regardless of login state
        }
    };
  // Check for existing credentials on app load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Clear any corrupted data first
        const corruptedCount = await StorageService.clearCorruptedData();
        if (corruptedCount > 0) {
          console.log(`Cleared ${corruptedCount} corrupted data entries`);
        }
        
        // Then check for existing login
        await checkExistingLogin();
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [navigate]);

  const handleLogin = (status) => {
    // Simulate loading time of 2 seconds
      setIsLoggedIn(status);
      setShowLoginModal(false);
      if (status) {
          navigate('/dashboards/facility-ownership');
      }
  };

  const triggerLoginClick = () => {
      //setShowLoginModal(true);
      navigate('/login');
  };

  const handleLogout = () => {
    setIsLoading(true);
    AuthService.clearAuth();
    window.console.log("logout 1");
    localStorage.clear(); // Clear local storage on logout
    /*setTimeout(() => {
      setIsLoggedIn(false);
      setIsLoading(false);
        window.console.log("logout 2");
      navigate('/login'); // Redirect to home/login page after logout
    }, 2000);*/

      setIsLoggedIn(false);
      setIsLoading(false);
      window.console.log("logout 2");
      navigate('/login'); // Redirect to home/login page after logout
  };

  return (
    <div className="app-container">
      <Header 
        onLoginClick={() => triggerLoginClick()}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        activeDashboardSection={activeDashboardSection}
        setActiveDashboardSection={setActiveDashboardSection}
      />
        {/*Global Alert Notification */}
        <AlertNotification />

      <main className="main-content">
        <NavigationWrapper>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route
                path="/dashboards/facility-ownership"
                element={isLoggedIn ? <Dashboard activeSection={activeDashboardSection} setActiveSection={setActiveDashboardSection} /> : <Main />}
            />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/login" element={<Login />} />
              <Route path="/facilities" element={<FacilitiesPage />} />
              <Route path="/facility/:facilityId" element={<FacilityDetailPage />} />
              <Route path="/conflict-resolution" element={<ConflictResolutionPage />} />
              <Route path="/corrective-action-plan" element={<CorrectiveActionPlanPage />} />
              <Route path="/inspection-final-report" element={<InspectionFinalReportPage />} />
              <Route path="/facility-user-enrolment" element={<FacilityUserEnrolmentManagerPage />} />
              <Route path="/facility-user-enrolment-self" element={<FacilityUserEnrolmentSelfPage />} />
              <Route path="/dashboard" element={<FacilityUserDashboardPage />} />
              <Route path="/facility-user-management" element={<FacilityUserManagementPage />} />
              <Route path="/password-change" element={<PasswordChangePage />} />
              <Route path="/facility-calendar" element={<FacilityCalendarPage />} />
              <Route path="/facility-calendar-advanced" element={<FacilityCalendarPage />} />

              {/* You can add more routes here for other dashboard sections if needed */}
          </Routes>
        </NavigationWrapper>
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
