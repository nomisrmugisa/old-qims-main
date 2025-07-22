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
  
  // Function to check if Pre-Inspection is green (completed)
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

      <div className="branding d-flex align-items-center">
        <div className="container position-relative d-flex align-items-center justify-content-between">
          <div className="logo d-flex flex-column align-items-center">
            <img src={logo} alt="Ministry of Health Logo" className="header-logo" style={{ width: '90px', height: '90px', objectFit: 'contain' }} />
          </div>

          <nav id="navmenu" className="navmenu">
            <ul>
              {

                  <li>
                      <a
                          href="javascript:void(0);"
                          className={`${activeDashboardSection === 'home' ? 'active' : ''} ${(!isLoggedIn || !isSituationalAnalysisGreen()) ? 'active' : ''}`}
                          onClick={(e) => {
                              const _route = (isLoggedIn) ? '/dashboards/facility-ownership':'/';
                              navigate(_route);
                          }}
                      >
                          Home
                      </a>
                  </li>


                  /*<li><a href="#Registration" className={activeDashboardSection === 'registration' ? 'active' : ''} onClick={() => setActiveDashboardSection('registration')}>Complete Application</a></li>*/}
                  {/*<li>
                    <a 
                      href="javascript:void(0);"
                      className={`${activeDashboardSection === 'home' ? 'active' : ''} ${(!isLoggedIn || !isSituationalAnalysisGreen()) ? 'active' : ''}`}
                      onClick={(e) => {
                        if (isLoggedIn && isSituationalAnalysisGreen()) {
                          setActiveDashboardSection('home');
                        } else {
                          e.preventDefault();
                        }
                      }}
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#about"
                      className={`${activeDashboardSection === 'about' ? 'active' : ''} ${(!isLoggedIn || !isSituationalAnalysisGreen()) ? '' : ''}`}
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
                      className={`${activeDashboardSection === 'check-validity' ? 'active' : ''} ${(!isLoggedIn || !isSituationalAnalysisGreen()) ? '' : ''}`}
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
                        className={`${activeDashboardSection === 'report-incident' ? 'active' : ''} ${(!isLoggedIn || !isSituationalAnalysisGreen()) ? '' : ''}`}
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
                  <li className={`dropdown ${(!isLoggedIn || !isSituationalAnalysisGreen()) ? '' : ''}`}>
                    <a 
                      href="#"
                      onClick={(e) => {
                        if (!isLoggedIn || !isSituationalAnalysisGreen()) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <span>Documents Repository</span> 
                      <i className="bi bi-chevron-down toggle-dropdown"></i>
                    </a>
                    <ul>
                  <li><a href="#">Dropdown 1</a></li>
                      <li className="dropdown">
                        <a href="#"><span>Deep Dropdown</span> <i className="bi bi-chevron-down toggle-dropdown"></i></a>
                        <ul>
                          <li><a href="#">Deep Dropdown 1</a></li>
                          <li><a href="#">Deep Dropdown 2</a></li>
                          <li><a href="#">Deep Dropdown 3</a></li>
                          <li><a href="#">Deep Dropdown 4</a></li>
                          <li><a href="#">Deep Dropdown 5</a></li>
                        </ul>
                      </li>
                      <li><a href="#">Dropdown 2</a></li>
                      <li><a href="#">Dropdown 3</a></li>
                      <li><a href="#">Dropdown 4</a></li>
                    </ul>
                  </li>*/}
              {/*<li>*/}
              {/*  {isLoggedIn ? (*/}
              {/*    <button className="login-button" onClick={onLogout}>*/}
              {/*      Logout*/}
              {/*    </button>*/}
              {/*  ) : (*/}
              {/*    <button className="login-button" onClick={onLoginClick}>*/}
              {/*      Login*/}
              {/*    </button>*/}
              {/*  )}*/}
              {/*</li>*/}
            </ul>
            <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
          </nav>
          <div className="d-flex align-items-center justify-content-between">
            {isLoggedIn ? (
                <button className="cta-btn" onClick={onLogout}>
                  Logout
                </button>
            ) : (
                <button className="cta-btn" onClick={onLoginClick}>
                  Login
                </button>
            )}
            {!isLoggedIn && (
                <a className="cta-btn d-none d-sm-block" href="javascript:void(0);" onClick={onApplyClick}>Join</a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;