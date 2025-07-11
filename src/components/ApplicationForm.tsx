import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button 
} from '@mui/material';

export const ApplicationForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [bhpcLicenseNumber, setBhpcLicenseNumber] = useState('');

  // Check if all mandatory fields are filled
  const isFormValid = () => {
    return phoneNumber.trim() !== '' && 
           emailAddress.trim() !== '' && 
           bhpcLicenseNumber.trim() !== '';
  };

  const handleApply = () => {
    // Apply logic here
    if (isFormValid()) {
      // Proceed with submission
    }
  };

  return (
    <Dialog open={true}>
      <DialogTitle>Application Form</DialogTitle>
      <DialogContent>
        <TextField
          label="Phone Number *"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email Address *"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="B.H.P.C. License Number *"
          value={bhpcLicenseNumber}
          onChange={(e) => setBhpcLicenseNumber(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {/* Cancel logic */}}>
          CANCEL
        </Button>
        <Button 
          onClick={handleApply}
          disabled={!isFormValid()} // Disable button when form is invalid
          color="primary"
        >
          APPLY
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 