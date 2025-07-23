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

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Collapse from "@mui/material/Collapse";
import Icon from "@mui/material/Icon";

// Otis Admin PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Otis Admin PRO React context
import { useMaterialUIController } from "context";

function DefaultNavbarLink({
  name,
  openHandler = false,
  closeHandler = false,
  children = false,
  collapseStatus = false,
  light = false,
  ...rest
}) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  return (
    <>
      <MDBox
        {...rest}
        mx={1}
        p={1}
        onMouseEnter={children ? undefined : openHandler}
        onMouseLeave={children ? undefined : closeHandler}
        display="flex"
        alignItems="baseline"
        color={light ? "white" : "dark"}
        sx={{ cursor: "pointer", userSelect: "none" }}
      >
        <MDTypography
          variant="button"
          fontWeight="regular"
          textTransform="capitalize"
          color={darkMode ? "white" : "inherit"}
          sx={{
            fontWeight: 700,
            fontSize: "14px",
            color: "#000080",
            transition: "color 0.3s ease",
            "&:hover": {
              color: "#D3D3D3", // Slightly darker green for hover (optional)
              textDecoration: "underline !important",
              textUnderlineOffset: "10px",
            },
            "&:active": {
              color: "#D3D3D3", // Slightly darker green for hover (optional)
              textDecoration: "underline !important",
              textUnderlineOffset: "10px",
            },
          }}
        >
          {name}
        </MDTypography>
        {openHandler && (
          <MDTypography variant="body2" color={light ? "white" : "dark"}>
            <Icon sx={{ fontWeight: "bold", verticalAlign: "middle" }}>keyboard_arrow_down</Icon>
          </MDTypography>
        )}
      </MDBox>
      {children && (
        <Collapse in={Boolean(collapseStatus)} timeout="auto" unmountOnExit>
          {children}
        </Collapse>
      )}
    </>
  );
}

// Typechecking props for the DefaultNavbarLink
DefaultNavbarLink.propTypes = {
  name: PropTypes.string.isRequired,
  openHandler: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  closeHandler: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  children: PropTypes.node,
  collapseStatus: PropTypes.bool,
  light: PropTypes.bool,
};

export default DefaultNavbarLink;
