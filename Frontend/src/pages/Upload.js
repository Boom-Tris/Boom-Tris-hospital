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
import Autocomplete from "@mui/material/Autocomplete";
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
  const [notificationNumber, setNotificationNumber] = useState("");
  const [notificationUnit, setNotificationUnit] = useState("day");
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
  const [selectedPatient, setSelectedPatient] = useState(null);


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
      details.push(`📃เอกสารที่ต้องเตรียม📃: \n${documentDetails}`);
    }
    if (includeDietDetails && dietDetails.trim()) {
      details.push(`🚫งดยา-งดอาหาร🥩: \n${dietDetails}`);
    }
    if (includeMoreDetails && moreDetails.trim()) {
      details.push(`เพิ่มเติม: \n${moreDetails}`);
    }
    setAppointmentDetails(details.join("\n\n"));
    let resultDate = null;
  if (notificationNumber && notificationUnit) {
    const number = parseInt(notificationNumber);
    const baseDate = new Date();

    if (notificationUnit === "day") {
      resultDate = addDays(baseDate, number);
    } else if (notificationUnit === "week") {
      resultDate = addWeeks(baseDate, number);
    } else if (notificationUnit === "month") {
      resultDate = addMonths(baseDate, number);
    } else if (notificationUnit === "year") {
      resultDate = addMonths(baseDate, number * 12);
    }
    setNotificationDate(resultDate);
  }
  if (selectedPatient?.patient_id) {
    fetchPatientFiles(selectedPatient.patient_id);
  }

  }, [
    meetDoctor,
    includeDocumentDetails,
    documentDetails,
    includeDietDetails,
    dietDetails,
    includeMoreDetails,
    moreDetails,
    notificationNumber,
    notificationUnit,
    selectedPatient,
    patientName,
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
    if (!patientName.trim()) return;
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
        minHeight: '100%',
      }}
    >
      <Grid container justifyContent="center" alignItems="center" spacing={4} sx={{ height: '100%' }}>
       
       
        <Grid item xs={12} md={8}>
          <Box>
            
          <Box>
        <Typography variant="h5" gutterBottom>ค้นหาผู้ป่วย</Typography>
        <TextField
          label="Search Patient by Name"
          variant="outlined"
          margin="normal"
          fullWidth
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSearchPatient}
          sx={{ mt: 1 }}
        >
          ค้นหา
        </Button>
      </Box>

      {patients.length > 0 && (
  <Box mt={2}>
    <Typography variant="h6">ผลการค้นหา:</Typography>
    <List>
      {patients.map((patient) => (
        <ListItem 
        button 
        key={patient.patient_id} 
        selected={selectedPatient?.patient_id === patient.patient_id}
        onClick={() => setSelectedPatient(patient)}
        sx={{
          backgroundColor: selectedPatient?.patient_id === patient.patient_id ? '#e0e0e0' : 'inherit',
          borderRadius: 1,
          mb: 1
        }}
      >
          <ListItemText 
            primary={`${patient.name} (${patient.age} ปี)`} 
            secondary={patient.email}
          />
        </ListItem>
      ))}
    </List>
  </Box>
)}


{selectedPatient && (
  <Box mt={0.1} p={2} sx={{ border: "1px solid #ddd", borderRadius: 2 }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Typography variant="body2" color="text.secondary">Name: {selectedPatient.name}</Typography>
        <Typography variant="body2" color="text.secondary">Age: {selectedPatient.age}</Typography>
        <Typography variant="body2" color="text.secondary">Email: {selectedPatient.email}</Typography>
        <Typography variant="body2" color="text.secondary">Tel: {selectedPatient.tel}</Typography>
        <Typography variant="body2" color="text.secondary">Address: {selectedPatient.address}</Typography>
        <Typography variant="body2" color="text.secondary">Sickness: {selectedPatient.sickness}</Typography>
        <Typography variant="body2" color="text.secondary">Allergic: {selectedPatient.allergic}</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="body2" color="text.secondary">Appointment Send Date: {selectedPatient.appointment_senddate || "Not available"}</Typography>
        <Typography variant="body2" color="text.secondary">Appointment Date: {selectedPatient.appointment_date || "Not available"}</Typography>
        <Typography variant="body2" color="text.secondary">Reminder Time: {selectedPatient.reminder_time || "Not available"}</Typography>
        <Typography variant="body2" color="text.secondary">Appointment Details: {selectedPatient.appointment_details || "Not available"}</Typography>
        <Typography variant="body2" color="text.secondary">Notification Date: {selectedPatient.notification_date || "Not available"}</Typography>
        <Typography variant="body2" color="text.secondary">Notification Time: {selectedPatient.notification_time || "Not available"}</Typography>
        <Typography variant="body2" color="text.secondary">Notification Details: {selectedPatient.notification_details || "Not available"}</Typography>
      </Grid>
    </Grid>
  </Box>
)}




            <Grid container spacing={2}>
              <Grid item xs={12} mt={2.4}>
                <Typography variant="h5" gutterBottom>
                 ส่งการแจ้งเตือนประจำวัน
                </Typography>
                <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <TextField
                    label="จำนวน"
                    type="number"
                    value={notificationNumber}
                    onChange={(e) => setNotificationNumber(e.target.value)}
                    size="small"
                    sx={{ width: 80 , height: 40 }}
                  />
                </Grid>
                {["day", "week", "month", "year"].map((unit) => (
                  <Grid item key={unit}>
                    <Button
                      variant={notificationUnit === unit ? "contained" : "outlined"}
                      onClick={() => setNotificationUnit(unit)}
                      color={notificationUnit === unit ? "primary" : "inherit"}
                      size="small"
                      sx={{ minWidth: 64, px: 2 , height: 40 }}
                    >
                      {unit === "day" && "วัน"}
                      {unit === "week" && "สัปดาห์"}
                      {unit === "month" && "เดือน"}
                      {unit === "year" && "ปี"}
                    </Button>
                  </Grid>
                ))}
              </Grid>
              </Grid>

              <Grid item xs={12} mt={-3}>
                <TextField
                  label="รายละเอียดการแจ้งเตือน"
                  variant="outlined"
                  value={notificationDetails}
                  onChange={(e) => setNotificationDetails(e.target.value)}
                  margin="normal"
                  fullWidth
                  multiline
                />
              </Grid>

              <Grid item xs={12} mt={-2}>
                <TimePicker
                  value={notificationTime}
                  onChange={(newTime) => setNotificationTime(newTime)}
                  label="เวลาที่จะส่งการแจ้งเตือน"
                  
                  slotProps={{
                    textField: {
                      fullWidth: true, 
                    },
                  }}
                  ampm={false}
                  slots={{ textField: TextField }}
                />
              </Grid>

              <Grid item xs={12} mt={3}>
                <Typography variant="h5" gutterBottom>
                  การนัดหมาย
                </Typography>
              </Grid>

              <Grid item xs={4} mt={-2}>
                <DatePicker
                  value={appointmentDate}
                  onChange={(newDate) => setAppointmentDate(newDate)}
                  label="วันที่จะนัดหมาย"
                 
                  slotProps={{
                    openPickerIcon: {
                      color: "primary",
                    },
                  }}
                  slots={{ textField: TextField }}
                />
              </Grid>

              <Grid item xs={4} mt={-2} ml={-4}> 
                <DatePicker
                  value={sendDate}
                  onChange={(newDate) => setSendDate(newDate)}
                  label="วันที่จะมีการแจ้งเตือน"
                 
                  slotProps={{
                    openPickerIcon: {
                      color: "primary",
                    },
                  }}
                  slots={{ textField: TextField }}
                />
              </Grid>

              {/* Appointment Date */}
              

              {/* Reminder Time */}
              <Grid item xs={4} mt={-2} ml={-4}>
                <TimePicker
                  value={reminderTime}
                  onChange={(newTime) => setReminderTime(newTime)}
                  label="เวลาที่จะส่งการแจ้งเตือน"
                
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
                      multiline
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
                      multiline
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
                      multiline
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
                      onClick={() => handleSetAppointment(selectedPatient?.patient_id)}
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