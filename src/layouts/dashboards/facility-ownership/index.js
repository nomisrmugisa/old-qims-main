import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Grid,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import TabsNavBar from "components/TabsNavBar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontSize: 14,
  fontWeight: "bold",
}));

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

function FacilityOwnership() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trackedEntityInstanceId, setTrackedEntityInstanceId] = useState(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const credentials = localStorage.getItem("userCredentials");
  const orgUnitId = localStorage.getItem("userOrgUnitId"); // Fallback to default if not set
  const url = `https://qimsdev.5am.co.bw/qims/api/trackedEntityInstances?ou=${orgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=*&paging=false`;

  const [openDialog, setOpenDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    eventDate: "",
    orgUnitName: "",
    firstName: "",
    surname: "",
    citizen: "",
    ownershipType: "",
    idType: "",
    id: "",
    copyOfIdPassport: null,
    professionalReference1: null,
    professionalReference2: null,
    qualificationCertificates: null,
    validRecentPermit: null,
    workPermitWaiver: null,
    companyRegistrationDocuments: null,
  });
  const [newFormData, setNewFormData] = useState({
    firstName: "",
    surname: "",
    citizen: "",
    ownershipType: "",
    idType: "",
    id: "",
    copyOfIdPassport: null,
    professionalReference1: null,
    professionalReference2: null,
    qualificationCertificates: null,
    validRecentPermit: null,
    workPermitWaiver: null,
    companyRegistrationDocuments: null,
  });

  useEffect(() => {
    if (!credentials) {
      // Redirect to login if no credentials found
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
          // Log the full error response for debugging
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
        let fetchedEvents = [];
        let foundInstanceId = false;
        if (Array.isArray(data.trackedEntityInstances)) {
          data.trackedEntityInstances.forEach((instance) => {
            if (instance.trackedEntityInstance) {
              setTrackedEntityInstanceId(instance.trackedEntityInstance);
              foundInstanceId = true;
              console.log("Tracked Entity Instance ID found:", instance.trackedEntityInstance);
              console.log("Obtained from GET request URL:", url);
            }
            if (Array.isArray(instance.enrollments)) {
              instance.enrollments.forEach((enrollment) => {
                if (Array.isArray(enrollment.events)) {
                  fetchedEvents = fetchedEvents.concat(enrollment.events);
                }
              });
            }
          });
        }
        if (!foundInstanceId) {
          setShowReviewDialog(true);
        }
        const filteredEvents = fetchedEvents.filter(
          (event) => event.programStage === "MuJubgTzJrY"
        );
        setEvents(filteredEvents);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        setShowReviewDialog(true);
      });
  }, [url, credentials]);

  const handleRowClick = (event) => {
    setSelectedEvent(event);
    setEditFormData({
      eventDate: event.eventDate || "",
      orgUnitName: event.orgUnitName || "",
      firstName:
        event.dataValues?.find((dv) => dv.dataElement === "HMk4LZ9ESOq")?.value ||
        event.createdByUserInfo?.firstName ||
        "",
      surname:
        event.dataValues?.find((dv) => dv.dataElement === "ykwhsQQPVH0")?.value ||
        event.createdByUserInfo?.surname ||
        "",
      citizen:
        event.dataValues?.find((dv) => dv.dataElement === "zVmmto7HwOc")?.value ||
        event.citizen ||
        "",
      ownershipType:
        event.dataValues?.find((dv) => dv.dataElement === "vAHHXaW0Pna")?.value ||
        event.ownershipType ||
        "",
      idType:
        event.dataValues?.find((dv) => dv.dataElement === "FLcrCfTNcQi")?.value ||
        event.idType ||
        "",
      id:
        event.dataValues?.find((dv) => dv.dataElement === "aUGSyyfbUVI")?.value || event.id || "",
      copyOfIdPassport:
        event.dataValues?.find((dv) => dv.dataElement === "KRj1TOR5cVM")?.value || null,
      professionalReference1:
        event.dataValues?.find((dv) => dv.dataElement === "yP49GKSQxPl")?.value || null,
      professionalReference2:
        event.dataValues?.find((dv) => dv.dataElement === "lC217zTgC6C")?.value || null,
      qualificationCertificates:
        event.dataValues?.find((dv) => dv.dataElement === "pelCBFPIFY1")?.value || null,
      validRecentPermit:
        event.dataValues?.find((dv) => dv.dataElement === "cUObXSGtCuD")?.value || null,
      workPermitWaiver:
        event.dataValues?.find((dv) => dv.dataElement === "g9jXH9LJyxU")?.value || null,
      companyRegistrationDocuments:
        event.dataValues?.find((dv) => dv.dataElement === "fSGzyNOvsn3")?.value || null,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleUpdate = async () => {
    if (!selectedEvent) return;

    try {
      // 1. Upload files and get fileResourceIds
      const uploadFileAndGetId = async (file) => {
        if (!file) return null;
        const fileData = new FormData();
        fileData.append("file", file);
        const fileRes = await fetch("https://qimsdev.5am.co.bw/qims/api/fileResources", {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
          },
          body: fileData,
        });
        const fileJson = await fileRes.json();
        return fileJson.response.fileResource.id;
      };

      // Upload all files in parallel
      const [
        copyOfIdPassportId,
        professionalReference1Id,
        professionalReference2Id,
        qualificationCertificatesId,
        validRecentPermitId,
        workPermitWaiverId,
        companyRegistrationDocumentsId,
      ] = await Promise.all([
        uploadFileAndGetId(editFormData.copyOfIdPassport),
        uploadFileAndGetId(editFormData.professionalReference1),
        uploadFileAndGetId(editFormData.professionalReference2),
        uploadFileAndGetId(editFormData.qualificationCertificates),
        uploadFileAndGetId(editFormData.validRecentPermit),
        uploadFileAndGetId(editFormData.workPermitWaiver),
        uploadFileAndGetId(editFormData.companyRegistrationDocuments),
      ]);

      // Helper function to convert values to proper string format
      const convertToProperString = (value) => {
        if (value === null || value === undefined) {
          return "";
        }
        if (typeof value === "boolean") {
          return value ? "true" : "";
        }
        return String(value);
      };

      // 2. Build dataValues array with all fields and correct dataElement IDs
      const dataValues = [
        { dataElement: "HMk4LZ9ESOq", value: convertToProperString(editFormData.firstName) }, // First Name
        { dataElement: "ykwhsQQPVH0", value: convertToProperString(editFormData.surname) }, // Surname
        { dataElement: "zVmmto7HwOc", value: convertToProperString(editFormData.citizen) }, // Citizenship
        { dataElement: "aUGSyyfbUVI", value: convertToProperString(editFormData.id) }, // ID
        { dataElement: "FLcrCfTNcQi", value: convertToProperString(editFormData.idType) }, // ID Type
        { dataElement: "vAHHXaW0Pna", value: convertToProperString(editFormData.ownershipType) }, // Type of ownership
        { dataElement: "RCvjFJQUaPV", value: "true" }, // Set to true for boolean value
      ];
      if (copyOfIdPassportId)
        dataValues.push({ dataElement: "KRj1TOR5cVM", value: convertToProperString(copyOfIdPassportId) });
      if (professionalReference1Id)
        dataValues.push({ dataElement: "yP49GKSQxPl", value: convertToProperString(professionalReference1Id) });
      if (professionalReference2Id)
        dataValues.push({ dataElement: "lC217zTgC6C", value: convertToProperString(professionalReference2Id) });
      if (qualificationCertificatesId)
        dataValues.push({ dataElement: "pelCBFPIFY1", value: convertToProperString(qualificationCertificatesId) });
      if (validRecentPermitId)
        dataValues.push({ dataElement: "cUObXSGtCuD", value: convertToProperString(validRecentPermitId) });
      if (workPermitWaiverId)
        dataValues.push({ dataElement: "g9jXH9LJyxU", value: convertToProperString(workPermitWaiverId) });
      if (companyRegistrationDocumentsId)
        dataValues.push({ dataElement: "fSGzyNOvsn3", value: convertToProperString(companyRegistrationDocumentsId) });

      // 3. Build event update payload
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const eventUpdatePayload = {
        event: selectedEvent.event,
        eventDate: today,
        orgUnit: selectedEvent.orgUnit,
        program: "EE8yeLVo6cN",
        programStage: "MuJubgTzJrY",
        status: "ACTIVE",
        trackedEntityInstance: "ASfKU6xlu8F",
        dataValues,
      };

      // 4. Send event update as JSON
      const response = await fetch("https://qimsdev.5am.co.bw/qims/api/events?", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventUpdatePayload),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const fileInput = e.target;
    if (fileInput.files.length > 0) {
      const fileData = new FormData();
      fileData.append("file", fileInput.files[0]);
      const fileRes = await fetch("https://qimsdev.5am.co.bw/qims/api/fileResources", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        body: fileData,
      });
      const fileJson = await fileRes.json();
      const fileResourceId = fileJson.response.fileResource.id;

      // Now you can use fileResourceId to update your event
      // This is a placeholder and should be replaced with actual implementation
      console.log("File uploaded successfully. File Resource ID:", fileResourceId);
    }
  };

  const handleAddNew = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewFormData({
      firstName: "",
      surname: "",
      citizen: "",
      ownershipType: "",
      idType: "",
      id: "",
      copyOfIdPassport: null,
      professionalReference1: null,
      professionalReference2: null,
      qualificationCertificates: null,
      validRecentPermit: null,
      workPermitWaiver: null,
      companyRegistrationDocuments: null,
    });
  };

  const handleNewInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setNewFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleAddSubmit = async () => {
    try {
      if (!trackedEntityInstanceId) {
        console.error("No tracked entity instance ID available");
        return;
      }

      // Generate a new event ID
      const eventId = generateEventId();

      // Upload files and get fileResourceIds
      const uploadFileAndGetId = async (file) => {
        if (!file) return null;
        const fileData = new FormData();
        fileData.append("file", file);
        const fileRes = await fetch("https://qimsdev.5am.co.bw/qims/api/fileResources", {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
          },
          body: fileData,
        });
        const fileJson = await fileRes.json();
        return fileJson.response.fileResource.id;
      };

      // Upload all files in parallel
      const [
        copyOfIdPassportId,
        professionalReference1Id,
        professionalReference2Id,
        qualificationCertificatesId,
        validRecentPermitId,
        workPermitWaiverId,
        companyRegistrationDocumentsId,
      ] = await Promise.all([
        uploadFileAndGetId(newFormData.copyOfIdPassport),
        uploadFileAndGetId(newFormData.professionalReference1),
        uploadFileAndGetId(newFormData.professionalReference2),
        uploadFileAndGetId(newFormData.qualificationCertificates),
        uploadFileAndGetId(newFormData.validRecentPermit),
        uploadFileAndGetId(newFormData.workPermitWaiver),
        uploadFileAndGetId(newFormData.companyRegistrationDocuments),
      ]);

      // Helper function to convert values to proper string format
      const convertToProperString = (value) => {
        if (value === null || value === undefined) {
          return "";
        }
        if (typeof value === "boolean") {
          return value ? "true" : "";
        }
        return String(value);
      };

      // Build dataValues array
      const dataValues = [
        { dataElement: "HMk4LZ9ESOq", value: convertToProperString(newFormData.firstName) },
        { dataElement: "ykwhsQQPVH0", value: convertToProperString(newFormData.surname) },
        { dataElement: "zVmmto7HwOc", value: convertToProperString(newFormData.citizen) },
        { dataElement: "aUGSyyfbUVI", value: convertToProperString(newFormData.id) },
        { dataElement: "FLcrCfTNcQi", value: convertToProperString(newFormData.idType) },
        { dataElement: "vAHHXaW0Pna", value: convertToProperString(newFormData.ownershipType) },
        { dataElement: "RCvjFJQUaPV", value: "true" }, // Set to true for boolean value
      ];

      if (copyOfIdPassportId)
        dataValues.push({ dataElement: "KRj1TOR5cVM", value: convertToProperString(copyOfIdPassportId) });
      if (professionalReference1Id)
        dataValues.push({ dataElement: "yP49GKSQxPl", value: convertToProperString(professionalReference1Id) });
      if (professionalReference2Id)
        dataValues.push({ dataElement: "lC217zTgC6C", value: convertToProperString(professionalReference2Id) });
      if (qualificationCertificatesId)
        dataValues.push({ dataElement: "pelCBFPIFY1", value: convertToProperString(qualificationCertificatesId) });
      if (validRecentPermitId)
        dataValues.push({ dataElement: "cUObXSGtCuD", value: convertToProperString(validRecentPermitId) });
      if (workPermitWaiverId)
        dataValues.push({ dataElement: "g9jXH9LJyxU", value: convertToProperString(workPermitWaiverId) });
      if (companyRegistrationDocumentsId)
        dataValues.push({ dataElement: "fSGzyNOvsn3", value: convertToProperString(companyRegistrationDocumentsId) });

      // Build event payload with the generated event ID and tracked entity instance ID
      const today = new Date().toISOString().split("T")[0];
      const eventPayload = {
        event: eventId,
        eventDate: today,
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN",
        programStage: "MuJubgTzJrY",
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
        throw new Error("Failed to create event");
      }

      handleCloseAddDialog();
      // Refresh the events list
      window.location.reload();
    } catch (error) {
      console.error("Error creating event:", error);
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
                Facility Ownership Details
              </MDTypography>
              <IconButton
                color="primary"
                onClick={handleAddNew}
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
                    <StyledTableCell>Report Date</StyledTableCell>
                    <StyledTableCell>Organization Unit</StyledTableCell>
                    <StyledTableCell>First Name</StyledTableCell>
                    <StyledTableCell>Surname</StyledTableCell>
                    <StyledTableCell>Citizenship</StyledTableCell>
                    <StyledTableCell>Program Stage ID</StyledTableCell>
                    <StyledTableCell>Event ID</StyledTableCell>
                    <StyledTableCell>Tracked Entity Instance ID</StyledTableCell>
                  </TableRow>
                  <TableBody>
                    {events.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <MDTypography variant="body1" color="text">
                            {isLoading ? "Loading events..." : "No events found"}
                          </MDTypography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      events.map((event) => (
                        <StyledTableRow key={event.event} onClick={() => handleRowClick(event)}>
                          <TableCell>{event.eventDate}</TableCell>
                          <TableCell>{event.orgUnitName}</TableCell>
                          <TableCell>
                            {event.dataValues?.find((dv) => dv.dataElement === "HMk4LZ9ESOq")
                              ?.value || ""}
                          </TableCell>
                          <TableCell>
                            {event.dataValues?.find((dv) => dv.dataElement === "ykwhsQQPVH0")
                              ?.value || ""}
                          </TableCell>
                          <TableCell>
                            {event.dataValues?.find((dv) => dv.dataElement === "zVmmto7HwOc")
                              ?.value || ""}
                          </TableCell>
                          <TableCell>{event.programStage}</TableCell>
                          <TableCell>{event.event}</TableCell>
                          <TableCell>{event.trackedEntityInstance}</TableCell>
                        </StyledTableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Ownership Details
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
            <TextField
              fullWidth
              select
              label="Type of ownership"
              name="ownershipType"
              value={editFormData.ownershipType}
              onChange={handleInputChange}
              SelectProps={{ native: true }}
            >
              <option value="">Select Type</option>
              <option value="Private Owned">Private Owned</option>
              <option value="Public Owned">Public Owned</option>
              <option value="Other">Other</option>
            </TextField>
            <TextField
              fullWidth
              label="Surname"
              name="surname"
              value={editFormData.surname}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={editFormData.firstName}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Citizenship"
              name="citizen"
              value={editFormData.citizen}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="ID Type"
              name="idType"
              value={editFormData.idType}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="ID"
              name="id"
              value={editFormData.id}
              onChange={handleInputChange}
            />
            <MDTypography variant="caption" color="text" sx={{ mb: 0.5 }}>
              Copy of ID / Passport
            </MDTypography>
            <Button variant="outlined" component="label" fullWidth>
              {editFormData.copyOfIdPassport ? editFormData.copyOfIdPassport.name : "Upload file"}
              <input type="file" name="copyOfIdPassport" hidden onChange={handleFileUpload} />
            </Button>
            <MDTypography variant="caption" color="text" sx={{ mb: 0.5 }}>
              Professional Reference 1
            </MDTypography>
            <Button variant="outlined" component="label" fullWidth>
              {editFormData.professionalReference1 ? editFormData.professionalReference1.name : "Upload file"}
              <input type="file" name="professionalReference1" hidden onChange={handleFileUpload} />
            </Button>
            <MDTypography variant="caption" color="text" sx={{ mb: 0.5 }}>
              Professional Reference 2
            </MDTypography>
            <Button variant="outlined" component="label" fullWidth>
              {editFormData.professionalReference2 ? editFormData.professionalReference2.name : "Upload file"}
              <input type="file" name="professionalReference2" hidden onChange={handleFileUpload} />
            </Button>
            <MDTypography variant="caption" color="text" sx={{ mb: 0.5 }}>
              Qualification Certificates
            </MDTypography>
            <Button variant="outlined" component="label" fullWidth>
              {editFormData.qualificationCertificates ? editFormData.qualificationCertificates.name : "Upload file"}
              <input type="file" name="qualificationCertificates" hidden onChange={handleFileUpload} />
            </Button>
            <MDTypography variant="caption" color="text" sx={{ mb: 0.5 }}>
              Copy of Valid Recent Permit
            </MDTypography>
            <Button variant="outlined" component="label" fullWidth>
              {editFormData.validRecentPermit ? editFormData.validRecentPermit.name : "Upload file"}
              <input type="file" name="validRecentPermit" hidden onChange={handleFileUpload} />
            </Button>
            <MDTypography variant="caption" color="text" sx={{ mb: 0.5 }}>
              Work Permit / Waiver
            </MDTypography>
            <Button variant="outlined" component="label" fullWidth>
              {editFormData.workPermitWaiver ? editFormData.workPermitWaiver.name : "Upload file"}
              <input type="file" name="workPermitWaiver" hidden onChange={handleFileUpload} />
            </Button>
            <MDTypography variant="caption" color="text" sx={{ mb: 0.5 }}>
              Company Registration Documents
            </MDTypography>
            <Button variant="outlined" component="label" fullWidth>
              {editFormData.companyRegistrationDocuments ? editFormData.companyRegistrationDocuments.name : "Upload file"}
              <input type="file" name="companyRegistrationDocuments" hidden onChange={handleFileUpload} />
            </Button>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleUpdate} variant="contained" color="primary" disabled={!editFormData.ownershipType || !editFormData.surname || !editFormData.firstName || !editFormData.citizen || !editFormData.idType || !editFormData.id || !editFormData.copyOfIdPassport || !editFormData.professionalReference1 || !editFormData.professionalReference2 || !editFormData.qualificationCertificates || !editFormData.validRecentPermit || !editFormData.workPermitWaiver || !editFormData.companyRegistrationDocuments}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Add Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New Facility Ownership
          <IconButton
            aria-label="close"
            onClick={handleCloseAddDialog}
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
            <TextField
              fullWidth
              select
              label="Type of ownership"
              name="ownershipType"
              value={newFormData.ownershipType}
              onChange={handleNewInputChange}
              SelectProps={{ native: true }}
            >
              <option value="">Select Type</option>
              <option value="Private Owned">Private Owned</option>
              <option value="Public Owned">Public Owned</option>
              <option value="Other">Other</option>
            </TextField>
            <TextField
              fullWidth
              label="Surname"
              name="surname"
              value={newFormData.surname}
              onChange={handleNewInputChange}
            />
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={newFormData.firstName}
              onChange={handleNewInputChange}
            />
            <TextField
              fullWidth
              label="Citizenship"
              name="citizen"
              value={newFormData.citizen}
              onChange={handleNewInputChange}
            />
            <TextField
              fullWidth
              label="ID Type"
              name="idType"
              value={newFormData.idType}
              onChange={handleNewInputChange}
            />
            <TextField
              fullWidth
              label="ID"
              name="id"
              value={newFormData.id}
              onChange={handleNewInputChange}
            />
            <MDTypography variant="caption" color="text" sx={{ mb: 0.5 }}>
              Copy of ID / Passport
            </MDTypography>
            <Button variant="outlined" component="label" fullWidth>
              {newFormData.copyOfIdPassport ? newFormData.copyOfIdPassport.name : "Upload file"}
              <input type="file" name="copyOfIdPassport" hidden onChange={handleNewInputChange} />
            </Button>
            <MDTypography variant="caption" color="text" sx={{ mb: 0.5 }}>
              Professional Reference 1
            </MDTypography>
            <Button variant="outlined" component="label" fullWidth>
              {newFormData.professionalReference1 ? newFormData.professionalReference1.name : "Upload file"}
              <input type="file" name="professionalReference1" hidden onChange={handleNewInputChange} />
            </Button>
            <MDTypography variant="caption" color="text" sx={{ mb: 0.5 }}>
              Professional Reference 2
            </MDTypography>
            <Button variant="outlined" component="label" fullWidth>
              {newFormData.professionalReference2 ? newFormData.professionalReference2.name : "Upload file"}
              <input type="file" name="professionalReference2" hidden onChange={handleNewInputChange} />
            </Button>
            <MDTypography variant="caption" color="text" sx={{ mb: 0.5 }}>
              Qualification Certificates
            </MDTypography>
            <Button variant="outlined" component="label" fullWidth>
              {newFormData.qualificationCertificates ? newFormData.qualificationCertificates.name : "Upload file"}
              <input type="file" name="qualificationCertificates" hidden onChange={handleNewInputChange} />
            </Button>
            <MDTypography variant="caption" color="text" sx={{ mb: 0.5 }}>
              Copy of Valid Recent Permit
            </MDTypography>
            <Button variant="outlined" component="label" fullWidth>
              {newFormData.validRecentPermit ? newFormData.validRecentPermit.name : "Upload file"}
              <input type="file" name="validRecentPermit" hidden onChange={handleNewInputChange} />
            </Button>
            <MDTypography variant="caption" color="text" sx={{ mb: 0.5 }}>
              Work Permit / Waiver
            </MDTypography>
            <Button variant="outlined" component="label" fullWidth>
              {newFormData.workPermitWaiver ? newFormData.workPermitWaiver.name : "Upload file"}
              <input type="file" name="workPermitWaiver" hidden onChange={handleNewInputChange} />
            </Button>
            <MDTypography variant="caption" color="text" sx={{ mb: 0.5 }}>
              Company Registration Documents
            </MDTypography>
            <Button variant="outlined" component="label" fullWidth>
              {newFormData.companyRegistrationDocuments ? newFormData.companyRegistrationDocuments.name : "Upload file"}
              <input type="file" name="companyRegistrationDocuments" hidden onChange={handleNewInputChange} />
            </Button>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleAddSubmit} variant="contained" color="primary" disabled={!newFormData.ownershipType || !newFormData.surname || !newFormData.firstName || !newFormData.citizen || !newFormData.idType || !newFormData.id || !newFormData.copyOfIdPassport || !newFormData.professionalReference1 || !newFormData.professionalReference2 || !newFormData.qualificationCertificates || !newFormData.validRecentPermit || !newFormData.workPermitWaiver || !newFormData.companyRegistrationDocuments}>
            Add
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
    </DashboardLayout>
  );
}

export default FacilityOwnership;
