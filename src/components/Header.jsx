// components/Header.jsx
import React, { useEffect, useState } from 'react';
import './Header.css';
import logo from '../assets/logo.png';

const Header = ({ onLoginClick, isLoggedIn, onLogout, activeDashboardSection, setActiveDashboardSection }) => {
  const [orgUnitName, setOrgUnitName] = useState('');
  const [situationalAnalysisComplete, setSituationalAnalysisComplete] = useState(false);
  const [facilityOwnershipComplete, setFacilityOwnershipComplete] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  
  // Function to handle document download
  const handleDocumentDownload = async (e, documentId, fileName) => {
    e.preventDefault();
    setIsDownloading(true);
    setDownloadError(null);
    
    try {
      const credentials = localStorage.getItem('userCredentials');
      if (!credentials) {
        throw new Error('Authentication required. Please log in.');
      }
      
      const downloadUrl = `${import.meta.env.VITE_DHIS2_URL}/api/documents/${documentId}/data`;
      
      // Fetch the document with authentication
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Basic ${credentials}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      // Get the file as a blob
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.setAttribute('download', fileName);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(downloadLink);
      
      // Show success message or notification here if needed
      console.log('Download successful');
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError(error.message);
      // You could display this error to the user with a toast notification
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Function to check if Situational Analysis is green (completed)
  const isSituationalAnalysisGreen = () => {
    return situationalAnalysisComplete;
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

  // Monitor localStorage for changes to facilityOwnershipComplete
  useEffect(() => {
    const checkFacilityOwnershipStatus = () => {
      const status = localStorage.getItem('facilityOwnershipComplete') === 'true';
      setFacilityOwnershipComplete(status);
    };
    
    // Check immediately
    checkFacilityOwnershipStatus();
    
    // Set up interval to check periodically
    const intervalId = setInterval(checkFacilityOwnershipStatus, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Get organization unit name when component mounts or isLoggedIn changes
    if (isLoggedIn) {
      const fetchOrgUnitName = async () => {
        try {
          const credentials = localStorage.getItem('userCredentials');
          if (!credentials) {
            console.error('No credentials found in localStorage');
            return;
          }

          console.log('📊 FETCHING ORGANIZATION UNIT DATA');
          console.log('- API URL:', `${import.meta.env.VITE_DHIS2_URL}/api/me?fields=organisationUnits[displayName,id]`);
          
          const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/me?fields=organisationUnits[displayName,id]`, {
            headers: {
              Authorization: `Basic ${credentials}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('- API Response:', data);
            
            if (data && data.organisationUnits && data.organisationUnits.length > 0) {
              const orgUnitName = data.organisationUnits[0].displayName;
              const orgUnitId = data.organisationUnits[0].id;
              
              console.log('✅ ORGANIZATION UNIT DATA:');
              console.log('- Name:', orgUnitName);
              console.log('- ID:', orgUnitId);
              
              setOrgUnitName(orgUnitName);
              // Also store in localStorage for future use
              localStorage.setItem('userOrgUnitName', orgUnitName);
              localStorage.setItem('userOrgUnitId', orgUnitId);
            } else {
              console.log('❌ No organization units found in response');
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
        }
      };

      fetchOrgUnitName();
    }
  }, [isLoggedIn]);

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
              <a href="#" className="twitter"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="facebook"><i className="bi bi-facebook"></i></a>
              <a href="#" className="instagram"><i className="bi bi-instagram"></i></a>
              <a href="#" className="linkedin"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
        </div>
      </div>

      <div className="branding d-flex align-items-center">
        <div className="container position-relative d-flex align-items-center justify-content-between">
          <div className="logo d-flex flex-column align-items-center">
            <img src={logo} alt="Ministry of Health Logo" className="header-logo" style={{ width: '90px', height: '90px' }} />
          </div>

          <nav id="navmenu" className="navmenu">
            <ul>
              {isLoggedIn ? (
                <>
                  <li>
                    <a
                      href="#overview"
                      className={`${activeDashboardSection === 'overview' ? 'active' : ''} ${!facilityOwnershipComplete ? 'disabled-link' : ''}`}
                      onClick={e => { 
                        e.preventDefault(); 
                        if (facilityOwnershipComplete) {
                          setActiveDashboardSection('overview');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                    >
                      Overview
                    </a>
                  </li>
                  <li>
                    <a
                      href="#registration"
                      className={activeDashboardSection === 'registration' ? 'active' : ''}
                      onClick={e => { 
                        e.preventDefault(); 
                        setActiveDashboardSection('registration');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Complete Application
                    </a>
                  </li>
                  <li>
                    <a
                      href="#inspections"
                      className={`${activeDashboardSection === 'inspections' ? 'active' : ''} ${!facilityOwnershipComplete ? 'disabled-link' : ''}`}
                      onClick={e => { 
                        e.preventDefault(); 
                        if (facilityOwnershipComplete) {
                          setActiveDashboardSection('inspections');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                    >
                      View Inspections
                    </a>
                  </li>
                  <li>
                    <a
                      href="#services"
                      className={`${activeDashboardSection === 'services' ? 'active' : ''} ${!facilityOwnershipComplete ? 'disabled-link' : ''}`}
                      onClick={e => { 
                        e.preventDefault(); 
                        if (facilityOwnershipComplete) {
                          setActiveDashboardSection('services');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                    >
                      Services
                    </a>
                  </li>
                  <li>
                    <a
                      href="#reports"
                      className={`${activeDashboardSection === 'reports' ? 'active' : ''} ${!facilityOwnershipComplete ? 'disabled-link' : ''}`}
                      onClick={e => { 
                        e.preventDefault(); 
                        if (facilityOwnershipComplete) {
                          setActiveDashboardSection('reports');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                    >
                      Reports
                    </a>
                  </li>
                  <li>
                    <a
                      href="#tasks"
                      className={`${activeDashboardSection === 'tasks' ? 'active' : ''} ${!facilityOwnershipComplete ? 'disabled-link' : ''}`}
                      onClick={e => { 
                        e.preventDefault(); 
                        if (facilityOwnershipComplete) {
                          setActiveDashboardSection('tasks');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                    >
                      Tasks
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <a 
                      href="#home"
                      className={`${activeDashboardSection === 'home' ? 'active' : ''} ${(!isLoggedIn || !isSituationalAnalysisGreen()) ? 'active' : ''}`}
                      onClick={(e) => {
                        if (isLoggedIn && isSituationalAnalysisGreen()) {
                          setActiveDashboardSection('home');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
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
                          window.scrollTo({ top: 0, behavior: 'smooth' });
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
                          window.scrollTo({ top: 0, behavior: 'smooth' });
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
                        href="#services"
                        className={`${activeDashboardSection === 'services' ? 'active' : ''} ${(!isLoggedIn || !isSituationalAnalysisGreen()) ? '' : ''}`}
                        onClick={(e) => {
                          if (!isLoggedIn && !isSituationalAnalysisGreen()) {
                            setActiveDashboardSection('services');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } else {
                            e.preventDefault();
                          }
                        }}
                    >
                      Services
                    </a>
                  </li>
                  <li>
                    <a
                        href="#report-incident"
                        className={`${activeDashboardSection === 'report-incident' ? 'active' : ''} ${(!isLoggedIn || !isSituationalAnalysisGreen()) ? '' : ''}`}
                        onClick={(e) => {
                          if (isLoggedIn && isSituationalAnalysisGreen()) {
                            setActiveDashboardSection('report-incident');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
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
                      <li>
                        <a 
                          href="#" 
                          onClick={(e) => handleDocumentDownload(
                            e, 
                            'nO1LbjtYHO7', 
                            'GUIDELINES_FOR_PRIVATE_PRACTICE_LICENSING_IN_BOTSWANA.pdf'
                          )}
                          style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            cursor: isDownloading ? 'wait' : 'pointer'
                          }}
                        >
                          {isDownloading ? (
                            <>
                              <i className="bi bi-arrow-clockwise me-2" style={{ animation: 'spin 1s linear infinite' }}></i>
                              <span>Downloading...</span>
                            </>
                          ) : (
                            <>
                              <i className="bi bi-file-pdf me-2"></i>
                              <span>GUIDELINES FOR PRIVATE PRACTICE LICENSING IN BOTSWANA</span>
                            </>
                          )}
                        </a>
                      </li>
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
                  </li>
                </>
              )}
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
                <a className="cta-btn d-none d-sm-block" href="#Registration">Apply</a>
            )}
          </div>
        </div>
      </div>
      
      {/* Download error notification */}
      {downloadError && (
        <div 
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px 15px',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            maxWidth: '400px'
          }}
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>
            <strong>Download Error:</strong> {downloadError}
            <button 
              onClick={() => setDownloadError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#721c24',
                fontSize: '1.2rem',
                cursor: 'pointer',
                position: 'absolute',
                top: '5px',
                right: '10px'
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;