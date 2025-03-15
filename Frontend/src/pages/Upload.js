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
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, addDays, addWeeks, addMonths, parse } from "date-fns";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import { Snackbar, Alert } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

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

  const resetForm = () => {
    setPatientName("");
    setPatients([]);
    setSendDate(null);
    setAppointmentDate(null);
    setReminderTime(null);
    setAppointmentDetails("");
    setIncludeDocumentDetails(false);
    setDocumentDetails("");
    setMeetDoctor(null); // เปลี่ยนจาก false เป็น null
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

  // Handle the input for notification duration (e.g., "6 days", "6 weeks", "6 months")
  const handleNotificationDurationChange = (e) => {
    const duration = e.target.value;
    setNotificationDuration(duration);
    // Check if the input is a valid duration like "6 days", "6 weeks", or "6 months"
    const durationParts = duration.match(/^(\d+)\s*(days?|weeks?|months?)$/);
    if (durationParts) {
      const value = parseInt(durationParts[1], 10);
      const unit = durationParts[2];
      let newNotificationDate = new Date(); // Start from the current date
      // Calculate the notification date based on the unit
      if (unit.includes("day")) {
        newNotificationDate = addDays(newNotificationDate, value);
      } else if (unit.includes("week")) {
        newNotificationDate = addWeeks(newNotificationDate, value);
      } else if (unit.includes("month")) {
        newNotificationDate = addMonths(newNotificationDate, value);
      }
      setNotificationDate(newNotificationDate); // Set the calculated notification date
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
      console.error("Error fetching patient files:", error);
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

      // ดึงข้อมูลไฟล์ของผู้ป่วย
      if (data.length > 0) {
        fetchPatientFiles(data[0].patient_id);
      }
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
      appointment_senddate: sendDate ? format(sendDate, "yyyy-MM-dd") : null,
      appointment_date: appointmentDate
        ? format(appointmentDate, "yyyy-MM-dd")
        : null,
      reminder_time: reminderTime ? format(reminderTime, "HH:mm") : null,
      appointment_details: appointmentDetails || null, // ค่า appointment_details จะไม่เปลี่ยนแปลงถ้าไม่มีรายละเอียดเพิ่มเติม
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
        resetForm(); // รีเซ็ตฟอร์ม

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
      console.error("Error:", error);
    }
  };

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files)); // Ensure it's an array
  };

  const handleUploadFiles = async (patientId, files) => {
    if (!files || files.length === 0) {
      console.log("No files to upload");
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

      // เคลียร์ไฟล์ที่เลือกหลังจากอัปโหลดสำเร็จ
      setFiles([]); // เพิ่มบรรทัดนี้
    } catch (error) {
      console.error("Error uploading files:", error);
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

        // รีเฟรชรายการไฟล์หลังจากลบ
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
              <List sx={{ maxHeight: 700, overflowY: "auto" }}>
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
                            Appointment Send Date:{" "}
                            {patient.appointment_senddate || "Not available"}
                          </Typography>
                          <Typography variant="body2">
                            Appointment Date:{" "}
                            {patient.appointment_date || "Not available"}
                          </Typography>
                          <Typography variant="body2">
                            Reminder Time:{" "}
                            {patient.reminder_time || "Not available"}
                          </Typography>
                          <Typography variant="body2">
                            Appointment Details:{" "}
                            {patient.appointment_details || "Not available"}
                          </Typography>
                          <Typography variant="body2">
                            Notification Date:{" "}
                            {patient.notification_date || "Not available"}
                          </Typography>
                          <Typography variant="body2">
                            Notification Time:{" "}
                            {patient.notification_time || "Not available"}
                          </Typography>
                          <Typography variant="body2">
                            Notification Details:{" "}
                            {patient.notification_details || "Not available"}
                          </Typography>

                          <Box sx={{ marginTop: 2 }}>
                            <Typography variant="h6">
                              Notification Duration
                            </Typography>
                          </Box>

                          <TextField
                            label="Notification Duration ( 1 days, 2 weeks, 3 months)"
                            fullWidth
                            variant="outlined"
                            value={notificationDuration}
                            onChange={handleNotificationDurationChange}
                            margin="normal"
                          />
                          <TextField
                            label="Notification Details"
                            variant="outlined"
                            value={notificationDetails}
                            onChange={(e) =>
                              setNotificationDetails(e.target.value)
                            }
                            margin="normal"
                            fullWidth
                          />

                          <TimePicker
                            value={notificationTime}
                            onChange={(newTime) => setNotificationTime(newTime)}
                            label="Notification Time"
                            slots={{ openPickerIcon: FlightTakeoffIcon }}
                            slotProps={{
                              openPickerIcon: {
                                color: "primary",
                              },
                            }}
                            ampm={false} // กำหนดให้ใช้รูปแบบ 24 ชั่วโมง
                            renderInput={(params) => <TextField {...params} />}
                          />

                          <Box sx={{ marginTop: 2, marginBottom: 2 }}>
                            <Typography variant="h6">Appointment</Typography>
                          </Box>

                          <DatePicker
                            value={sendDate}
                            onChange={(newDate) => setSendDate(newDate)}
                            label="Appointment Send Date"
                            slots={{ openPickerIcon: FlightTakeoffIcon }}
                            slotProps={{
                              openPickerIcon: {
                                color: "primary",
                              },
                            }}
                            renderInput={(params) => <TextField {...params} />}
                          />

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
                            ampm={false} // กำหนดให้ใช้รูปแบบ 24 ชั่วโมง
                            renderInput={(params) => <TextField {...params} />}
                          />

                          <div>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={meetDoctor === true}
                                  onChange={() =>
                                    setMeetDoctor(
                                      meetDoctor === true ? null : true
                                    )
                                  }
                                />
                              }
                              label="ต้องไปพบแพทย์"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={meetDoctor === false}
                                  onChange={() =>
                                    setMeetDoctor(
                                      meetDoctor === false ? null : false
                                    )
                                  }
                                />
                              }
                              label="ไม่ต้องไปพบแพทย์"
                            />

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
                            {includeDocumentDetails && (
                              <TextField
                                label="รายละเอียดเอกสาร"
                                variant="outlined"
                                value={documentDetails}
                                onChange={(e) =>
                                  setDocumentDetails(e.target.value)
                                }
                                margin="normal"
                                fullWidth
                              />
                            )}
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

                            <TextField
                              label="Appointment Details"
                              variant="outlined"
                              value={appointmentDetails}
                              margin="normal"
                              fullWidth
                              multiline
                            />
                          </div>

                          <Box sx={{ marginTop: 2 }}>
                            <Typography variant="h6">Uploaded Files</Typography>
                          </Box>

                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            style={{ marginTop: 10 }}
                          />
                          <List>{renderFilePreviews()}</List>

                          <Box sx={{ marginTop: 2 }}>
                            <Typography variant="h6">Files</Typography>
                            <List>{renderPatientFiles()}</List>
                          </Box>

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
                              "SUBMIT"
                            )}
                          </Button>
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
