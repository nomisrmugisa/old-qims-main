// components/Header.jsx
import React, { useEffect, useState } from 'react';
import './Header.css';
import logo from '../assets/logo.png';
import {eventBus, EVENTS } from '../events';
import { useNavigate } from 'react-router-dom';
import {AuthService, StorageService} from '../services';

const Header = ({ onLoginClick, isLoggedIn, onLogout, activeDashboardSection, setActiveDashboardSection }) => {
  const [orgUnitName, setOrgUnitName] = useState('');
  const [situationalAnalysisComplete, setSituationalAnalysisComplete] = useState(false);
    const navigate = useNavigate();
    const [authUser, setAuthUser] = useState(null);
  
  // Function to check if Situational Analysis is green (completed)
  const isSituationalAnalysisGreen = () => {
    return situationalAnalysisComplete;
  };

  const onApplyClick = () => {
    eventBus.emit(EVENTS.REGISTRATION_FORM_SHOW);
    navigate('/register')
  };
  
  // Monitor localStorage for changes to situationalAnalysisComplete
  useEffect(() => {
    const checkSituationalAnalysisStatus = () => {
      const status = localStorage.getItem('situationalAnalysisComplete') === 'true';
      setSituationalAnalysisComplete(status);
    };
    
    // Check immediately
    checkSituationalAnalysisStatus();
    
    // Set up interval to check periodically
    const intervalId = setInterval(checkSituationalAnalysisStatus, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Get organization unit name when component mounts or isLoggedIn changes
    if (isLoggedIn) {
      const fetchOrgUnitName = async () => {
          try {
              const data = await AuthService.fetchOrganisationUnit();
              window.console.log(data);
              if (data && data.organisationUnits && data.organisationUnits.length > 0) {
                  setOrgUnitName(data.organisationUnits[0].displayName);
                  await StorageService.set('userOrgUnitName', data.organisationUnits[0].displayName);
              }
          }
          catch(error) {
              const storedOrgUnitName = await StorageService.get('userOrgUnitName');
              if (storedOrgUnitName) {
                  setOrgUnitName(storedOrgUnitName);
              }
          }
          finally {
              eventBus.emit(EVENTS.LOADING_HIDE, { source: "Header", method: "fetchOrgUnitName"});
          }


        /*try {
          const credentials = localStorage.getItem('userCredentials');
          if (!credentials) {
            console.error('No credentials found in localStorage');
            return;
          }

          const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/me?fields=organisationUnits[displayName]`, {
            headers: {
              Authorization: `Basic ${credentials}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data && data.organisationUnits && data.organisationUnits.length > 0) {
              setOrgUnitName(data.organisationUnits[0].displayName);
              // Also store in localStorage for future use
              localStorage.setItem('userOrgUnitName', data.organisationUnits[0].displayName);
            }
          } else {
            console.error('Failed to fetch organization unit data');
            // Fallback to stored value if API call fails
            const storedOrgUnitName = localStorage.getItem('userOrgUnitName');
            if (storedOrgUnitName) {
              setOrgUnitName(storedOrgUnitName);
            }
          }
        } catch (error) {
          console.error('Error fetching organization unit data:', error);
          // Fallback to stored value if API call fails
          const storedOrgUnitName = localStorage.getItem('userOrgUnitName');
          if (storedOrgUnitName) {
            setOrgUnitName(storedOrgUnitName);
          }
        }*/
      };

      fetchOrgUnitName();
    }
  }, [isLoggedIn]);

    useEffect(() => {

        const getUserData = async() => {
            const userData = await StorageService.getUserData();
            window.console.log(userData);
            setAuthUser(userData);
        };

        getUserData();
    }, []);

  return (
    <header id="header" className="header sticky-top">
      <div className="topbar d-flex align-items-center">
        <div className="container d-flex justify-content-center justify-content-md-between">
          <div className="contact-info d-flex align-items-center">
            <i className="bi bi-envelope d-flex align-items-center">
              <a href="mailto:contact@example.com">health@gov.bw</a>
            </i>
            <i className="bi bi-phone d-flex align-items-center ms-4">
              <span>+267 363 2500</span>
            </i>
          </div>
          <div className="d-flex align-items-center">
            {isLoggedIn && (
              <div className="logged-in-message me-3">
                <i className="bi bi-building me-1"></i>
                <span>Facility: {orgUnitName || 'Loading...'}</span>
              </div>
            )}
            <div className="social-links d-none d-md-flex align-items-center">

            </div>
          </div>
        </div>
      </div>

        <div className="branding" style={{ backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="container px-4">
                <div className="d-flex align-items-center" style={{ height: '120px' }}>
                    {/* Logo - Left aligned */}
                    <div className="logo">
                        <img
                            src={logo}
                            alt="Ministry of Health Logo"
                            style={{ height: '120px', width: 'auto', maxWidth: '100%' }}
                        />
                    </div>

                    {/* Primary Navigation - Centered */}
                    <nav className="flex-grow-1">
                        <ul className="d-flex justify-content-center gap-5 mb-2 ps-2" style={{ listStyle: 'none' }}>
                            <li>
                                <a
                                    href="/main/#"
                                    className={`text-decoration-none nav-link-hover  fw-semibold`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate(isLoggedIn ? '/dashboards/facility-ownership' : '/');
                                    }}
                                >
                                    Home

                                </a>
                            </li>
                            <li>
                                <a
                                    href="#about"
                                    className={`text-decoration-none nav-link-hover  fw-semibold`}
                                    onClick={(e) => {
                                        if (!isLoggedIn && !isSituationalAnalysisGreen()) {
                                            setActiveDashboardSection('about');
                                        } else {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#check-validity"
                                    className={`text-decoration-none nav-link-hover  fw-semibold`}
                                    onClick={(e) => {
                                        if (isLoggedIn && isSituationalAnalysisGreen()) {
                                            setActiveDashboardSection('check-validity');
                                        } else {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    Check Validity
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#report-incident"
                                    className={`text-decoration-none nav-link-hover  fw-semibold`}
                                    onClick={(e) => {
                                        if (isLoggedIn && isSituationalAnalysisGreen()) {
                                            setActiveDashboardSection('report-incident');
                                        } else {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    Report Incident
                                </a>
                            </li>
                            {/* Add more menu items here */}
                        </ul>
                    </nav>

                    {/* Auth Actions - Right aligned */}
                    <div className="d-flex gap-3">
                        {isLoggedIn ? (
                            <button
                                className="btn btn-sm btn-outline-primary"
                                style={{
                                    borderRadius: '20px',
                                    padding: '6px 16px',
                                    borderWidth: '2px'
                                }}
                                onClick={onLogout}
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    style={{
                                        borderRadius: '20px',
                                        padding: '6px 16px',
                                        borderWidth: '2px'
                                    }}
                                    onClick={onLoginClick}
                                >
                                    Login
                                </button>
                                <button
                                    className="btn btn-sm btn-primary d-none d-sm-block"
                                    style={{
                                        borderRadius: '20px',
                                        padding: '6px 16px',
                                        fontWeight: 600
                                    }}
                                    onClick={onApplyClick}
                                >
                                    Join Now
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>



    </header>
  );
};

export default Header;