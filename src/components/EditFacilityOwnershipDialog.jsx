import React, { useState, useEffect } from 'react';
import './EditFacilityOwnershipDialog.css'; // Use the correct CSS file
import ModalPortal from './ModalPortal';

const EditFacilityOwnershipDialog = ({ open, onClose, onUpdateSuccess, event }) => {
  const [formData, setFormData] = useState({
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
  });

  const [errorMessage, setErrorMessage] = useState("");

  // Prevent scrolling on the main body when the modal is open
  useEffect(() => {
    if (open) {
      // Disable scrolling on the body when modal is open
      document.body.style.overflow = 'hidden';
      
      // Re-enable scrolling when component is unmounted or closed
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [open]);

  useEffect(() => {
    if (event) {
      const dataValues = event.dataValues || [];
      const getValue = (dataElementId) => {
        const dataValue = dataValues.find(dv => dv.dataElement === dataElementId);
        return dataValue ? dataValue.value : "";
      };

      setFormData({
        firstName: getValue("HMk4LZ9ESOq"),
        surname: getValue("ykwhsQQPVH0"),
        citizen: getValue("zVmmto7HwOc"),
        ownershipType: getValue("vAHHXaW0Pna"),
        idType: getValue("FLcrCfTNcQi"),
        id: getValue("aUGSyyfbUVI"),
        copyOfIdPassport: null,
        professionalReference1: null,
        professionalReference2: null,
        qualificationCertificates: null,
        validRecentPermit: null,
        workPermitWaiver: null,
      });
    }
  }, [event]);

  // If dialog is not open, don't render anything
  if (!open) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const uploadFileAndGetId = async (file) => {
    if (!file) return null;
    const credentials = localStorage.getItem('userCredentials');
    const fileData = new FormData();
    fileData.append("file", file);
    
    try {
      const fileRes = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/fileResources`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        body: fileData,
      });

      if (!fileRes.ok) {
        const errorText = await fileRes.text();
        throw new Error(`File upload failed: ${fileRes.status} - ${errorText}`);
      }
      const responseJson = await fileRes.json();
      return responseJson.response.fileResource.id;
    } catch (error) {
      console.error("Error uploading file:", file.name, error);
      throw error;
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const credentials = localStorage.getItem('userCredentials');
    const orgUnitId = localStorage.getItem('userOrgUnitId');

    if (!credentials || !orgUnitId) {
      setErrorMessage("Authentication required. Please log in again.");
      return;
    }

    try {
      // Upload only changed files
      const fileUploads = [];
      if (formData.copyOfIdPassport) {
        fileUploads.push(uploadFileAndGetId(formData.copyOfIdPassport));
      }
      if (formData.professionalReference1) {
        fileUploads.push(uploadFileAndGetId(formData.professionalReference1));
      }
      if (formData.professionalReference2) {
        fileUploads.push(uploadFileAndGetId(formData.professionalReference2));
      }
      if (formData.qualificationCertificates) {
        fileUploads.push(uploadFileAndGetId(formData.qualificationCertificates));
      }
      if (formData.validRecentPermit) {
        fileUploads.push(uploadFileAndGetId(formData.validRecentPermit));
      }
      if (formData.workPermitWaiver) {
        fileUploads.push(uploadFileAndGetId(formData.workPermitWaiver));
      }

      const fileIds = await Promise.all(fileUploads);

      const today = new Date().toISOString().split('T')[0];
      const dataValues = [
        { dataElement: "HMk4LZ9ESOq", value: formData.firstName },
        { dataElement: "ykwhsQQPVH0", value: formData.surname },
        { dataElement: "zVmmto7HwOc", value: formData.citizen },
        { dataElement: "aUGSyyfbUVI", value: formData.id },
        { dataElement: "FLcrCfTNcQi", value: formData.idType },
        { dataElement: "vAHHXaW0Pna", value: formData.ownershipType },
      ];

      // Add file references if they were uploaded
      if (formData.copyOfIdPassport) {
        dataValues.push({ dataElement: "KRj1TOR5cVM", value: fileIds[0] });
      }
      if (formData.professionalReference1) {
        dataValues.push({ dataElement: "yP49GKSQxPl", value: fileIds[1] });
      }
      if (formData.professionalReference2) {
        dataValues.push({ dataElement: "lC217zTgC6C", value: fileIds[2] });
      }
      if (formData.qualificationCertificates) {
        dataValues.push({ dataElement: "pelCBFPIFY1", value: fileIds[3] });
      }
      if (formData.validRecentPermit) {
        dataValues.push({ dataElement: "cUObXSGtCuD", value: fileIds[4] });
      }
      if (formData.workPermitWaiver) {
        dataValues.push({ dataElement: "g9jXH9LJyxU", value: fileIds[5] });
      }

      const payload = {
        event: event.event,
        eventDate: today,
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN",
        programStage: "MuJubgTzJrY",
        status: "COMPLETED",
        dataValues: dataValues,
      };

      const eventRes = await fetch(`/api/events/${event.event}`, {
        method: "PUT",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!eventRes.ok) {
        const errorText = await eventRes.text();
        throw new Error(`Event update failed: ${eventRes.status} - ${errorText}`);
      }

      onUpdateSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating facility ownership:", error);
      setErrorMessage(`Failed to update facility ownership: ${error.message}`);
    }
  };

  const isFormValid = (
    formData.firstName &&
    formData.surname &&
    formData.citizen &&
    formData.ownershipType &&
    formData.idType &&
    formData.id
  );

  return (
    <ModalPortal open={open} onClose={onClose}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edit Facility Ownership</h5>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          <form onSubmit={handleUpdateSubmit}>
            <div className="form-group">
              <label>First Name:</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label>Surname:</label>
              <input type="text" name="surname" value={formData.surname} onChange={handleInputChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label>Citizen:</label>
              <input type="text" name="citizen" value={formData.citizen} onChange={handleInputChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label>Ownership Type:</label>
              <select name="ownershipType" value={formData.ownershipType} onChange={handleInputChange} className="form-control" required>
                <option value="">Select Ownership Type</option>
                <option value="State Owned">State Owned</option>
                <option value="Private Owned">Private Owned</option>
              </select>
            </div>
            <div className="form-group">
              <label>ID Type:</label>
              <input type="text" name="idType" value={formData.idType} onChange={handleInputChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label>ID:</label>
              <input type="text" name="id" value={formData.id} onChange={handleInputChange} className="form-control" required />
            </div>

            {/* File Inputs */}
            <div className="form-group">
              <label>Copy of ID/Passport:</label>
              <div className="file-input-wrapper">
                <input type="file" name="copyOfIdPassport" id="copyOfIdPassport" onChange={handleInputChange} className="form-control-file" />
                <label htmlFor="copyOfIdPassport" className="custom-file-upload">Choose File</label>
                <span className="file-name">{formData.copyOfIdPassport ? formData.copyOfIdPassport.name : 'No file chosen'}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Professional Reference 1:</label>
              <div className="file-input-wrapper">
                <input type="file" name="professionalReference1" id="professionalReference1" onChange={handleInputChange} className="form-control-file" />
                <label htmlFor="professionalReference1" className="custom-file-upload">Choose File</label>
                <span className="file-name">{formData.professionalReference1 ? formData.professionalReference1.name : 'No file chosen'}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Professional Reference 2:</label>
              <div className="file-input-wrapper">
                <input type="file" name="professionalReference2" id="professionalReference2" onChange={handleInputChange} className="form-control-file" />
                <label htmlFor="professionalReference2" className="custom-file-upload">Choose File</label>
                <span className="file-name">{formData.professionalReference2 ? formData.professionalReference2.name : 'No file chosen'}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Qualification Certificates:</label>
              <div className="file-input-wrapper">
                <input type="file" name="qualificationCertificates" id="qualificationCertificates" onChange={handleInputChange} className="form-control-file" />
                <label htmlFor="qualificationCertificates" className="custom-file-upload">Choose File</label>
                <span className="file-name">{formData.qualificationCertificates ? formData.qualificationCertificates.name : 'No file chosen'}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Valid Recent Permit:</label>
              <div className="file-input-wrapper">
                <input type="file" name="validRecentPermit" id="validRecentPermit" onChange={handleInputChange} className="form-control-file" />
                <label htmlFor="validRecentPermit" className="custom-file-upload">Choose File</label>
                <span className="file-name">{formData.validRecentPermit ? formData.validRecentPermit.name : 'No file chosen'}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Work Permit Waiver:</label>
              <div className="file-input-wrapper">
                <input type="file" name="workPermitWaiver" id="workPermitWaiver" onChange={handleInputChange} className="form-control-file" />
                <label htmlFor="workPermitWaiver" className="custom-file-upload">Choose File</label>
                <span className="file-name">{formData.workPermitWaiver ? formData.workPermitWaiver.name : 'No file chosen'}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={!isFormValid}>
              Update
            </button>
            <button type="button" className="btn btn-secondary cancel-btn" onClick={onClose}>Cancel</button>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default EditFacilityOwnershipDialog; 