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

const Main = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }, []);

    const [hoveredCards, setHoveredCards] = useState([false, false, false, false]);

    const handleMouseEnter = (index) => {
        const newHoveredCards = [...hoveredCards];
        newHoveredCards[index] = true;
        setHoveredCards(newHoveredCards);
    };

    const handleMouseLeave = (index) => {
        const newHoveredCards = [...hoveredCards];
        newHoveredCards[index] = false;
        setHoveredCards(newHoveredCards);
    };

    return (
        <main className="main">
            {/* QIMS Section */}
            <section id="hero" className="hero section">
                <img src="/assets/img/hero-bg.jpg" alt="" data-aos="fade-in" style={{opacity: 0.7}}/>
                <div className="container position-relative">
                    <div className="welcome position-relative" data-aos="fade-down" data-aos-delay="100"
                         style={{textAlign: 'center'}}>
                        <h2>GOVERNMENT FACILITY REGISTRY, SURVEY AND<br/>ASSESSMENT SYSTEM</h2>
                        <p style={{color: 'rgba(255, 255, 255, 0.8)'}}>Health Facility survey and assessment platform to
                            facilitate the planning, execution, and reporting of health-related surveys and assessments.
                            The module supports national health assessments, facility-based surveys, and specialized
                            research studies conducted by the HI, DHS, and other relevant stakeholders.</p>
                    </div>

                    <div className="content row gy-4">
                        <div className="col-lg-4 d-flex align-items-stretch">
                            <div className="why-box" data-aos="zoom-out" data-aos-delay="200">
                                <h3 style={{color: 'white'}}>PRIVATE FACILITY INSPECTION & LICENSING</h3>
                                <p style={{color: 'rgba(255, 255, 255, 0.9)'}}>
                                    The Health Facility Licensing Platform is an innovative system that revolutionizes
                                    the licensing process for health facilities. It offers a user-friendly solution,
                                    enhancing accessibility, transparency, and efficiency. This platform reduces
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
                                            onMouseEnter={() => handleMouseEnter(0)}
                                            onMouseLeave={() => handleMouseLeave(0)}
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
                                            onMouseEnter={() => handleMouseEnter(1)}
                                            onMouseLeave={() => handleMouseLeave(1)}
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
                                            onMouseEnter={() => handleMouseEnter(2)}
                                            onMouseLeave={() => handleMouseLeave(2)}
                                            style={{
                                                transform: hoveredCards[2] ? 'translateY(-5px)' : 'translateY(0px)',
                                                transition: 'transform 0.3s ease-in-out',
                                            }}
                                        >
                                            <i className="bi bi-inboxes" style={{color: 'white'}}></i>
                                            <h4>Inspection Request</h4>
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
                                            onMouseEnter={() => handleMouseEnter(3)}
                                            onMouseLeave={() => handleMouseLeave(3)}
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
                                </div>
                            </div>
                        </div>
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
                                    src="/assets/img/about.jpg"
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