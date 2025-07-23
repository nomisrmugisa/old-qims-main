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

import React, { useState, useEffect } from "react";
import {
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import TabsNavBar from "components/TabsNavBar";
import { styled } from "@mui/material/styles";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontSize: 14,
  fontWeight: "bold",
}));

// Function to generate a DHIS2 event ID
const generateEventId = () => {
  // DHIS2 uses a specific format for IDs: 11 characters
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 11; i += 1) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

function ServicesOffered() {
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trackedEntityInstanceId, setTrackedEntityInstanceId] = useState(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [serviceEvents, setServiceEvents] = useState([]); // State for services offered events
  const credentials = localStorage.getItem("userCredentials");
  const orgUnitId = localStorage.getItem("userOrgUnitId");
  // Assuming the same program ID as Employee Registration for now, needs confirmation if different
  const programId = "EE8yeLVo6cN";
  const programStageId = "uL262bA2IP3"; // Services Offered Program Stage ID
  const url = `https://qimsdev.5am.co.bw/qims/api/trackedEntityInstances?ou=${orgUnitId}&ouMode=SELECTED&program=${programId}&fields=*&paging=false`;

  const [formData, setFormData] = useState({
    coreEmergencyServices: false, // j57HXXX4Ijz - TRUE_ONLY
    coreGeneralPracticeServices: false, // ECjGkIq0Deq - TRUE_ONLY
    coreTreatmentAndCare: false, // aM41KiGDJAs - TRUE_ONLY
    coreUrgentCare: false, // flzyZUlf30v - TRUE_ONLY
    additionalHealthEducation: false, // SMvKa2EWeBO - TRUE_ONLY
    specialisedMaternityAndReproductiveHealth: false, // y9QSgKRoc6L - TRUE_ONLY
    specialisedMentalHealthAndSubstanceAbuse: false, // yZhlCTgamq0 - TRUE_ONLY
    specialisedRadiology: false, // RCvjFJQUaPV - TRUE_ONLY
    specialisedRehabilitation: false, // uxcdCPnaqWL - TRUE_ONLY
    supportAmbulatoryCare: false, // r76ODkNZv43 - TRUE_ONLY
    supportDialysisCenters: false, // E7OMKr09N0R - TRUE_ONLY
    supportHospices: false, // GyQNkXpNraW - TRUE_ONLY
    supportLabServices: false, // OgpVvPxkLwf - TRUE_ONLY
    supportNursingHomes: false, // rLC2CE79p7Q - TRUE_ONLY
    supportOutpatientDepartment: false, // w86r0XZCLCr - TRUE_ONLY
    supportPatientTransportation: false, // m8Kl585eWSK - TRUE_ONLY
    supportPharmacy: false, // yecnkdC7HtM - TRUE_ONLY
    additionalCounseling: false, // i0QXYWMOUjy - TRUE_ONLY
    additionalCommunityBased: false, // e48W7983nBs - TRUE_ONLY
  });

  // Fetch option sets from DHIS2 - No longer needed for removed fields
  useEffect(() => {
    // No options to fetch after removing dropdowns
  }, [credentials]);

  // Fetch existing services offered events
  useEffect(() => {
    if (!credentials) {
      window.location.href = "/authentication/sign-in/basic";
      return;
    }

    console.log("Fetching data from URL:", url);

    fetch(url, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error response:", {
            status: res.status,
            statusText: res.statusText,
            headers: Object.fromEntries(res.headers.entries()),
            body: errorText,
          });
          throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Response data:", data);
        let foundInstanceId = false;
        let fetchedServiceEvents = [];
        if (Array.isArray(data.trackedEntityInstances)) {
          data.trackedEntityInstances.forEach((instance) => {
            if (instance.trackedEntityInstance) {
              setTrackedEntityInstanceId(instance.trackedEntityInstance);
              foundInstanceId = true;
              console.log("Tracked Entity Instance ID found:", instance.trackedEntityInstance);
            }
            // Extract and filter events for the services offered program stage
            if (Array.isArray(instance.enrollments)) {
              instance.enrollments.forEach((enrollment) => {
                if (Array.isArray(enrollment.events)) {
                  const servicesEvents = enrollment.events.filter(
                    (event) => event.programStage === programStageId // Filter by services offered program stage
                  );
                  fetchedServiceEvents = fetchedServiceEvents.concat(servicesEvents);
                }
              });
            }
          });
        }
        if (!foundInstanceId) {
          setShowReviewDialog(true);
        }
        setServiceEvents(fetchedServiceEvents); // Set the fetched services events
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        setShowReviewDialog(true);
      });
  }, [url, credentials, programStageId]); // Added programStageId to dependency array

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      coreEmergencyServices: false,
      coreGeneralPracticeServices: false,
      coreTreatmentAndCare: false,
      coreUrgentCare: false,
      additionalHealthEducation: false,
      specialisedMaternityAndReproductiveHealth: false,
      specialisedMentalHealthAndSubstanceAbuse: false,
      specialisedRadiology: false,
      specialisedRehabilitation: false,
      supportAmbulatoryCare: false,
      supportDialysisCenters: false,
      supportHospices: false,
      supportLabServices: false,
      supportNursingHomes: false,
      supportOutpatientDepartment: false,
      supportPatientTransportation: false,
      supportPharmacy: false,
      additionalCounseling: false,
      additionalCommunityBased: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!trackedEntityInstanceId) {
        console.error("No tracked entity instance ID available");
        setShowReviewDialog(true);
        return;
      }

      // Generate a new event ID
      const eventId = generateEventId();

      // Build dataValues array with DHIS2 data elements
      const dataValues = [
        { dataElement: "j57HXXX4Ijz", value: formData.coreEmergencyServices ? "true" : "" }, // Core Emergency Services - TRUE_ONLY
        { dataElement: "ECjGkIq0Deq", value: formData.coreGeneralPracticeServices ? "true" : "" }, // Core General Practice Services - TRUE_ONLY
        { dataElement: "aM41KiGDJAs", value: formData.coreTreatmentAndCare ? "true" : "" }, // Core Treatment and Care - TRUE_ONLY
        { dataElement: "flzyZUlf30v", value: formData.coreUrgentCare ? "true" : "" }, // Core Urgent Care - TRUE_ONLY
        { dataElement: "SMvKa2EWeBO", value: formData.additionalHealthEducation ? "true" : "" }, // Additional Health Education - TRUE_ONLY
        { dataElement: "y9QSgKRoc6L", value: formData.specialisedMaternityAndReproductiveHealth ? "true" : "" }, // Specialised Maternity and Reproductive Health - TRUE_ONLY
        { dataElement: "yZhlCTgamq0", value: formData.specialisedMentalHealthAndSubstanceAbuse ? "true" : "" }, // Specialised Mental Health and Substance Abuse - TRUE_ONLY
        { dataElement: "RCvjFJQUaPV", value: formData.specialisedRadiology ? "true" : "" }, // Specialised Radiology - TRUE_ONLY
        { dataElement: "uxcdCPnaqWL", value: formData.specialisedRehabilitation ? "true" : "" }, // Specialised Rehabilitation - TRUE_ONLY
        { dataElement: "r76ODkNZv43", value: formData.supportAmbulatoryCare ? "true" : "" }, // Support Ambulatory Care - TRUE_ONLY
        { dataElement: "E7OMKr09N0R", value: formData.supportDialysisCenters ? "true" : "" }, // Support Dialysis Centers - TRUE_ONLY
        { dataElement: "GyQNkXpNraW", value: formData.supportHospices ? "true" : "" }, // Support Hospices - TRUE_ONLY
        { dataElement: "OgpVvPxkLwf", value: formData.supportLabServices ? "true" : "" }, // Support Lab Services - TRUE_ONLY
        { dataElement: "rLC2CE79p7Q", value: formData.supportNursingHomes ? "true" : "" }, // Support Nursing Homes - TRUE_ONLY
        { dataElement: "w86r0XZCLCr", value: formData.supportOutpatientDepartment ? "true" : "" }, // Support Outpatient Department - TRUE_ONLY
        { dataElement: "m8Kl585eWSK", value: formData.supportPatientTransportation ? "true" : "" }, // Support Patient Transportation - TRUE_ONLY
        { dataElement: "yecnkdC7HtM", value: formData.supportPharmacy ? "true" : "" }, // Support Pharmacy - TRUE_ONLY
        { dataElement: "i0QXYWMOUjy", value: formData.additionalCounseling ? "true" : "" }, // Additional Counseling - TRUE_ONLY
        { dataElement: "e48W7983nBs", value: formData.additionalCommunityBased ? "true" : "" }, // Additional Community-Based - TRUE_ONLY
      ];

      // Build event payload
      const today = new Date().toISOString().split("T")[0];
      const eventPayload = {
        event: eventId,
        eventDate: today,
        orgUnit: orgUnitId,
        program: programId, // Use the determined program ID
        programStage: programStageId, // Use the Services Offered program stage ID
        status: "ACTIVE",
        trackedEntityInstance: trackedEntityInstanceId,
        dataValues,
      };

      // Send event creation request
      const response = await fetch("https://qimsdev.5am.co.bw/qims/api/events", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error("Failed to create event");
      }

      handleCloseDialog();
      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error("Error creating event:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <TabsNavBar />
      <MDBox py={3}>
          <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDBox mb={3} display="flex" alignItems="center">
              <MDTypography variant="h4" fontWeight="medium">
                Services Offered Details
              </MDTypography>
              <IconButton
                color="primary"
                onClick={handleOpenDialog}
                sx={{ ml: 2 }}
                disabled={!trackedEntityInstanceId}
              >
                <AddIcon />
              </IconButton>
              </MDBox>
            <MDBox
              sx={{
                backgroundColor: "white",
                borderRadius: "15px",
                p: 3,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableRow>
                    {/* Add headers for TRUE_ONLY services if needed in the table */}
                     <StyledTableCell>Core Emergency</StyledTableCell>
                     <StyledTableCell>Core General Practice</StyledTableCell>
                     <StyledTableCell>Core Treatment & Care</StyledTableCell>
                     <StyledTableCell>Core Urgent Care</StyledTableCell>
                     <StyledTableCell>Additional Health Education</StyledTableCell>
                     <StyledTableCell>Specialised Maternity & Reprod. Health</StyledTableCell>
                     <StyledTableCell>Specialised Mental Health & Subst. Abuse</StyledTableCell>
                     <StyledTableCell>Specialised Radiology</StyledTableCell>
                     <StyledTableCell>Specialised Rehabilitation</StyledTableCell>
                     <StyledTableCell>Support Ambulatory Care</StyledTableCell>
                     <StyledTableCell>Support Dialysis Centers</StyledTableCell>
                     <StyledTableCell>Support Hospices</StyledTableCell>
                     <StyledTableCell>Support Lab Services</StyledTableCell>
                     <StyledTableCell>Support Nursing Homes</StyledTableCell>
                     <StyledTableCell>Support Outpatient Department</StyledTableCell>
                     <StyledTableCell>Support Patient Transportation</StyledTableCell>
                     <StyledTableCell>Support Pharmacy</StyledTableCell>
                     <StyledTableCell>Additional Counseling</StyledTableCell>
                     <StyledTableCell>Additional Community-Based</StyledTableCell>
                  </TableRow>
                  <TableBody>
                    {isLoading ? (
                       <TableRow>
                         <TableCell colSpan={18} align="center"> {/* Adjust colspan as needed */}
                           <MDTypography variant="body1" color="text">
                            Loading services...
                           </MDTypography>
                         </TableCell>
                       </TableRow>
                    ) : (
                      serviceEvents.length === 0 ? (
                         <TableRow>
                           <TableCell colSpan={18} align="center"> {/* Adjust colspan as needed */}
                             <MDTypography variant="body1" color="text">
                               No services registered yet
                             </MDTypography>
                           </TableCell>
                         </TableRow>
                      ) : (
                        serviceEvents.map((event) => (
                          <TableRow key={event.event}> {/* Use event.event as the key */}
                            {/* Display TRUE_ONLY data elements as "Yes" or "No" or similar */}
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "j57HXXX4Ijz")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "ECjGkIq0Deq")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "aM41KiGDJAs")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "flzyZUlf30v")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "SMvKa2EWeBO")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "y9QSgKRoc6L")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "yZhlCTgamq0")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "RCvjFJQUaPV")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "uxcdCPnaqWL")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "r76ODkNZv43")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "E7OMKr09N0R")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "GyQNkXpNraW")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "OgpVvPxkLwf")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "rLC2CE79p7Q")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "w86r0XZCLCr")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "m8Kl585eWSK")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "yecnkdC7HtM")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "i0QXYWMOUjy")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "e48W7983nBs")?.value === 'true' ? 'Yes' : 'No'}</TableCell>
                          </TableRow>
                        ))
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Services Offered
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <MDBox display="flex" flexDirection="column" gap={2}>
            <Grid container spacing={2}>
              
              <Grid item xs={12}> {/* Use full width for checkboxes */}
                 <MDTypography variant="h6" sx={{ mb: 1 }}>Core Services</MDTypography>
                 <FormGroup>
                   <FormControlLabel
                     control={<Checkbox checked={formData.coreEmergencyServices} onChange={handleInputChange} name="coreEmergencyServices" />}
                     label="Core Emergency Services"
                   />
                    <FormControlLabel
                     control={<Checkbox checked={formData.coreGeneralPracticeServices} onChange={handleInputChange} name="coreGeneralPracticeServices" />}
                     label="Core General Practice Services"
                   />
                    <FormControlLabel
                     control={<Checkbox checked={formData.coreTreatmentAndCare} onChange={handleInputChange} name="coreTreatmentAndCare" />}
                     label="Core Treatment and Care"
                   />
                    <FormControlLabel
                     control={<Checkbox checked={formData.coreUrgentCare} onChange={handleInputChange} name="coreUrgentCare" />}
                     label="Core Urgent Care:"
                   />
                 </FormGroup>
              </Grid>
               <Grid item xs={12}> {/* Use full width for checkboxes */}
                 <MDTypography variant="h6" sx={{ mb: 1 }}>Additional Services</MDTypography>
                 <FormGroup>
                   <FormControlLabel
                     control={<Checkbox checked={formData.additionalHealthEducation} onChange={handleInputChange} name="additionalHealthEducation" />}
                     label="Additional Health Education"
                   />
                    <FormControlLabel
                     control={<Checkbox checked={formData.additionalCounseling} onChange={handleInputChange} name="additionalCounseling" />}
                     label="Additional Counseling"
                   />
                    <FormControlLabel
                     control={<Checkbox checked={formData.additionalCommunityBased} onChange={handleInputChange} name="additionalCommunityBased" />}
                     label="Additional Community-Based"
                   />
                 </FormGroup>
              </Grid>
               <Grid item xs={12}> {/* Use full width for checkboxes */}
                 <MDTypography variant="h6" sx={{ mb: 1 }}>Specialised Services</MDTypography>
                 <FormGroup>
                   <FormControlLabel
                     control={<Checkbox checked={formData.specialisedMaternityAndReproductiveHealth} onChange={handleInputChange} name="specialisedMaternityAndReproductiveHealth" />}
                     label="Specialised Maternity and Reproductive Health"
                   />
                    <FormControlLabel
                     control={<Checkbox checked={formData.specialisedMentalHealthAndSubstanceAbuse} onChange={handleInputChange} name="specialisedMentalHealthAndSubstanceAbuse" />}
                     label="Specialised Mental Health and Substance Abuse"
                   />
                    <FormControlLabel
                     control={<Checkbox checked={formData.specialisedRadiology} onChange={handleInputChange} name="specialisedRadiology" />}
                     label="Specialised Radiology"
                   />
                    <FormControlLabel
                     control={<Checkbox checked={formData.specialisedRehabilitation} onChange={handleInputChange} name="specialisedRehabilitation" />}
                     label="Specialised Rehabilitation"
                   />
                 </FormGroup>
              </Grid>
               <Grid item xs={12}> {/* Use full width for checkboxes */}
                 <MDTypography variant="h6" sx={{ mb: 1 }}>Support Services</MDTypography>
                 <FormGroup>
                   <FormControlLabel
                     control={<Checkbox checked={formData.supportAmbulatoryCare} onChange={handleInputChange} name="supportAmbulatoryCare" />}
                     label="Support Ambulatory Care"
                   />
                    <FormControlLabel
                     control={<Checkbox checked={formData.supportDialysisCenters} onChange={handleInputChange} name="supportDialysisCenters" />}
                     label="Support Dialysis Centers"
                   />
                    <FormControlLabel
                     control={<Checkbox checked={formData.supportHospices} onChange={handleInputChange} name="supportHospices" />}
                     label="Support Hospices"
                   />
                    <FormControlLabel
                     control={<Checkbox checked={formData.supportLabServices} onChange={handleInputChange} name="supportLabServices" />}
                     label="Support Lab Services"
                   />
                    <FormControlLabel
                     control={<Checkbox checked={formData.supportNursingHomes} onChange={handleInputChange} name="supportNursingHomes" />}
                     label="Support Nursing Homes"
                   />
                    <FormControlLabel
                     control={<Checkbox checked={formData.supportOutpatientDepartment} onChange={handleInputChange} name="supportOutpatientDepartment" />}
                     label="Support Outpatient Department"
                   />
                    <FormControlLabel
                     control={<Checkbox checked={formData.supportPatientTransportation} onChange={handleInputChange} name="supportPatientTransportation" />}
                     label="Support Patient Transportation"
                   />
                    <FormControlLabel
                     control={<Checkbox checked={formData.supportPharmacy} onChange={handleInputChange} name="supportPharmacy" />}
                     label="Support Pharmacy"
                   />
                 </FormGroup>
              </Grid>
            </Grid>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onClose={() => setShowReviewDialog(false)}>
        <DialogTitle>
          Registration Under Review
        </DialogTitle>
        <DialogContent>
          <MDTypography>
            Your Request is under Review, you will be notified on email when review is complete to complete your registration
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReviewDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
}

export default ServicesOffered; 