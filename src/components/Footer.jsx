// components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
      <footer id="footer" className="footer light-background">
        <div className="container footer-top">
          <div className="d-flex flex-wrap justify-content-evenly text-center">

            {/* Left Column */}
            <div className="text-start mx-md-3 order-2 order-md-1" style={{ flexGrow: 0 }}>
              <h4>Contact Information</h4>
              <p>Director</p>
              <p>Health Inspectorate</p>
              <p>Private Bag 0038</p>
              <p>Gaborone</p>
              <p className="mt-3"><strong>Phone:</strong> <span>(267) 3632602</span></p>
              <p><strong>Fax:</strong> <span>(267) 3974512</span></p>
            </div>

            {/* Middle Column */}
            <div className="text-center p-10 mx-md-3 order-1 order-md-2 flex-grow-1">
              <div style={{ width: "65%", margin: "0 auto" }}>
                <h3>Quality Information Management System (QIMS)</h3>
                <div className="social-links d-flex justify-content-center mt-4">
                  <p><strong>Email:</strong> <span>info@example.com</span></p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="text-start mx-md-3 order-3 order-md-3" style={{ flexGrow: 0 }}>
              <h4>Physical Address</h4>
              <p>Ministry of Health</p>
              <p>Plot 54861,</p>
              <p>24 Amos Street</p>
              <p>Government Enclave</p>
              <p>Office no 8A:34</p>
            </div>

          </div>



        </div>

        <div className="container text-center mt-4">
          <p>
            © <span>Copyright</span> <strong className="px-1 sitename">QIMS</strong>
            <span>All Rights Reserved</span>
          </p>
          <div className="credits">
            {/* Credit links would go here */}
          </div>
        </div>
      </footer>
  );
};

export default Footer;