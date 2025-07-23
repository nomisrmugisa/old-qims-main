import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import useMediaQuery from "@mui/material/useMediaQuery";
import "bootstrap/dist/css/bootstrap.min.css";
import woman from "assets/images/homepage/woman.jpg";

import * as React from "react";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme, styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import { Backdrop, CircularProgress } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import MDTypography from "components/MDTypography";
import { debounce } from "lodash";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const cards = [
  {
    id: 1,
    title: "New Facility",
    description:
      "Applying for New Services in Health Facility. It is an additional services in the existing facility.",
  },
  {
    id: 2,
    title: "Upgrade",
    description:
      "Authorization for Upgrade from one category of Health Facility to Another. It is a service requested by Private Health Facilities after fullfulling the requirements to change the category.",
  },
  {
    id: 3,
    title: "Inspection Request",
    description:
      "Request for Inspection of New Health Facility. This service is for an entity holding provisional authorization for the registration of a health facility. Inspections shall be conducted twice a year",
  },
  {
    id: 4,
    title: "Request to amment Staff list",
    description: "Request to Add Staff. This is done when there is a changing in staffing.",
  },
];

function DefaultBody() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleLogin = () => {
    navigate("/authentication/sign-in/basic"); // navigate to login page
  };
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const [formData, setFormData] = useState({
    facility: "",
    physicalAddress: "",
    correspondenceAddress: "",
    BHPCRegistrationNumber: "",
    privatePracticeNumber: "",
    attachments: null,
    email: "",
    username: "selfRegistrationTest15",
    password: "selfRegistration@123$",
    firstName: "",
    surname: "",
    cellNumber: "",
    locationInBotswana: "",
    userName: "",
  });

  const [successOpen, setSuccessOpen] = useState(false);
  const [organisationalUnits, setOrganisationalUnits] = useState([]);
  const [isLoadingOrgUnits, setIsLoadingOrgUnits] = useState(true);
  const username = process.env.REACT_APP_API_USERNAME;
  const password = process.env.REACT_APP_API_PASSWORD;

  const credentials = btoa(`${username}:${password}`);

  // Fetch organisational units on component mount
  useEffect(() => {
    const fetchOrganisationalUnits = async () => {
      try {
        const response = await fetch(
          "https://qimsdev.5am.co.bw/qims/api/organisationUnits.json?filter=level:eq:4&fields=id,displayName&paging=false",
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
      } catch (error) {
        console.error("Error fetching organisational units:", error);
      } finally {
        setIsLoadingOrgUnits(false);
      }
    };

    fetchOrganisationalUnits();
  }, [credentials]); // Dependency array includes credentials

  // create user profile
  const createUserProfile = async () => {
    // Calculate account expiry date one year from now
    const today = new Date();
    const expiryDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    const formattedExpiryDate = expiryDate.toISOString().split("T")[0];

    const profilePayload = {
      username: formData.userName,
      disabled: false,
      password: "selfRegistration@123$",
      accountExpiry: formattedExpiryDate,
      userRoles: [{ id: "aOxLneGCVvO" }],
      catDimensionConstraints: [],
      cogsDimensionConstraints: [],
      email: formData.email,
      firstName: formData.firstName,
      surname: formData.surname,
      phoneNumber: formData.cellNumber,
      whatsApp: "+2670777108323",
      twitter: "bhcpNumbet",
      organisationUnits: [{ id: "OVpBNoteQ2Y" }],
      dataViewOrganisationUnits: [],
      teiSearchOrganisationUnits: [],
      dataViewMaxOrganisationUnitLevel: null,
      userGroups: [],
      attributeValues: [],
    };

    const response = await fetch("https://qimsdev.5am.co.bw/qims/api/40/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify(profilePayload),
    });

    const result = await response.json();

    if (response.status === 201) {
      console.log("User profile created!");
      return result.response?.uid; // <-- return the created user UID
    }
    console.error("Failed to create user profile");
    return null;
  };

  const sendLoginEmail = async (userId) => {
    const messagePayload = {
      subject: "Welcome to the System",
      text: `Hello ${formData.firstName},\n\nYour account has been created.\n\nUsername: ${formData.userName}\nPassword: ${formData.password}\n\nPlease log in and change your password.`,
      users: [{ id: userId }],
      email: true,
    };

    const response = await fetch("https://qimsdev.5am.co.bw/qims/api/messageConversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify(messagePayload),
    });

    if (response.ok) {
      console.log("Email sent successfully");
      return true;
    }
    console.error("Failed to send email");
    return false;
  };

  // const changePassword = async () => {
  //   const passwordPayload = {
  //     oldPassword: "selfRegistration@123$",
  //     newPassword: "Nomisr123$",
  //   };
  //
  //   const response = await fetch("https://qimsdev.5am.co.bw/qims/api/40/me/changePassword", {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Basic ${credentials}`,
  //     },
  //     body: JSON.stringify(passwordPayload),
  //   });
  //
  //   if (response.status === 202) {
  //     console.log("Password changed successfully");
  //     alert("Your password was changed. You can now log in.");
  //   } else {
  //     console.error("Failed to change password");
  //   }
  // };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [filteredOrgUnits, setFilteredOrgUnits] = useState([]);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query) => {
      const filtered = organisationalUnits.filter((unit) =>
        unit.displayName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredOrgUnits(filtered);
    }, 300),
    [organisationalUnits]
  );

  // Handle search input change
  const handleSearchChange = (event, value) => {
    debouncedSearch(value);
  };

  // registration
  const handleSubmit = async () => {
    setLoading(true); // Show loader

    const payload = {
      events: [
        {
          occurredAt: "2025-05-01",
          notes: [],
          program: "Y4W5qIKlOsh",
          programStage: "YzqtE5Uv8Qd",
          orgUnit: "OVpBNoteQ2Y",
          dataValues: [
            { dataElement: "ykwhsQQPVH0", value: formData.surname },
            { dataElement: "p7y0vqpP0W2", value: formData.correspondenceAddress },
            { dataElement: "HMk4LZ9ESOq", value: formData.firstName },
            { dataElement: "VJzk8OdFJKA", value: formData.locationInBotswana },
            { dataElement: "D707dj4Rpjz", value: formData.facility },
            { dataElement: "dRkX5jmHEIM", value: formData.physicalAddress },
            { dataElement: "SReqZgQk0RY", value: formData.cellNumber },
            { dataElement: "NVlLoMZbXIW", value: formData.email },
            { dataElement: "SVzSsDiZMN5", value: formData.BHPCRegistrationNumber },
            { dataElement: "aMFg2iq9VIg", value: formData.privatePracticeNumber },
            { dataElement: "g3J1CH26hSA", value: formData.userName },
          ],
        },
      ],
    };

    try {
      const response = await fetch("https://qimsdev.5am.co.bw/qims/api/40/tracker?async=false", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit registration");

      const userId = await createUserProfile();
      if (userId) {
        const emailSent = await sendLoginEmail(userId);

        if (emailSent) {
          setSuccessOpen(true);
          setTimeout(() => {
            navigate("/authentication/sign-in/basic"); // redirect to login after short delay
          }, 4000); // optional delay to allow user to read Snackbar
        } else {
          alert("User created but failed to send email.");
        }
      } else {
        alert("Form saved but user profile creation failed.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("There was an error submitting your request.");
    } finally {
      setLoading(false); // Hide loader
    }
  };

  const [selectedCard, setSelectedCard] = React.useState(0);
  const theme = useTheme();
  // Media queries to match CSS breakpoints
  const isSm = useMediaQuery(theme.breakpoints.up("sm")); // 576px
  const isMd = useMediaQuery(theme.breakpoints.up("md")); // 768px
  const isLg = useMediaQuery(theme.breakpoints.up("lg")); // 992px

  // Determine max-width dynamically
  let maxWidth = "85%";
  if (isLg) maxWidth = "960px";
  else if (isMd) maxWidth = "720px";
  else if (isSm) maxWidth = "540px";

  return (
    <>
      <Grid container justifyContent="center" sx={{ my: 8, px: 2 }}>
        <Grid
          item
          xs={12}
          sx={{
            maxWidth,
            width: "85%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Card
            sx={{
              mt: -16,
              width: "85%",
              overflowX: "hidden",
              borderRadius: "4px",
              backgroundColor: "rgba(255, 255, 255, 0.3)", // semi-transparent white
              boxShadow: "none", // remove any default shadow
            }}
          >
            <Card
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div className="container text-center">
                <div className="row g-0">
                  <div
                    className="col-md-12 d-flex align-items-left"
                    style={{ margin: "32px 0", paddingLeft: "16px", paddingRight: "16px" }}
                  >
                    <h5
                      className="card-title text-capitalize"
                      style={{
                        fontWeight: 650,
                        display: "block",
                        color: "#0096FF",
                        textAlign: "left",
                        fontSize: "24px",
                      }}
                    >
                      PRIVATE FACILITY INSPECTION & LICENSING
                    </h5>
                  </div>
                </div>
                <div className="card mb-3" style={{ maxWidth: "1440px" }}>
                  <div className="row g-0">
                    {/* Text Section */}
                    <div className="col-md-7 d-flex align-items-center">
                      <div className="card-body">
                        <p
                          className="card-text text-justify"
                          style={{
                            color: "#000000",
                            textAlign: "left",
                            fontSize: "18px",
                          }}
                        >
                          The Health Facility Licensing Platform is an innovative system that
                          revolutionizes the licensing process for health facilities. It offers a
                          user-friendly solution, enhancing accessibility, transparency, and
                          efficiency. This platform reduces processing time, minimizes required
                          documentation, and eliminates physical visits to regulatory offices. With
                          real-time application tracking and seamless integrations, it sets a new
                          standard for transparency and accountability, improving healthcare service
                          delivery and ensuring regulatory compliance.
                          <br />
                          <Button
                            onClick={handleClickOpen}
                            sx={{
                              mr: 4,
                              mt: 2,
                              backgroundColor: "#e0e0e0",
                              color: "#000",
                              borderRadius: 2,
                              paddingX: 3,
                              paddingY: 1,
                              boxShadow: "none",
                              "&:hover": {
                                backgroundColor: "#d5d5d5",
                                boxShadow: "none",
                              },
                            }}
                          >
                            Register
                          </Button>
                          <Button
                            onClick={handleLogin}
                            sx={{
                              mt: 2,
                              backgroundColor: "#e0e0e0",
                              color: "#000",
                              borderRadius: 2,
                              paddingX: 3,
                              paddingY: 1,
                              boxShadow: "none",
                              "&:hover": {
                                backgroundColor: "#d5d5d5",
                                boxShadow: "none",
                              },
                            }}
                          >
                            Login
                          </Button>
                        </p>
                      </div>
                    </div>

                    {/* Image Section */}
                    <div className="col-md-5" style={{ overflow: "hidden" }}>
                      <img src={woman} alt="Apple Icon" className="img-fluid" />
                    </div>
                  </div>
                </div>
              </div>

              <Box
                sx={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(min(200px, 100%), 1fr))",
                  gap: 2,
                }}
              >
                {cards.map((card, index) => (
                  <Card>
                    <CardActionArea
                      onClick={() => setSelectedCard(index)}
                      data-active={selectedCard === index ? "" : undefined}
                      sx={{
                        height: "100%",
                        "&[data-active]": {
                          backgroundColor: "action.selected",
                          "&:hover": {
                            backgroundColor: "action.selectedHover",
                          },
                        },
                      }}
                    >
                      <CardContent sx={{ height: "100%" }}>
                        <Typography variant="h5" component="div">
                          {card.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {card.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            </Card>

            <br />
            <br />
            <br />
            <Card
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div className="container text-center">
                <div className="row g-0">
                  <div
                    className="col-md-12 d-flex align-items-left"
                    style={{ margin: "32px 0", paddingLeft: "16px", paddingRight: "16px" }}
                  >
                    <h5
                      className="card-title text-capitalize"
                      style={{
                        fontWeight: 650,
                        display: "block",
                        color: "#0096FF",
                        textAlign: "left",
                        fontSize: "24px",
                      }}
                    >
                      GOVERNMENT / PUBLIC FACILITY SURVEYS & ASSESSMENT
                    </h5>
                  </div>
                </div>
                <div className="card mb-3" style={{ maxWidth: "1440px" }}>
                  <div className="row g-0">
                    {/* Text Section */}
                    <div className="col-md-7 d-flex align-items-center">
                      <div className="card-body">
                        <p
                          className="card-text text-justify"
                          style={{
                            color: "#000000",
                            textAlign: "left",
                            fontSize: "18px",
                          }}
                        >
                          Health Facilty survey and assessment platform is to facilitate the
                          planning, execution, and reporting of health-related surveys and
                          assessments. The module supports national health assessments,
                          facility-based surveys, and specialized research studies conducted by the
                          HI, DHS, and other relevant stakeholders. It ensures that data collection
                          follows a standardized methodology, allowing for consistent analysis and
                          evidence-based decision-making.
                        </p>
                      </div>
                    </div>

                    {/* Image Section */}
                    <div className="col-md-5" style={{ overflow: "hidden" }}>
                      <img src={woman} alt="Apple Icon" className="img-fluid" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-0">
                <div className="col-md-12 d-flex align-items-center" />
              </div>
            </Card>
          </Card>
        </Grid>
      </Grid>

      <BootstrapDialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle
          sx={{ m: 0, p: 2, fontWeight: "bold", textAlign: "left" }}
          id="customized-dialog-title"
        >
          Registration Form
        </DialogTitle>

        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            // eslint-disable-next-line no-shadow
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent dividers sx={{ px: 4 }}>
          {/* Facility Profile Section */}
          <MDTypography variant="h6" fontWeight="medium" mt={2} mb={1}>
            Facility Profile
          </MDTypography>
          <TextField
            fullWidth
            label="Facility Name"
            name="facility"
            value={formData.facility}
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
          <Autocomplete
            fullWidth
            options={filteredOrgUnits}
            getOptionLabel={(option) => option.displayName}
            value={organisationalUnits.find((ou) => ou.id === formData.locationInBotswana) || null}
            onChange={(event, newValue) => {
              setFormData((prev) => ({ ...prev, locationInBotswana: newValue ? newValue.id : "" }));
            }}
            onInputChange={handleSearchChange}
            loading={isLoadingOrgUnits}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Location in Botswana (Ward)"
                variant="outlined"
                margin="dense"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingOrgUnits ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                required
                InputLabelProps={{
                  sx: {
                    "& .MuiFormLabel-asterisk": {
                      color: "red",
                    },
                  },
                }}
              />
            )}
          />

          {/* User Profile Section */}
          <MDTypography variant="h6" fontWeight="medium" mt={3} mb={1}>
            User Profile
          </MDTypography>
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
          <Box display="flex" gap={2} mt={1}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
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
              label="Surname"
              name="surname"
              value={formData.surname}
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
          </Box>
          <TextField
            fullWidth
            label="Physical Address"
            name="physicalAddress"
            value={formData.physicalAddress}
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
            label="Correspondence Address (Town/Village)"
            name="correspondenceAddress"
            value={formData.correspondenceAddress}
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
            label="Email"
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
            label="B H.P.C Registration Number"
            name="BHPCRegistrationNumber"
            value={formData.BHPCRegistrationNumber}
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
            label="private Practice Number"
            name="privatePracticeNumber"
            value={formData.privatePracticeNumber}
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
            label="attachements"
            name="attachements"
            value={formData.attachments}
            onChange={handleChange}
            variant="outlined"
            margin="dense"
          />
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
            Register
          </Button>
        </DialogActions>
      </BootstrapDialog>
      <Snackbar
        open={successOpen}
        autoHideDuration={8000}
        onClose={() => setSuccessOpen(false)}
        message="Registration successful. Please check your email for login details. Redirecting to login..."
      />
      <Backdrop open={loading} sx={{ zIndex: 9999, color: "#fff" }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

export default DefaultBody;
