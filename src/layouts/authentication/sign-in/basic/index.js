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

import { useState } from "react";

// react-router-dom components
import {Link, useNavigate} from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";

// Otis Admin PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

//login page
function Basic() {
  const navigate = useNavigate();

  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleSignIn = async () => {
    setError("");
    try {
      const credentials = btoa(`${username}:${password}`);
      const response = await fetch("https://qimsdev.5am.co.bw/qims/api/me", {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (response.ok) {
        // Fetch organization units after successful authentication
        const orgUnitsResponse = await fetch(
          "https://qimsdev.5am.co.bw/qims/api/me?fields=organisationUnits[id,displayName]",
          {
            headers: {
              Authorization: `Basic ${credentials}`,
            },
          }
        );

        if (orgUnitsResponse.ok) {
          const orgUnitsData = await orgUnitsResponse.json();
          // Store the first organization unit ID and name in localStorage
          if (orgUnitsData.organisationUnits && orgUnitsData.organisationUnits.length > 0) {
            localStorage.setItem("userOrgUnitId", orgUnitsData.organisationUnits[0].id);
            localStorage.setItem("userOrgUnitName", orgUnitsData.organisationUnits[0].displayName);
            localStorage.setItem("userCredentials", credentials);
            navigate("/dashboards/facility-ownership");
          } else {
            setError("No organization units assigned to your account. Please contact your administrator.");
          }
        } else {
          switch (orgUnitsResponse.status) {
            case 401:
              setError("Your session has expired. Please log in again.");
              break;
            case 403:
              setError("You don't have permission to access organization units. Please contact your administrator.");
              break;
            case 404:
              setError("Organization unit information not found. Please contact support.");
              break;
            case 500:
              setError("Server error while fetching organization units. Please try again later.");
              break;
            default:
              setError("Failed to fetch organization units. Please try again or contact support.");
          }
        }
      } else {
        switch (response.status) {
          case 401:
            setError("Invalid username or password. Please try again.");
            break;
          case 403:
            setError("Account is locked. Please contact your administrator.");
            break;
          case 410:
            setError("Account has expired. Please contact your administrator.");
            break;
          case 429:
            setError("Too many login attempts. Please try again later.");
            break;
          case 500:
            setError("Server error. Please try again later.");
            break;
          default:
            setError("Login failed. Please check your credentials and try again.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        setError("Network connection error. Please check your internet connection and try again.");
      } else if (error.name === 'SyntaxError') {
        setError("Invalid response from server. Please try again or contact support.");
      } else {
        setError("An unexpected error occurred. Please try again or contact support.");
      }
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sign in
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <FacebookIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GitHubIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GoogleIcon color="inherit" />
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </MDBox>
            {error && (
              <MDTypography variant="body2" color="error" textAlign="center" mb={2}>
                {error}
              </MDTypography>
            )}
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth onClick={handleSignIn}>
                sign in
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Don&apos;t have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up/cover"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign up
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
