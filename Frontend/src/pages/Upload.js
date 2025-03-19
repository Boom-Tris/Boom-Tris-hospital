import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  FormControlLabel,
  Checkbox,
  ListItemSecondaryAction,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, addDays, addWeeks, addMonths } from "date-fns";

import { Snackbar, Alert } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Delete, CheckCircle } from "@mui/icons-material";
const Upload = () => {
  const [patientName, setPatientName] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendDate, setSendDate] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [reminderTime, setReminderTime] = useState(null);

  const [appointmentDetails, setAppointmentDetails] = useState("");
  const [includeDocumentDetails, setIncludeDocumentDetails] = useState(false);
  const [documentDetails, setDocumentDetails] = useState("");
  const [meetDoctor, setMeetDoctor] = useState(null);
  const [includeDietDetails, setIncludeDietDetails] = useState(false);
  const [dietDetails, setDietDetails] = useState("");
  const [includeMoreDetails, setIncludeMoreDetails] = useState(false);
  const [moreDetails, setMoreDetails] = useState("");

  const [notificationDate, setNotificationDate] = useState(null);
  const [notificationTime, setNotificationTime] = useState(null);
  const [notificationDetails, setNotificationDetails] = useState("");
  const [notificationDuration, setNotificationDuration] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [patientFiles, setPatientFiles] = useState([]);

  useEffect(() => {
    let details = [];
    if (meetDoctor !== null) {
      details.push(meetDoctor ? "ต้องไปพบแพทย์" : "ไม่ต้องไปพบแพทย์");
    }
    if (includeDocumentDetails && documentDetails.trim()) {
      details.push(`เอกสารที่ต้องเตรียม: ${documentDetails}`);
    }
    if (includeDietDetails && dietDetails.trim()) {
      details.push(`งดยา-งดอาหาร: ${dietDetails}`);
    }
    if (includeMoreDetails && moreDetails.trim()) {
      details.push(`เพิ่มเติม: ${moreDetails}`);
    }
    setAppointmentDetails(details.join("\n"));
  }, [
    meetDoctor,
    includeDocumentDetails,
    documentDetails,
    includeDietDetails,
    dietDetails,
    includeMoreDetails,
    moreDetails,
  ]);
  const removeFile = (fileName) => {
    setFiles(files.filter((file) => file.name !== fileName));
    setUploadStatus((prev) => {
      const updatedStatus = { ...prev };
      delete updatedStatus[fileName];
      return updatedStatus;
    });
  };
  const resetForm = () => {
    setPatientName("");
    setPatients([]);
    setSendDate(null);
    setAppointmentDate(null);
    setReminderTime(null);
    setAppointmentDetails("");
    setIncludeDocumentDetails(false);
    setDocumentDetails("");
    setMeetDoctor(null);
    setIncludeDietDetails(false);
    setDietDetails("");
    setIncludeMoreDetails(false);
    setMoreDetails("");
    setNotificationDate(null);
    setNotificationTime(null);
    setNotificationDetails("");
    setNotificationDuration("");
    setFiles([]);
  };

  const handleNotificationDurationChange = (e) => {
    const duration = e.target.value;
    setNotificationDuration(duration);
    const durationParts = duration.match(/^(\d+)\s*(days?|weeks?|months?)$/);
    if (durationParts) {
      const value = parseInt(durationParts[1], 10);
      const unit = durationParts[2];
      let newNotificationDate = new Date();
      if (unit.includes("day")) {
        newNotificationDate = addDays(newNotificationDate, value);
      } else if (unit.includes("week")) {
        newNotificationDate = addWeeks(newNotificationDate, value);
      } else if (unit.includes("month")) {
        newNotificationDate = addMonths(newNotificationDate, value);
      }
      setNotificationDate(newNotificationDate);
    }
  };

  const fetchPatientFiles = async (patientId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/files/${patientId}`
      );
      const data = await response.json();
      setPatientFiles(data);
    } catch (error) {
      //console.error("Error fetching patient files:", error);
    }
  };

  const handleSearchPatient = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/search-patient?name=${patientName}`
      );
      const data = await response.json();
      setPatients(data);

      if (data.length > 0) {
        fetchPatientFiles(data[0].patient_id);
      }
    } catch (error) {
    //  console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetAppointment = async (patientId) => {
    if (!patientId) {
      setSnackbar({
        open: true,
        message: "Patient ID is required.",
        severity: "error",
      });
      return;
    }

    const data = {
      patient_id: patientId,
      appointment_senddate: sendDate ? format(sendDate, "yyyy-MM-dd") : null,
      appointment_date: appointmentDate
        ? format(appointmentDate, "yyyy-MM-dd")
        : null,
      reminder_time: reminderTime ? format(reminderTime, "HH:mm") : null,
      appointment_details: appointmentDetails || null,
      notification_date: notificationDate
        ? format(notificationDate, "yyyy-MM-dd")
        : null,
      notification_time: notificationTime
        ? format(notificationTime, "HH:mm")
        : null,
      notification_details: notificationDetails || null,
    };

    try {
      const response = await fetch("http://localhost:3001/set-appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: "Appointment set successfully!",
          severity: "success",
        });
        resetForm();

        if (files.length > 0) {
          await handleUploadFiles(patientId, files);
        }

        handleSearchPatient();
        setFiles([]);
      } else {
        setSnackbar({
          open: true,
          message: "Failed to set appointment.",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error setting appointment.",
        severity: "error",
      });
      //console.error("Error:", error);
    }
  };

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  const handleUploadFiles = async (patientId, files) => {
    if (!files || files.length === 0) {
     // console.log("No files to upload");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("patient_id", patientId);
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("http://localhost:3001/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

    
   //   console.log("Upload result:", result);

      setSnackbar({
        open: true,
        message: "Files uploaded successfully!",
        severity: "success",
      });

      setFiles([]);
    } catch (error) {
     // console.error("Error uploading files:", error);
      setSnackbar({
        open: true,
        message: "Error uploading files. Please check the console for details.",
        severity: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/files/${fileId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.message === "File deleted successfully") {
        setSnackbar({
          open: true,
          message: "File deleted successfully!",
          severity: "success",
        });

        fetchPatientFiles(patients[0].patient_id);
      } else {
        setSnackbar({
          open: true,
          message: "Failed to delete file.",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error deleting file.",
        severity: "error",
      });
  //    console.error("Error:", error);
    }
  };



  const renderPatientFiles = () => {
    return patientFiles.map((file) => (
      <ListItem key={file.id}>
        <ListItemText
          primary={file.file_name}
          secondary={`Uploaded on: ${new Date(
            file.uploaded_at
          ).toLocaleString()}`}
        />
        <IconButton onClick={() => handleDeleteFile(file.id)}>
          <DeleteIcon />
        </IconButton>
      </ListItem>
    ));
  };

  return (
<LocalizationProvider dateAdapter={AdapterDateFns}>
  <Box>
    <Typography variant="h3" gutterBottom>
      Manage Appointments
      <Box sx={{ borderBottom: "2px solid #000", marginTop: 3 }}></Box>
    </Typography>
    <Box
      sx={{
        padding: 3,
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        minHeight: '100%',  // Ensure the background expands to fit content
      }}
    >
      <Grid container justifyContent="center" alignItems="center" spacing={4} sx={{ height: '100%' }}>
        {/* ด้านซ้าย: แสดงข้อมูลผู้ป่วย */}
        <Grid item xs={12} md={8}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Search Results
            </Typography>
            <TextField
              fullWidth
              label="Search Patient by Name"
              variant="outlined"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              sx={{ marginTop: 2 }}
              onClick={handleSearchPatient}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Search"}
            </Button>
            <List sx={{ maxHeight: 700, overflowY: "auto", marginTop: 2 }}>
              {patients.map((patient) => (
                <ListItem key={patient.patient_id}>
                  <ListItemText
                    secondary={
                      <>
                        <Typography variant="body2">Name: {patient.name}</Typography>
                        <Typography variant="body2">Age: {patient.age}</Typography>
                        <Typography variant="body2">Email: {patient.email}</Typography>
                        <Typography variant="body2">Tel: {patient.tel}</Typography>
                        <Typography variant="body2">Address: {patient.address}</Typography>
                        <Typography variant="body2">Sickness: {patient.sickness}</Typography>
                        <Typography variant="body2">Allergic: {patient.allergic}</Typography>
                        <Typography variant="body2">Status: {patient.status}</Typography>
                        <Typography variant="body2">Appointment Send Date: {patient.appointment_senddate || "Not available"}</Typography>
                        <Typography variant="body2">Appointment Date: {patient.appointment_date || "Not available"}</Typography>
                        <Typography variant="body2">Reminder Time: {patient.reminder_time || "Not available"}</Typography>
                        <Typography variant="body2">Appointment Details: {patient.appointment_details || "Not available"}</Typography>
                        <Typography variant="body2">Notification Date: {patient.notification_date || "Not available"}</Typography>
                        <Typography variant="body2">Notification Time: {patient.notification_time || "Not available"}</Typography>
                        <Typography variant="body2">Notification Details: {patient.notification_details || "Not available"}</Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {/* Other form fields */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Scheduled Settings
                </Typography>
                <TextField
                  label="Notification Duration (e.g., 1 day, 2 weeks, 3 months)"
                  fullWidth
                  variant="outlined"
                  value={notificationDuration}
                  onChange={handleNotificationDurationChange}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Notification Details"
                  variant="outlined"
                  value={notificationDetails}
                  onChange={(e) => setNotificationDetails(e.target.value)}
                  margin="normal"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TimePicker
                  value={notificationTime}
                  onChange={(newTime) => setNotificationTime(newTime)}
                  label="Notification Time"
                  
                  slotProps={{
                    textField: {
                      fullWidth: true, 
                    },
                  }}
                  ampm={false}
                  slots={{ textField: TextField }}
                />
              </Grid>

              {/* Appointment Settings Title */}
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Appointment Settings
                </Typography>
              </Grid>

              {/* Appointment Send Date */}
              <Grid item xs={4}>
                <DatePicker
                  value={sendDate}
                  onChange={(newDate) => setSendDate(newDate)}
                  label="Appointment Send Date"
                 
                  slotProps={{
                    openPickerIcon: {
                      color: "primary",
                    },
                  }}
                  slots={{ textField: TextField }}
                />
              </Grid>

              {/* Appointment Date */}
              <Grid item xs={4}>
                <DatePicker
                  value={appointmentDate}
                  onChange={(newDate) => setAppointmentDate(newDate)}
                  label="Appointment Date"
                 
                  slotProps={{
                    openPickerIcon: {
                      color: "primary",
                    },
                  }}
                  slots={{ textField: TextField }}
                />
              </Grid>

              {/* Reminder Time */}
              <Grid item xs={4}>
                <TimePicker
                  value={reminderTime}
                  onChange={(newTime) => setReminderTime(newTime)}
                  label="Reminder Time"
                
                  slotProps={{
                    openPickerIcon: {
                      color: "primary",
                    },
                  }}
                  ampm={false}
                  slots={{ textField: TextField }}
                />
              </Grid>

              {/* Additional Details */}
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Additional Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={meetDoctor === true}
                          onChange={() =>
                            setMeetDoctor(meetDoctor === true ? null : true)
                          }
                        />
                      }
                      label="ต้องไปพบแพทย์"
                    />
                  </Grid>
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={meetDoctor === false}
                          onChange={() =>
                            setMeetDoctor(meetDoctor === false ? null : false)
                          }
                        />
                      }
                      label="ไม่ต้องไปพบแพทย์"
                    />
                  </Grid>
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={includeDocumentDetails}
                          onChange={(e) =>
                            setIncludeDocumentDetails(e.target.checked)
                          }
                        />
                      }
                      label="เอกสารที่ต้องเตรียม"
                    />
                  </Grid>
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={includeDietDetails}
                          onChange={(e) =>
                            setIncludeDietDetails(e.target.checked)
                          }
                        />
                      }
                      label="งดอาหาร - งดยา"
                    />
                  </Grid>
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={includeMoreDetails}
                          onChange={(e) =>
                            setIncludeMoreDetails(e.target.checked)
                          }
                        />
                      }
                      label="เพิ่มเติม"
                    />
                  </Grid>
                </Grid>
                <Box display="flex" flexDirection="column">
                  {includeDocumentDetails && (
                    <TextField
                      label="รายละเอียดเอกสาร"
                      variant="outlined"
                      value={documentDetails}
                      onChange={(e) => setDocumentDetails(e.target.value)}
                      margin="normal"
                      fullWidth
                    />
                  )}
                  {includeDietDetails && (
                    <TextField
                      label="รายละเอียดงดอาหาร - งดยา"
                      variant="outlined"
                      value={dietDetails}
                      onChange={(e) => setDietDetails(e.target.value)}
                      margin="normal"
                      fullWidth
                    />
                  )}
                  {includeMoreDetails && (
                    <TextField
                      label="รายละเอียดเพิ่มเติม"
                      variant="outlined"
                      value={moreDetails}
                      onChange={(e) => setMoreDetails(e.target.value)}
                      margin="normal"
                      fullWidth
                    />
                  )}

                  {/* Uploaded Files */}
                  <Grid item xs={12}>
  <Typography variant="h6" gutterBottom>
    Uploaded Files
  </Typography>

  <Box>
    <Typography mb={1} sx={{ textAlign: "center" }}>
      Link or drag and drop
    </Typography>
    <Button
      variant="outlined"
      component="label"
      sx={{
        border: "2px dashed #ddd",
        padding: "20px",
        width: "100%",
        textTransform: "none",
      }}
    >
      Select Files
      <input
        type="file"
        hidden
        multiple
        onChange={handleFileChange}
      />
    </Button>
  </Box>

  <List sx={{ mt: 2, maxHeight: 200, overflowY: "auto" }}>
    {files.map((file) => (
      <ListItem
        key={file.name}
        sx={{
          borderBottom: "1px solid #ddd",
          paddingBottom: "10px",
        }}
      >
        <ListItemText
          primary={file.name}
          secondary={`Size: ${(file.size / 1024).toFixed(2)} KB`}
        />
        <ListItemSecondaryAction>
          {uploadStatus[file.name] === "loading" && (
            <CircularProgress size={24} />
          )}
          {uploadStatus[file.name] === "complete" && (
            <CheckCircle color="success" />
          )}
          {uploadStatus[file.name] === "failed" && (
            <Typography color="error" variant="caption">
              Upload failed
            </Typography>
          )}
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => removeFile(file.name)}
          >
            <Delete />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    ))}
  </List>
</Grid>
                  {/* Files */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Files
                    </Typography>
                    <List>{renderPatientFiles()}</List>
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSetAppointment(patients[0]?.patient_id)}
                      disabled={uploading}
                      fullWidth
                    >
                      {uploading ? <CircularProgress size={24} /> : "SUBMIT"}
                    </Button>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>

      </Grid>

    </Box>
  </Box>

  <Snackbar
    open={snackbar.open}
    autoHideDuration={3000}
    onClose={() => setSnackbar({ ...snackbar, open: false })}
    action={
      <Button
        color="inherit"
        size="small"
        onClick={() => setSnackbar({ ...snackbar, open: false })}
      >
        CLOSE
      </Button>
    }
  >
    <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
  </Snackbar>
</LocalizationProvider>

  );
};

export default Upload;
