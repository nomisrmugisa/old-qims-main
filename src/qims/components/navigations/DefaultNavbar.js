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

import { useState, useEffect } from "react";

// react-router components
import { Link } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import Container from "@mui/material/Container";
import Icon from "@mui/material/Icon";

// Otis Admin PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Otis Admin PRO React example components
import DefaultNavbarLink from "examples/Navbars/DefaultNavbar/DefaultNavbarLink";
import DefaultNavbarMobile from "examples/Navbars/DefaultNavbar/DefaultNavbarMobile";

// Otis Admin PRO React base styles
import breakpoints from "assets/theme/base/breakpoints";

// import colors from "assets/theme/base/colors";

// DefaultNavbar dropdown menus
import PagesMenu from "examples/Navbars/DefaultNavbar/Menus/PagesMenu";
import AuthenticationMenu from "examples/Navbars/DefaultNavbar/Menus/AuthenticationMenu";
import EcommerceMenu from "examples/Navbars/DefaultNavbar/Menus/EcommerceMenu";
import ApplicationsMenu from "examples/Navbars/DefaultNavbar/Menus/ApplicationsMenu";
import DocsMenu from "examples/Navbars/DefaultNavbar/Menus/DocsMenu";
// import { Image } from "@mui/icons-material";
// import logo from "assets/images/logo";
import mohlogo from "assets/qims/images/logos/moh-logo.png";
// import Grid from "@mui/material/Grid";

// Otis Admin PRO React context
// import { useMaterialUIController } from "context";

function DefaultNavbar({
  routes,
  transparent = false,
  light = false,
  action = false,
  register = false,
}) {
  // const [controller] = useMaterialUIController();
  // const { darkMode } = controller;

  const [pagesMenu, setPagesMenu] = useState(false);
  const [authenticationMenu, setAuthenticationMenu] = useState(false);
  const [ecommerceMenu, setEcommerceMenu] = useState(false);
  const [applicationsMenu, setApplicationsMenu] = useState(false);
  const [docsMenu, setDocsMenu] = useState(false);
  const [mobileNavbar, setMobileNavbar] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  // const openPagesMenu = ({ currentTarget }) => setPagesMenu(currentTarget);
  const closePagesMenu = () => setPagesMenu(false);
  // const openAuthenticationMenu = ({ currentTarget }) => setAuthenticationMenu(currentTarget);
  const closeAuthenticationMenu = () => setAuthenticationMenu(false);
  // const openEcommerceMenu = ({ currentTarget }) => setEcommerceMenu(currentTarget);
  const closeEcommerceMenu = () => setEcommerceMenu(false);
  // const openApplicationsMenu = ({ currentTarget }) => setApplicationsMenu(currentTarget);
  const closeApplicationsMenu = () => setApplicationsMenu(false);
  const openDocsMenu = ({ currentTarget }) => setDocsMenu(currentTarget);
  const closeDocsMenu = () => setDocsMenu(false);
  const openMobileNavbar = ({ currentTarget }) => setMobileNavbar(currentTarget.parentNode);
  const closeMobileNavbar = () => setMobileNavbar(false);

  useEffect(() => {
    // A function that sets the display state for the DefaultNavbarMobile.
    function displayMobileNavbar() {
      if (window.innerWidth < breakpoints.values.lg) {
        setMobileView(true);
        setMobileNavbar(false);
      } else {
        setMobileView(false);
        setMobileNavbar(false);
      }
    }

    /** 
     The event listener that's calling the displayMobileNavbar function when 
     resizing the window.
    */
    window.addEventListener("resize", displayMobileNavbar);

    // Call the displayMobileNavbar function to set the state with the initial value.
    displayMobileNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", displayMobileNavbar);
  }, []);

  return (
    <Container>
      <MDBox
        py={1}
        px={{ xs: 4, sm: transparent ? 2 : 3, lg: transparent ? 0 : 2 }}
        my={3}
        mx={3}
        width="calc(100% - 48px)"
        borderRadius="lg"
        shadow={transparent ? "none" : "md"}
        color={light ? "white" : "dark"}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        position="absolute"
        left={0}
        zIndex={3}
      >
        <MDBox
          component={Link}
          to="/"
          py={transparent ? 1.5 : 0.75}
          lineHeight={1}
          pl={{ xs: 0, lg: 1 }}
        >
          <MDBox display="flex" justifyContent="center" alignItems="flex-start">
            <MDBox
              component="img"
              src={mohlogo}
              alt="Ministry of Health Logo"
              width={{ xs: "30%", xl: "30%" }}
              opacity={0.9}
              mb={3}
            />
            <MDBox display="flex" flexDirection="column" justifyContent="flex-end" height="100%">
              <MDTypography
                variant="button"
                fontWeight="bold"
                fontSize={22}
                color={light ? "white" : "dark"}
              >
                Ministry of Health
              </MDTypography>
              <MDTypography
                variant="button"
                fontWeight="bold"
                fontSize={18}
                color={light ? "white" : "dark"}
              >
                Republic of Botswana
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
        <MDBox
          color="inherit"
          display={{ xs: "none", lg: "flex" }}
          m={0}
          p={0}
          sx={{
            ml: "auto",
            mr: "1.3rem", // Adds a small gap on the right
            backgroundColor: "rgba(0, 0, 0, 0.1)", // 20% black overlay
            borderRadius: "0.35rem",
          }}
        >
          <DefaultNavbarLink
            name={<span style={{ whiteSpace: "nowrap" }}>About us</span>}
            openHandler={null}
            closeHandler={closePagesMenu}
            light={light}
          />
          <DefaultNavbarLink
            name={<span style={{ whiteSpace: "nowrap" }}>Check License</span>}
            openHandler={null}
            closeHandler={closeAuthenticationMenu}
            light={light}
          />
          <DefaultNavbarLink
            name={<span style={{ whiteSpace: "nowrap" }}>Client Portal</span>}
            openHandler={null}
            closeHandler={closeApplicationsMenu}
            light={light}
          />
          <DefaultNavbarLink
            name={<span style={{ whiteSpace: "nowrap" }}>Report Incident</span>}
            openHandler={null}
            closeHandler={closeEcommerceMenu}
            light={light}
          />
          <DefaultNavbarLink
            name={<span style={{ whiteSpace: "nowrap" }}>Docs Repo</span>}
            openHandler={openDocsMenu}
            closeHandler={closeDocsMenu}
            light={light}
          />
        </MDBox>
        <MDBox display="flex" gap={2} alignItems="center">
          {register &&
            (register.type === "internal" ? (
              <MDButton
                component={Link}
                to={register.route}
                variant="gradient"
                color={register.color ? register.color : "info"}
                size="small"
              >
                {register.label}
              </MDButton>
            ) : (
              <MDButton
                component="a"
                href={register.route}
                target="_blank"
                rel="noreferrer"
                variant="gradient"
                color={register.color ? register.color : "info"}
                size="small"
                sx={{ mt: -0.3 }}
              >
                {register.label}
              </MDButton>
            ))}
          {action &&
            (action.type === "internal" ? (
              <MDBox display={{ xs: "none", lg: "inline-block" }}>
                <MDButton
                  component={Link}
                  to={action.route}
                  variant="gradient"
                  color={action.color ? action.color : "info"}
                  size="small"
                >
                  {action.label}
                </MDButton>
              </MDBox>
            ) : (
              <MDBox display={{ xs: "none", lg: "inline-block" }}>
                <MDButton
                  component="a"
                  href={action.route}
                  target="_blank"
                  rel="noreferrer"
                  variant="gradient"
                  color={action.color ? action.color : "info"}
                  size="small"
                  sx={{ mt: -0.3 }}
                >
                  {action.label}
                </MDButton>
              </MDBox>
            ))}
        </MDBox>
        <MDBox
          display={{ xs: "inline-block", lg: "none" }}
          lineHeight={0}
          py={1.5}
          pl={1.5}
          color="inherit"
          sx={{ cursor: "pointer" }}
          onClick={openMobileNavbar}
        >
          <Icon fontSize="default">{mobileNavbar ? "close" : "menu"}</Icon>
        </MDBox>
      </MDBox>
      <PagesMenu routes={routes} open={pagesMenu} close={closePagesMenu} />
      <AuthenticationMenu
        routes={routes}
        open={authenticationMenu}
        close={closeAuthenticationMenu}
      />
      <EcommerceMenu routes={routes} open={ecommerceMenu} close={closeEcommerceMenu} />
      <ApplicationsMenu routes={routes} open={applicationsMenu} close={closeApplicationsMenu} />
      <DocsMenu routes={routes} open={docsMenu} close={closeDocsMenu} />
      {mobileView && (
        <DefaultNavbarMobile routes={routes} open={mobileNavbar} close={closeMobileNavbar} />
      )}
    </Container>
  );
}

// Typechecking props for the DefaultNavbar
DefaultNavbar.propTypes = {
  routes: PropTypes.instanceOf(Array).isRequired,
  transparent: PropTypes.bool,
  light: PropTypes.bool,
  action: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      type: PropTypes.oneOf(["external", "internal"]).isRequired,
      route: PropTypes.string.isRequired,
      color: PropTypes.oneOf([
        "primary",
        "secondary",
        "info",
        "success",
        "warning",
        "error",
        "dark",
        "light",
      ]),
      label: PropTypes.string.isRequired,
    }),
  ]),
  register: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      type: PropTypes.oneOf(["external", "internal"]).isRequired,
      route: PropTypes.string.isRequired,
      color: PropTypes.oneOf([
        "primary",
        "secondary",
        "info",
        "success",
        "warning",
        "error",
        "dark",
        "light",
      ]),
      label: PropTypes.string.isRequired,
    }),
  ]),
};

export default DefaultNavbar;
