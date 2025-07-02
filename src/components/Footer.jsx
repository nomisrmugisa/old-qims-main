// components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer id="footer" className="footer light-background">
      <div className="container footer-top">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6 footer-about">
            <a href="index.html" className="logo d-flex align-items-center">
              <span className="sitename">QIMS</span>
            </a>
            <div className="footer-contact pt-3">
              <p>Director</p>
              <p>Health Inspectorate</p>
              <p>Private Bag 0038</p>
              <p>Gaborone</p>
              <p className="mt-3"><strong>Phone:</strong> <span>(267) 3632602</span></p>
              <p><strong>Fax:</strong> <span>(267) 3974512</span></p>
              <p><strong>Email:</strong> <span>info@example.com</span></p>
            </div>
            <div className="social-links d-flex mt-4">
              <a href=""><i className="bi bi-twitter-x"></i></a>
              <a href=""><i className="bi bi-facebook"></i></a>
              <a href=""><i className="bi bi-instagram"></i></a>
              <a href=""><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Physical Address</h4>
            <p>Ministry of Health</p>
            <p>Plot 54861</p>
            <p>Government Enclave</p>
            <p>Office no 8A:34</p>
          </div>


        </div>
      </div>

      <div className="container copyright text-center mt-4">
        <p>© <span>Copyright</span> <strong className="px-1 sitename">QIMS</strong> <span>All Rights Reserved</span></p>
        <div className="credits">
          {/* All the links in the footer should remain intact. */}
          {/* You can delete the links only if you've purchased the pro version. */}
          {/* Licensing information: https://bootstrapmade.com/license/ */}
          {/* Purchase the pro version with working PHP/AJAX contact form: [buy-url] */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;