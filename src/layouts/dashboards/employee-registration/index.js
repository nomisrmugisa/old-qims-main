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
  TextField,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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

// Removed unused StyledTableRow component
/*
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: "#e3f2fd",
    cursor: "pointer",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));
*/

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

function EmployeeRegistration() {
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trackedEntityInstanceId, setTrackedEntityInstanceId] = useState(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [positionOptions, setPositionOptions] = useState([]);
  const [contractTypeOptions, setContractTypeOptions] = useState([]);
  const [employeeEvents, setEmployeeEvents] = useState([]); // State for employee registration events
  const credentials = localStorage.getItem("userCredentials");
  const orgUnitId = localStorage.getItem("userOrgUnitId");
  const url = `https://qimsdev.5am.co.bw/qims/api/trackedEntityInstances?ou=${orgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=*&paging=false`;

  const [formData, setFormData] = useState({
    firstName: "", // IIxbad41cH6
    lastName: "", // VFTRgPnvSHV
    BHPCNumber: "", // xcTxmEUy6g6
    position: "", // FClCncccLzw
    contractType: "", // F3h1A96t3uL
  });

  // Fetch option sets from DHIS2
  useEffect(() => {
    const fetchOptionSets = async () => {
      try {
        // Fetch Position option set (Staff Position)
        const positionResponse = await fetch(
          "https://qimsdev.5am.co.bw/qims/api/optionSets/n9MPSCoty7L?fields=options[code,displayName]",
          {
            headers: {
              Authorization: `Basic ${credentials}`,
            },
          }
        );
        if (!positionResponse.ok) {
          console.error(
            "Failed to fetch position options:",
            positionResponse.status,
            positionResponse.statusText
          );
          setPositionOptions([]);
          return;
        }
        const positionData = await positionResponse.json();
        console.log("Position options data:", positionData); // Debug log
        if (positionData.options) {
          console.log("Position options array:", positionData.options); // Debug log the array content
          setPositionOptions(positionData.options);
        }

        // Fetch Contract Type option set (Staff Contract Type)
        const contractResponse = await fetch(
          "https://qimsdev.5am.co.bw/qims/api/optionSets/c6X6G67ooIe?fields=options[code,displayName]",
          {
            headers: {
              Authorization: `Basic ${credentials}`,
            },
          }
        );
        if (!contractResponse.ok) {
          console.error(
            "Failed to fetch contract options:",
            contractResponse.status,
            contractResponse.statusText
          );
          setContractTypeOptions([]);
          return;
        }
        const contractData = await contractResponse.json();
        console.log("Contract options data:", contractData); // Debug log
        if (contractData.options) {
          console.log("Contract options array:", contractData.options); // Debug log the array content
          setContractTypeOptions(contractData.options);
        }

      } catch (error) {
        console.error("Error fetching option sets:", error);
        setPositionOptions([]);
        setContractTypeOptions([]);
      }
    };

    if (credentials) {
      fetchOptionSets();
    }
  }, [credentials]);

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
        let fetchedEmployeeEvents = [];
        if (Array.isArray(data.trackedEntityInstances)) {
          data.trackedEntityInstances.forEach((instance) => {
            if (instance.trackedEntityInstance) {
              setTrackedEntityInstanceId(instance.trackedEntityInstance);
              foundInstanceId = true;
              console.log("Tracked Entity Instance ID found:", instance.trackedEntityInstance);
            }
            // Extract and filter events for the employee registration program stage
            if (Array.isArray(instance.enrollments)) {
              instance.enrollments.forEach((enrollment) => {
                if (Array.isArray(enrollment.events)) {
                  const employeeRegEvents = enrollment.events.filter(
                    (event) => event.programStage === 'xjhA4eEHyhw' // Filter by employee registration program stage
                  );
                  fetchedEmployeeEvents = fetchedEmployeeEvents.concat(employeeRegEvents);
                }
              });
            }
          });
        }
        if (!foundInstanceId) {
          setShowReviewDialog(true);
        }
        setEmployeeEvents(fetchedEmployeeEvents); // Set the fetched employee events
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        setShowReviewDialog(true);
      });
  }, [url, credentials]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      firstName: "",
      lastName: "",
      BHPCNumber: "",
      position: "",
      contractType: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
        { dataElement: "IIxbad41cH6", value: formData.firstName },
        { dataElement: "VFTRgPnvSHV", value: formData.lastName },
        { dataElement: "xcTxmEUy6g6", value: formData.BHPCNumber },
        { dataElement: "FClCncccLzw", value: formData.position },
        { dataElement: "F3h1A96t3uL", value: formData.contractType },
      ];

      // Build event payload
      const today = new Date().toISOString().split("T")[0];
      const eventPayload = {
        event: eventId,
        eventDate: today,
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN",
        programStage: "xjhA4eEHyhw",
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
      window.location.reload(); // Keep reload for now, can be refined later
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
                Employee Registration Details
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
                    <StyledTableCell>First Name</StyledTableCell>
                    <StyledTableCell>Last Name</StyledTableCell>
                    <StyledTableCell>BHPC/NMC Number</StyledTableCell>
                    <StyledTableCell>Position</StyledTableCell>
                    <StyledTableCell>Contract Type</StyledTableCell>
                  </TableRow>
                  <TableBody>
                    {isLoading ? (
                       <TableRow>
                         <TableCell colSpan={5} align="center">
                           <MDTypography variant="body1" color="text">
                            Loading employees...
                           </MDTypography>
                         </TableCell>
                       </TableRow>
                    ) : (
                      employeeEvents.length === 0 ? (
                         <TableRow>
                           <TableCell colSpan={5} align="center">
                             <MDTypography variant="body1" color="text">
                               No employees registered yet
                             </MDTypography>
                           </TableCell>
                         </TableRow>
                      ) : (
                        employeeEvents.map((event) => (
                          <TableRow key={event.event}> {/* Use event.event as the key */}
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "IIxbad41cH6")?.value || ""}</TableCell> {/* First Name */}
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "VFTRgPnvSHV")?.value || ""}</TableCell> {/* Last Name */}
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "xcTxmEUy6g6")?.value || ""}</TableCell> {/* BHPC/NMC Number */}
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "FClCncccLzw")?.value || ""}</TableCell> {/* Position */}
                            <TableCell>{event.dataValues?.find((dv) => dv.dataElement === "F3h1A96t3uL")?.value || ""}</TableCell> {/* Contract Type */}
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
          Employee Registration
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="BHPC/NMC Number"
                  name="BHPCNumber"
                  value={formData.BHPCNumber}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Position</InputLabel>
                  <Select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    label="Position"
                  >
                    <MenuItem value="" key="select-position-placeholder">
                      <em>Select Position</em>
                    </MenuItem>
                    {positionOptions && positionOptions.length > 0 ? (
                      positionOptions.map((option) => {
                        console.log("Position option:", option.code, option.displayName); // Log each option with displayName
                        return (
                          <MenuItem key={option.code} value={option.code}>
                            {option.displayName}
                          </MenuItem>
                        );
                      })
                    ) : (
                      <MenuItem key="loading-position" disabled>Loading positions...</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Officer Contract Type</InputLabel>
                  <Select
                    name="contractType"
                    value={formData.contractType}
                    onChange={handleInputChange}
                    label="Officer Contract Type"
                  >
                    <MenuItem value="" key="select-contract-placeholder">
                      <em>Select Contract Type</em>
                    </MenuItem>
                    {contractTypeOptions && contractTypeOptions.length > 0 ? (
                      contractTypeOptions.map((option) => {
                         console.log("Contract option:", option.code, option.displayName); // Log each option with displayName
                        return (
                          <MenuItem key={option.code} value={option.code}>
                            {option.displayName}
                          </MenuItem>
                        );
                      })
                    ) : (
                      <MenuItem key="loading-contract" disabled>Loading contract types...</MenuItem>
                    )}
                  </Select>
                </FormControl>
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
            disabled={
              !formData.firstName ||
              !formData.lastName ||
              !formData.BHPCNumber ||
              !formData.position ||
              !formData.contractType
            }
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onClose={() => setShowReviewDialog(false)}>
        <DialogTitle>Registration Under Review</DialogTitle>
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

export default EmployeeRegistration;
