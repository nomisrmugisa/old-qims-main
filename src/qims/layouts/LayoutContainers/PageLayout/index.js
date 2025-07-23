/**
=========================================================
* Otis Admin PRO - v2.0.2
=========================================================

* Product Page: https://material-ui.com/store/items/otis-admin-pro-material-dashboard-react/
* Copyright 2024 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useEffect } from "react";

// react-router-dom components
import { useLocation } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// Otis Admin PRO React components
import MDBox from "components/MDBox";

// Otis Admin PRO React context
import { useMaterialUIController, setLayout } from "context";

function PageLayout({ children }) {
  const [, dispatch] = useMaterialUIController();
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "page");
  }, [pathname]);

  return (
    <MDBox
      height="100%"
      minHeight="100vh"
      bgColor="#F5F5F5"
      sx={{
        overflowX: "hidden",
        backgroundImage: "url(/images/bgm1.png)", // Image from public folder
        backgroundRepeat: "repeat", // Keeps the image tiled
        backgroundSize: "200px 150px", // Adjust tile size (smaller image)
        backgroundPosition: "top left", // Align pattern
      }}
    >
      {children}
    </MDBox>
  );
}

// Typechecking props for the PageLayout
PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PageLayout;
