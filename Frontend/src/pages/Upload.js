import React, { useState } from "react";
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
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import { Snackbar, Alert } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const Upload = () => {
  const [patientName, setPatientName] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [reminderTime, setReminderTime] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSearchPatient = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/search-patient?name=${patientName}`
      );
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
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
      appointment_date: appointmentDate
        ? format(appointmentDate, "yyyy-MM-dd")
        : null,
      reminder_time: reminderTime ? format(reminderTime, "HH:mm") : null,
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

        // Upload files after setting appointment
        if (files.length > 0) {
          await handleUploadFiles(patientId, files); // pass patientId and files array directly
        }

        handleSearchPatient(); // Refresh patient data
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
      console.error("Error:", error);
    }
  };

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files)); // Ensure it's an array
  };

  const handleUploadFiles = async (patientId, files) => {
    if (!files || files.length === 0) {
      console.log('No files to upload');
      return; // ไม่มีไฟล์ที่จะอัปโหลด
    }
  
    try {
      setUploading(true); // เริ่มการอัปโหลด
  
      // สร้าง FormData object เพื่อส่งไฟล์ไปยัง API
      const formData = new FormData();
      formData.append("patient_id", patientId); // ✅ เพิ่ม patient_id ไปด้วย
      files.forEach((file) => {
        formData.append("files", file); // ใช้ key เป็น "files" เพื่อส่งไฟล์
      });
  
      // ส่งไฟล์ไปยัง API ที่ http://localhost:3001/upload-file
      const response = await fetch("http://localhost:3001/upload-file", {
        method: "POST",
        body: formData, // ส่ง FormData ที่มีไฟล์
      });
  
      // ตรวจสอบว่าการอัปโหลดสำเร็จหรือไม่
      if (!response.ok) {
        throw new Error("File upload failed");
      }
  
      const result = await response.json(); // รับผลลัพธ์จาก API
      console.log("Upload result:", result);
  
      setSnackbar({
        open: true,
        message: "Files uploaded successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      setSnackbar({
        open: true,
        message: "Error uploading files. Please check the console for details.",
        severity: "error",
      });
    } finally {
      setUploading(false); // หยุดการอัปโหลด
    }
  };
  const handleDeleteFile = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:3001/delete/${fileId}`, {
        method: "DELETE",
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response from server");
      }

      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message || "File deleted successfully!",
          severity: "success",
        });
        handleSearchPatient(); // Refresh patient data
      } else {
        setSnackbar({
          open: true,
          message: result.message || "Failed to delete file.",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Error deleting file.",
        severity: "error",
      });
      console.error("Error:", error);
    }
  };

  const renderFilePreviews = () => {
    return files.map((file, index) => (
      <ListItem key={index}>
        <ListItemText
          primary={file.name}
          secondary={`Size: ${file.size} bytes`}
        />
      </ListItem>
    ));
  };

  const renderPatientFiles = (patient) => {
    return patient.files?.map((file) => (
      <ListItem key={file.file_id}>
        <ListItemText
          primary={file.file_name}
          secondary={`Uploaded on: ${new Date(
            file.upload_date
          ).toLocaleString()}`}
        />
        <IconButton onClick={() => handleDeleteFile(file.file_id)}>
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
        </Typography>
        <Box
          sx={{
            padding: 3,
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
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
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Search Results</Typography>
              <List sx={{ maxHeight: 500, overflowY: "auto" }}>
                {patients.map((patient) => (
                  <ListItem key={patient.patient_id}>
                    <ListItemText
                      secondary={
                        <>
                          <Typography variant="body2">
                            Name: {patient.name}
                          </Typography>
                          <Typography variant="body2">
                            Age: {patient.age}
                          </Typography>
                          <Typography variant="body2">
                            Email: {patient.email}
                          </Typography>
                          <Typography variant="body2">
                            Tel: {patient.tel}
                          </Typography>
                          <Typography variant="body2">
                            Address: {patient.address}
                          </Typography>
                          <Typography variant="body2">
                            Sickness: {patient.sickness}
                          </Typography>
                          <Typography variant="body2">
                            Allergic: {patient.allergic}
                          </Typography>
                          <Typography variant="body2">
                            Status: {patient.status}
                          </Typography>
                          <Typography variant="body2">
                            Appointment Date:{" "}
                            {patient.appointment_date || "Not available"}
                          </Typography>
                          <Typography variant="body2">
                            Reminder Time:{" "}
                            {patient.reminder_time || "Not available"}
                          </Typography>

                          <DatePicker
                            value={appointmentDate}
                            onChange={(newDate) => setAppointmentDate(newDate)}
                            label="Appointment Date"
                            slots={{ openPickerIcon: FlightTakeoffIcon }}
                            slotProps={{
                              openPickerIcon: {
                                color: "primary",
                              },
                            }}
                            renderInput={(params) => <TextField {...params} />}
                          />

                          <TimePicker
                            value={reminderTime}
                            onChange={(newTime) => setReminderTime(newTime)}
                            label="Reminder Time"
                            slots={{ openPickerIcon: FlightTakeoffIcon }}
                            slotProps={{
                              openPickerIcon: {
                                color: "primary",
                              },
                            }}
                            renderInput={(params) => <TextField {...params} />}
                          />

                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            style={{ marginTop: 10 }}
                          />
                          <List>{renderFilePreviews()}</List>

                          <Button
                            variant="contained"
                            sx={{ marginLeft: 2 }}
                            onClick={() =>
                              handleSetAppointment(patient.patient_id)
                            }
                            disabled={uploading}
                          >
                            {uploading ? (
                              <CircularProgress size={24} />
                            ) : (
                              "Set Appointment and Reminder Time"
                            )}
                          </Button>

                          <Typography variant="h6" sx={{ marginTop: 2 }}>
                            Uploaded Files
                          </Typography>
                          <List>{renderPatientFiles(patient)}</List>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
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
