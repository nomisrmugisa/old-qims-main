// components/Main.jsx
import React, {useEffect, useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import {Pagination, Autoplay} from 'swiper/modules';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Main.css';
import RegistrationForm from './RegistrationForm';
import heroBg from '../assets/hero-bg.jpg';
import aboutImg from '../assets/about.jpg';

const services = [
  {
    id: 1,
    icon: 'fas fa-user-md',
    title: 'Private Practice Licensing',
    summary: 'Guidance and processing for individual private health practitioners seeking to establish a practice in Botswana.',
    details: 'Eligibility checks, application requirements, submission and review.',
    backDetails: (
      <div>
        <strong>Requirements:</strong>
        <ul>
          <li>Recognized by council (NMCB/BHPC)</li>
          <li>Professional & Indemnity insurance</li>
          <li>Resident in Botswana</li>
          <li>Bachelor’s degree (or equivalent)</li>
          <li>5 years clinical experience (citizens)</li>
          <li>References, CV, council registration</li>
        </ul>
        <strong>Special Notes:</strong>
        <ul>
          <li>Non-citizen specialists: 5 years in Botswana</li>
          <li>Attach to clinical setting if not in practice</li>
        </ul>
      </div>
    )
  },
  {
    id: 2,
    icon: 'fas fa-users',
    title: 'Group Practice & Specialized Facility Licensing',
    summary: 'Support for group practices, poly-clinics, EMS, and radiology centers under the Botswana Health Professions Act.',
    details: 'Reserved for citizen healthcare professionals. Proposal and documentation requirements. Five-year license validity.',
    backDetails: (
      <div>
        <strong>Proposal Must Include:</strong>
        <ul>
          <li>Professional services to be offered</li>
          <li>Human resources to be engaged</li>
          <li>Structural resources (equipment, buildings, etc.)</li>
          <li>Clinical governance structure</li>
          <li>Public health benefits & equity</li>
          <li>Innovations & sustainability plan</li>
          <li>Share certifications & incorporation docs</li>
        </ul>
        <strong>Eligibility:</strong>
        <ul>
          <li>Majority shareholder must be a healthcare professional</li>
        </ul>
      </div>
    )
  },
  {
    id: 3,
    icon: 'fas fa-hospital',
    title: 'Private Hospital & Nursing Home Licensing',
    summary: 'Licensing for hospitals, nursing homes, and specialized care facilities under the Private Hospitals and Nursing Homes Act.',
    details: 'Application to the Minister of Health. Proposal must include services, HR, architectural plans, governance, public health benefits, and sustainability.',
    backDetails: (
      <div>
        <strong>Categories:</strong>
        <ul>
          <li>Medical/surgical hospitals</li>
          <li>Maternity hospitals</li>
          <li>Homes for convalescent/chronically ill</li>
          <li>Specialized centers</li>
        </ul>
        <strong>Proposal Must Include:</strong>
        <ul>
          <li>Services, HR, architectural drawings</li>
          <li>Governance, public health benefits</li>
          <li>Equity, innovation, sustainability</li>
        </ul>
      </div>
    )
  },
  {
    id: 4,
    icon: 'fas fa-gavel',
    title: 'Application Review & Committee Adjudication',
    summary: 'Transparent, committee-based review of all applications to ensure compliance and quality.',
    details: 'Monthly or as-needed committee meetings. Authority to approve, defer, or decline applications.',
    backDetails: (
      <div>
        <strong>Process:</strong>
        <ul>
          <li>Committee meets monthly or as needed</li>
          <li>Reviews all applications for compliance</li>
          <li>Focus on public health impact</li>
          <li>Applicants notified of decisions</li>
        </ul>
      </div>
    )
  },
  {
    id: 5,
    icon: 'fas fa-clipboard-check',
    title: 'Facility Inspection & Licensing',
    summary: 'Inspection and licensing services for new and existing private health facilities.',
    details: 'Inspection by the Department of Health Inspectorate. Issuance of license upon satisfactory inspection report.',
    backDetails: (
      <div>
        <strong>Inspection Steps:</strong>
        <ul>
          <li>Apply for inspection after setup</li>
          <li>Inspection conducted by Health Inspectorate</li>
          <li>Report provided within 21 days</li>
          <li>License issued if compliant</li>
        </ul>
        <strong>Note:</strong>
        <ul>
          <li>License holders cannot rent out licenses</li>
        </ul>
      </div>
    )
  },
  {
    id: 6,
    icon: 'fas fa-life-ring',
    title: 'Ongoing Support & Compliance',
    summary: 'Continued support for license holders, including renewals, compliance checks, and updates on regulatory changes.',
    details: 'Reminders for license validity and renewal. Updates on policy or legislative changes. Support for expanding or modifying existing facilities.',
    backDetails: (
      <div>
        <strong>Support Includes:</strong>
        <ul>
          <li>Renewal reminders</li>
          <li>Compliance checks</li>
          <li>Updates on policy/legislation</li>
          <li>Help with expansion or modification</li>
        </ul>
      </div>
    )
  }
];

const Main = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }, []);

    const [flippedCard, setFlippedCard] = useState(null);
    const [hoveredCards, setHoveredCards] = useState([false, false, false, false, false]);

    return (
        <main className="main">
            {/* QIMS Section */}
            <section id="hero" className="hero section" style={{ background: `url(${heroBg}) center center/cover no-repeat` }}>
                {/* <img src={heroBg} alt="" data-aos="fade-in" style={{opacity: 0.7}}/> */}
                <div className="container position-relative">
                    {/*<div className="welcome position-relative" data-aos="fade-down" data-aos-delay="100"*/}
                    {/*     style={{textAlign: 'center'}}>*/}
                    {/*    <h2>GOVERNMENT FACILITY REGISTRY, SURVEY AND<br/>ASSESSMENT SYSTEM</h2>*/}
                    {/*    <p style={{color: 'rgba(255, 255, 255, 0.8)'}}>Health Facility survey and assessment platform to*/}
                    {/*        facilitate the planning, execution, and reporting of health-related surveys and assessments.*/}
                    {/*        The module supports national health assessments, facility-based surveys, and specialized*/}
                    {/*        research studies conducted by the HI, DHS, and other relevant stakeholders.</p>*/}
                    {/*</div>*/}

                    <div className="content row gy-4">
                        <div className="col-lg-4 d-flex align-items-stretch">
                            <div className="why-box" data-aos="zoom-out" data-aos-delay="200">
                                <h3 style={{color: 'white'}}>HEALTH FACILITY INSPECTION, ASSESSMENT & LICENSING</h3>
                                <p style={{color: 'rgba(255, 255, 255, 0.9)'}}>
                                    The Health Facility Management Platform is an innovative system that revolutionizes
                                    the licensing process for health facilities. It offers a user-friendly solution,
                                    enhancing accessibility, transparency, and efficiency. </p><p>This platform reduces
                                    processing time, minimizes required documentation, and eliminates physical visits to
                                    regulatory offices.
                                </p>
                                <div className="text-center">
                                    <a href="#about" className="more-btn"
                                       style={{color: 'white'}}><span>Learn More</span> <i
                                        className="bi bi-chevron-right"></i></a>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-8 d-flex align-items-stretch">
                            <div className="d-flex flex-column justify-content-center">
                                <div className="row gy-4">
                                    <div className="col-xl-4 d-flex align-items-stretch">
                                        <div
                                            className="icon-box"
                                            data-aos="zoom-out"
                                            data-aos-delay="300"
                                            onMouseEnter={() => setHoveredCards([true, false, false, false, false])}
                                            onMouseLeave={() => setHoveredCards([false, false, false, false, false])}
                                            style={{
                                                transform: hoveredCards[0] ? 'translateY(-5px)' : 'translateY(0px)',
                                                transition: 'transform 0.3s ease-in-out',
                                            }}
                                        >
                                            <i className="bi bi-clipboard-data" style={{color: 'white'}}></i>
                                            <h4>New Facility</h4>
                                            <p>Applying for New Services in Health Facility. It is an additional
                                                services in the existing facility.</p>
                                        </div>
                                    </div>

                                    <div className="col-xl-4 d-flex align-items-stretch">
                                        <div
                                            className="icon-box"
                                            data-aos="zoom-out"
                                            data-aos-delay="400"
                                            onMouseEnter={() => setHoveredCards([false, true, false, false, false])}
                                            onMouseLeave={() => setHoveredCards([false, false, false, false, false])}
                                            style={{
                                                transform: hoveredCards[1] ? 'translateY(-5px)' : 'translateY(0px)',
                                                transition: 'transform 0.3s ease-in-out',
                                            }}
                                        >
                                            <i className="bi bi-gem" style={{color: 'white'}}></i>
                                            <h4>Upgrade</h4>
                                            <p>Authorization for Upgrade from one category of Health Facility to
                                                Another. It is a service requested by Private Health Facilities after
                                                fullfulling the requirements to change the category.</p>
                                        </div>
                                    </div>

                                    <div className="col-xl-4 d-flex align-items-stretch">
                                        <div
                                            className="icon-box"
                                            data-aos="zoom-out"
                                            data-aos-delay="500"
                                            onMouseEnter={() => setHoveredCards([false, false, true, false, false])}
                                            onMouseLeave={() => setHoveredCards([false, false, false, false, false])}
                                            style={{
                                                transform: hoveredCards[2] ? 'translateY(-5px)' : 'translateY(0px)',
                                                transition: 'transform 0.3s ease-in-out',
                                            }}
                                        >
                                            <i className="bi bi-inboxes" style={{color: 'white'}}></i>
                                            <h4>Request for Inspection</h4>
                                            <p>Request for Inspection of New Health Facility. This service is for an
                                                entity holding provisional authorization for the registration of a
                                                health facility. Inspections shall be conducted twice a year</p>
                                        </div>
                                    </div>

                                    <div className="col-xl-4 d-flex align-items-stretch">
                                        <div
                                            className="icon-box"
                                            data-aos="zoom-out"
                                            data-aos-delay="500"
                                            onMouseEnter={() => setHoveredCards([false, false, false, true, false])}
                                            onMouseLeave={() => setHoveredCards([false, false, false, false, false])}
                                            style={{
                                                transform: hoveredCards[3] ? 'translateY(-5px)' : 'translateY(0px)',
                                                transition: 'transform 0.3s ease-in-out',
                                            }}
                                        >
                                            <i className="bi bi-inboxes" style={{color: 'white'}}></i>
                                            <h4>Request to amment Staff list</h4>
                                            <p>Request to Add Staff. This is done when there is a changing in
                                                staffing.</p>
                                        </div>
                                    </div>
                                    <div className="col-xl-4 d-flex align-items-stretch">
                                        <div
                                            className="icon-box"
                                            data-aos="zoom-out"
                                            data-aos-delay="500"
                                            onMouseEnter={() => setHoveredCards([false, false, false, false, true])}
                                            onMouseLeave={() => setHoveredCards([false, false, false, false, false])}
                                            style={{
                                                transform: hoveredCards[4] ? 'translateY(-5px)' : 'translateY(0px)',
                                                transition: 'transform 0.3s ease-in-out',
                                            }}
                                        >
                                            <i className="bi bi-inboxes" style={{color: 'white'}}></i>
                                            <h4>Request for public facility assessment</h4>
                                            <p>Module to conducts quality improvement and accreditation.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="services" className="services section">
              <div className="container section-title" data-aos="fade-up">
                <h2>Our Services</h2>
                <p>Comprehensive support for private health practice and facility licensing in Botswana.</p>
              </div>
              <div className="container">
                <div className="row gy-4">
                  {services.map((service, idx) => (
                    <div key={service.id} className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={100 * (idx + 1)}>
                      <div
                        className={`service-flip-card${flippedCard === service.id ? ' flipped' : ''}`}
                        role="button"
                        aria-pressed={flippedCard === service.id}
                        aria-label={flippedCard === service.id ? `Hide details for ${service.title}` : `Show details for ${service.title}`}
                        onClick={() => setFlippedCard(flippedCard === service.id ? null : service.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setFlippedCard(flippedCard === service.id ? null : service.id);
                          }
                        }}
                        style={{ minHeight: 260, height: '100%', cursor: 'pointer' }}
                        tabIndex={0}
                      >
                        <div className="service-flip-inner">
                          <div className="service-flip-front" aria-hidden={flippedCard === service.id ? 'true' : 'false'}>
                            <div className="icon">
                              <i className={service.icon}></i>
                            </div>
                            <h3>{service.title}</h3>
                            <p>{service.summary}</p>
                          </div>
                          <div className="service-flip-back" aria-hidden={flippedCard === service.id ? 'false' : 'true'}>
                            <h4>Details</h4>
                            <p>{service.details}</p>
                            {service.backDetails}
                            <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                              <button
                                className="btn btn-primary"
                                style={{ background: '#1977cc', color: 'white', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 500, cursor: 'pointer' }}
                                onClick={() => alert(`Start Application for: ${service.title}`)}
                                aria-label={`Start application for ${service.title}`}
                              >
                                Start Application
                              </button>
                              <a
                                href="#"
                                className="btn btn-link"
                                style={{ color: '#1977cc', textDecoration: 'underline', fontWeight: 500, padding: '8px 0' }}
                                onClick={e => { e.preventDefault(); alert('Download coming soon!'); }}
                                aria-label={`Download guide for ${service.title}`}
                              >
                                Download Guide
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Application Section */}
            <section id="Registration" className="Registration section">

                {/* Section Title */}
                <div className="container section-title" data-aos="fade-up">
                    <h2>Apply to Register your Facility</h2>
                    <p>Apply for your health facility to begin the licensing process</p>
                </div>
                {/* End Section Title */}

                <div className="container" data-aos="fade-up" data-aos-delay="100">
                    <div className="text-center">
                        <RegistrationForm/>
                    </div>
                </div>

            </section>
            {/* /Application Section */}

            {/* About Section */}
            <section id="about" className="about section">
                <div className="container">
                    <div className="row gy-4 gx-5">
                        <div className="col-lg-6 position-relative align-self-start" data-aos="fade-up"
                             data-aos-delay="200">
                            <div style={{position: 'relative', borderRadius: '8px', overflow: 'hidden'}}>
                                <img
                                    src={aboutImg}
                                    className="img-fluid"
                                    alt="Senior doctor performing facility inspection"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="col-lg-6 content" data-aos="fade-up" data-aos-delay="100">
                            <h3>About Us</h3>
                            <p>
                                We are dedicated to providing efficient and transparent health facility licensing
                                services. Our platform streamlines the process of facility registration, inspection, and
                                licensing while maintaining the highest standards of healthcare quality.
                            </p>
                            <ul>
                                <li>
                                    <i className="bi bi-check-circle"></i>
                                    <div>
                                        <h5>Efficient Processing</h5>
                                        <p>Streamlined licensing process for quick approvals and reduced waiting
                                            times</p>
                                    </div>
                                </li>
                                <li>
                                    <i className="bi bi-check-circle"></i>
                                    <div>
                                        <h5>Quality Standards</h5>
                                        <p>Ensuring high standards in healthcare facilities through rigorous
                                            inspection</p>
                                    </div>
                                </li>
                                <li>
                                    <i className="bi bi-check-circle"></i>
                                    <div>
                                        <h5>Expert Support</h5>
                                        <p>Professional guidance throughout the licensing and inspection process</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section id="stats" className="stats section light-background">
                <div className="container" data-aos="fade-up" data-aos-delay="100">
                    <div className="row gy-4">
                        <div className="col-lg-3 col-md-6 d-flex flex-column align-items-center">
                            <div className="stats-item">
                                <i className="bi bi-building"></i>
                                <span>150+</span>
                                <p>Licensed Facilities</p>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6 d-flex flex-column align-items-center">
                            <div className="stats-item">
                                <i className="bi bi-people"></i>
                                <span>500+</span>
                                <p>Healthcare Professionals</p>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6 d-flex flex-column align-items-center">
                            <div className="stats-item">
                                <i className="bi bi-check-circle"></i>
                                <span>98%</span>
                                <p>Approval Rate</p>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6 d-flex flex-column align-items-center">
                            <div className="stats-item">
                                <i className="bi bi-clock"></i>
                                <span>24/7</span>
                                <p>Support Available</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Main;