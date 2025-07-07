import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Snackbar,
  Backdrop,
  CircularProgress,
  Typography,
  Alert,
  Stack,
  Dialog as ErrorDialog,
  DialogContent as ErrorDialogContent,
  DialogTitle as ErrorDialogTitle,
  DialogActions as ErrorDialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { API_URL } from '../config'; // Import API_URL

// Add CSS for animations
const styles = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes slideInFromTop {
    0% { transform: translateY(-100px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

function RegistrationForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [userCreatedMessage, setUserCreatedMessage] = useState(false);
  const [registrationSubmittedMessage, setRegistrationSubmittedMessage] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailSentMessage, setEmailSentMessage] = useState(false);

  const credentials = 'YWRtaW46NUFtNTM4MDgwNTNA';

  // Define a default password for new users
  const DEFAULT_PASSWORD = "selfRegistration@123$";

  useEffect(() => {
    // Credentials are now hardcoded as requested, no need to retrieve from localStorage
    // const storedCredentials = localStorage.getItem('userCredentials');
    // if (storedCredentials) {
    //   setCredentials(storedCredentials);
    // }

    const fetchOrganisationalUnits = async () => {

      try {
        const response = await fetch(
          `${import.meta.env.VITE_DHIS2_URL}/api/organisationUnits.json?filter=level:eq:4&fields=id,displayName&paging=false`,
          {
            headers: {
              Authorization: `Basic ${credentials}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch organisational units");
        }
        const data = await response.json();
        setOrganisationalUnits(data.organisationUnits);
        setFilteredOrgUnits(data.organisationUnits);
      } catch (error) {
        console.error("Error fetching organisational units:", error);
      } finally {
        setIsLoadingOrgUnits(false);
      }
    };

    fetchOrganisationalUnits();
  }, [credentials]);

  const [formData, setFormData] = useState({
    BHPCRegistrationNumber: "AUTO-GENERATED", // Auto-filled since hidden from user
    cellNumber: "",
    userName: "",
    dhisRegistrationCode: "",
    email: ""
  });

  // Function to generate a valid DHIS2 standard UID
  const generateDhis2Uid = () => {
    // DHIS2 UIDs are 11 characters
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let uid = '';

    // First character should be a letter (DHIS2 convention)
    uid += alphabet[Math.floor(Math.random() * 52)]; // Only letters for first char

    // Generate the remaining 10 characters (can be letters or numbers)
    for (let i = 0; i < 10; i++) {
      uid += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return uid;
  };

  const handleClickOpen = () => {
    // Generate a new DHIS2 UID when the form is opened
    setFormData(prev => ({
      ...prev,
      dhisRegistrationCode: generateDhis2Uid()
    }));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset all message states when closing the dialog
    setSuccessOpen(false);
    setUserCreatedMessage(false);
    setRegistrationSubmittedMessage(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle closing individual snackbars
  const handleUserCreatedClose = () => setUserCreatedMessage(false);
  const handleRegistrationSubmittedClose = () => setRegistrationSubmittedMessage(false);
  const handleSuccessClose = () => setSuccessOpen(false);

  const closeErrorDialog = () => {
    setErrorDialogOpen(false);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // 1. Create User Profile (switched to be first)
      const userPayload = {
        username: formData.userName,
        surname: "Place-Holder",
        firstName: "Place-Holder",
        password: "selfRegistration@123$",
        accountExpiry: null,
        userRoles: [{ id: "aOxLneGCVvO" }],
        organisationUnits: [{ id: "OVpBNoteQ2Y" }],
        twitter: formData.dhisRegistrationCode,
        phoneNumber: formData.cellNumber,
        email: formData.email
      };

      const userResponse = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/40/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify(userPayload),
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        let errorData;

        try {
          // Try to parse the error response as JSON
          errorData = JSON.parse(errorText);

          // Check if it's a username already exists error
          if (errorData.httpStatusCode === 409 &&
            errorData.response &&
            errorData.response.errorReports &&
            errorData.response.errorReports.length > 0 &&
            errorData.response.errorReports[0].errorCode === "E4054" &&
            errorData.response.errorReports[0].errorProperty === "username") {

            // Extract the username from the error message
            const usernameMatch = errorData.response.errorReports[0].errorProperties &&
              errorData.response.errorReports[0].errorProperties.length >= 2 ?
              errorData.response.errorReports[0].errorProperties[1] :
              formData.userName;

            setErrorMessage(`User with username "${usernameMatch}" already exists. Please choose a different username.`);
            setErrorDialogOpen(true);
            setLoading(false);
            return; // Stop the submission process
          }

          // For any other errors, throw the original error
          throw new Error(`Failed to create user profile: ${errorText}`);
        } catch (parseError) {
          // If JSON parsing fails, throw the original error text
          throw new Error(`Failed to create user profile: ${errorText}`);
        }
      }
      const userData = await userResponse.json();
      const userId = userData.response.uid;
      console.log("User profile created successfully! User ID:", userId);

      // Show user created success message
      setUserCreatedMessage(true);

      // 2. Submit Registration Data (Tracker Event) (now second)
      const trackerPayload = {
        events: [
          {
            event: formData.dhisRegistrationCode, // Use DHIS2 Registration Code as the eventID
            occurredAt: new Date().toISOString().split('T')[0],
            notes: [],
            program: "Y4W5qIKlOsh",
            programStage: "YzqtE5Uv8Qd",
            orgUnit: "OVpBNoteQ2Y", // Match the org unit used in user creation
            dataValues: [
              { dataElement: "SReqZgQk0RY", value: formData.cellNumber },
              { dataElement: "SVzSsDiZMN5", value: formData.BHPCRegistrationNumber },
              { dataElement: "g3J1CH26hSA", value: formData.userName },
              { dataElement: "EAi89g7IBjp", value: formData.dhisRegistrationCode },
              { dataElement: "NVlLoMZbXIW", value: formData.email }
            ]
          }
        ]
      };

      const trackerResponse = await fetch(
        `${import.meta.env.VITE_DHIS2_URL}/api/40/tracker?async=false`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`,
          },
          body: JSON.stringify(trackerPayload),
        },
      );

      if (!trackerResponse.ok) {
        const errorText = await trackerResponse.text();
        throw new Error(`Failed to submit registration: ${errorText}`);
      }
      console.log("Tracker event submitted successfully!");

      // Show registration submitted success message
      setRegistrationSubmittedMessage(true);

      // 3. Send Welcome Email (remains third)
      try {
        const emailResponse = await fetch('http://localhost:5003/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            username: formData.userName,
            password: DEFAULT_PASSWORD
          })
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error("Email sending failed:", errorText);
          // Don't throw error here - just log it since user is already created
        } else {
          console.log("Email sent successfully through proxy");
          setEmailSentMessage(true);
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Continue even if email fails
      }

      // Show final success message and close dialog after delay
      setSuccessOpen(true);
      setTimeout(() => {
        handleClose();
      }, 4000);
    } catch (err) {
      console.error("Submission error:", err);
      // For errors not handled specifically above
      if (!errorDialogOpen) {
        alert(`There was an error submitting your request: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="cta-btn" variant="contained" onClick={handleClickOpen}>
        Apply for License
      </button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, fontWeight: "bold", textAlign: "left" }}>
          Application Form
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ px: 4 }}>
          {/* User Profile Section */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            User Profile
          </Typography>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Preferred User Name"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              variant="outlined"
              margin="dense"
              required
              InputLabelProps={{
                sx: {
                  "& .MuiFormLabel-asterisk": {
                    color: "red",
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Phone Number"
              name="cellNumber"
              value={formData.cellNumber}
              onChange={handleChange}
              variant="outlined"
              margin="dense"
              required
              InputLabelProps={{
                sx: {
                  "& .MuiFormLabel-asterisk": {
                    color: "red",
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              margin="dense"
              required
              InputLabelProps={{
                sx: {
                  "& .MuiFormLabel-asterisk": {
                    color: "red",
                  },
                },
              }}
            />

            {/* B.H.P.C License Number - Hidden from user but still functional */}
            <TextField
              fullWidth
              label="B.H.P.C License Number"
              name="BHPCRegistrationNumber"
              value={formData.BHPCRegistrationNumber}
              onChange={handleChange}
              variant="outlined"
              margin="dense"
              required
              sx={{ display: 'none' }}
              InputLabelProps={{
                sx: {
                  "& .MuiFormLabel-asterisk": {
                    color: "red",
                  },
                },
              }}
            />

            {/* DHIS2 Registration Code - Hidden from user but still generated */}
            <TextField
              fullWidth
              label="DHIS2-Registration CODE"
              name="dhisRegistrationCode"
              value={formData.dhisRegistrationCode}
              onChange={handleChange}
              variant="outlined"
              margin="dense"
              required
              sx={{ display: 'none' }}
              InputLabelProps={{
                sx: {
                  "& .MuiFormLabel-asterisk": {
                    color: "red",
                  },
                },
              }}
            />

            {/* File upload section removed */}
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: "#3f51b5",
              color: "#fff",
              borderRadius: 2,
              px: 4,
              "&:hover": {
                backgroundColor: "#303f9f",
              },
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error dialog for user already exists */}
      <ErrorDialog
        open={errorDialogOpen}
        onClose={closeErrorDialog}
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-description"
      >
        <ErrorDialogTitle id="error-dialog-title">
          User Already Exists
        </ErrorDialogTitle>
        <ErrorDialogContent>
          <Typography variant="body1">
            {errorMessage}
          </Typography>
        </ErrorDialogContent>
        <ErrorDialogActions>
          <Button onClick={closeErrorDialog} color="primary" autoFocus>
            OK
          </Button>
        </ErrorDialogActions>
      </ErrorDialog>

      {/* Success messages - HIGHLY VISIBLE ON TOP OF EVERYTHING */}
      <Snackbar
        open={userCreatedMessage}
        autoHideDuration={6000}
        onClose={handleUserCreatedClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          zIndex: 999999,
          top: '10px !important',
          '& .MuiSnackbar-root': {
            top: '10px !important'
          }
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{ 
            fontSize: '1.2rem',
            fontWeight: 'bold',
            minWidth: '450px',
            maxWidth: '600px',
            boxShadow: '0 10px 40px rgba(46, 125, 50, 0.5)',
            border: '3px solid #2e7d32',
            animation: 'slideInFromTop 0.5s ease-out',
            background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          }}
          icon={<span style={{ fontSize: '2rem' }}>✅</span>}
        >
          <strong>🎉 STEP 1/3: User profile created successfully! 🎉</strong>
        </Alert>
      </Snackbar>

      <Snackbar
        open={registrationSubmittedMessage}
        autoHideDuration={6000}
        onClose={handleRegistrationSubmittedClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          zIndex: 999999,
          top: '10px !important',
          '& .MuiSnackbar-root': {
            top: '10px !important'
          }
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{ 
            fontSize: '1.2rem',
            fontWeight: 'bold',
            minWidth: '450px',
            maxWidth: '600px',
            boxShadow: '0 10px 40px rgba(46, 125, 50, 0.5)',
            border: '3px solid #2e7d32',
            animation: 'slideInFromTop 0.5s ease-out',
            background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          }}
          icon={<span style={{ fontSize: '2rem' }}>✅</span>}
        >
          <strong>🎉 STEP 2/3: Registration data submitted successfully! 🎉</strong>
        </Alert>
      </Snackbar>

      <Snackbar
        open={emailSentMessage}
        autoHideDuration={8000}
        onClose={() => setEmailSentMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          zIndex: 999999,
          top: '10px !important',
          '& .MuiSnackbar-root': {
            top: '10px !important'
          }
        }}
      >
        <Alert
          severity="info"
          variant="filled"
          sx={{ 
            fontSize: '1.2rem',
            fontWeight: 'bold',
            minWidth: '500px',
            maxWidth: '650px',
            boxShadow: '0 10px 40px rgba(1, 87, 155, 0.5)',
            border: '3px solid #0277bd',
            animation: 'slideInFromTop 0.5s ease-out',
            background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          }}
          icon={<span style={{ fontSize: '2rem' }}>📧</span>}
        >
          <strong>📬 STEP 3/3: Login credentials sent to your email! Check inbox! 📬</strong>
        </Alert>
      </Snackbar>

      <Snackbar
        open={successOpen}
        autoHideDuration={12000}
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          zIndex: 999999,
          top: '10px !important',
          '& .MuiSnackbar-root': {
            top: '10px !important'
          }
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{ 
            fontSize: '1.4rem',
            fontWeight: 'bold',
            minWidth: '600px',
            maxWidth: '800px',
            boxShadow: '0 15px 50px rgba(46, 125, 50, 0.6)',
            border: '4px solid #2e7d32',
            animation: 'pulse 2s infinite',
            background: 'linear-gradient(45deg, #4caf50, #66bb6a, #81c784)',
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }
          }}
          icon={<span style={{ fontSize: '2.5rem' }}>🎊</span>}
        >
          <strong>🎉✨ APPLICATION COMPLETED SUCCESSFULLY! ✨🎉<br/>
          📧 Check your email for login credentials! 📧</strong>
        </Alert>
      </Snackbar>

      <Backdrop open={loading} sx={{ zIndex: 9999, color: "#fff" }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

export default RegistrationForm; 