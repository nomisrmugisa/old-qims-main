import React from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function InspectionSchedule() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDBox mb={3}>
              <MDTypography variant="h4" fontWeight="medium">
                Inspection Schedule
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item xs={12}>
            <MDBox
              sx={{
                backgroundColor: "white",
                borderRadius: "15px",
                p: 3,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              <MDTypography variant="body1" color="text" align="center" sx={{ py: 4 }}>
                No Inspections Have Currently Been Scheduled
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default InspectionSchedule; 