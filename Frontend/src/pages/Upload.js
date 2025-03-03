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
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns"; // ใช้ date-fns เพื่อจัดการเวลา
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

const Upload = () => {
  const [patientName, setPatientName] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(null); // วันนัด (Date type)
  const [reminderTime, setReminderTime] = useState(null); // เวลาแจ้งเตือน (Date type)

  const handleSearchPatient = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/search-patient?name=${patientName}`
      );
      const data = await response.json();
      console.log("Fetched Patients:", data);
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันแปลงเวลา reminderTime เป็นรูปแบบที่ฐานข้อมูลรองรับ (HH:mm)
  const formatReminderTime = (time) => {
    if (!time) return null;
    return format(time, "HH:mm"); // แปลงเวลาเป็นรูปแบบ HH:mm
  };

  const handleSetAppointment = async (patientId, patientLineid) => {
    if (!appointmentDate || !reminderTime) {
      alert("Please specify appointment date and reminder time.");
      return;
    }

    // แปลงเวลา reminderTime ให้เป็นรูปแบบ AM/PM
    const formattedReminderTime = format(reminderTime, "hh:mm a"); // ใช้ 'hh:mm a' เพื่อแสดงเวลาในรูปแบบ AM/PM

    try {
      const response = await fetch("http://localhost:3001/set-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: patientName,
          lineid: patientLineid,
          appointment_date: appointmentDate,
          reminder_time: formattedReminderTime, // ใช้เวลาในรูปแบบ AM/PM
        }),
      });
      const result = await response.json();
      console.log("Appointment Response:", result);
      if (result.success) {
        alert("Appointment set successfully");
        handleSearchPatient(); // รีเฟรชข้อมูลใหม่
      } else {
        alert("Failed to set appointment");
      }
    } catch (error) {
      console.error("Error setting appointment:", error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h3" gutterBottom>
          Upload
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
                                color: "primary", // กำหนดสีไอคอน
                              },
                            }}
                            renderInput={(params) => <TextField {...params} />}
                          />

                          {/* TimePicker สำหรับเวลาเตือนในรูปแบบ 24 ชั่วโมง */}
                          <TimePicker
                            value={reminderTime}
                            onChange={(newTime) => setReminderTime(newTime)}
                            label="Reminder Time"
                            slots={{ openPickerIcon: FlightTakeoffIcon }}
                            slotProps={{
                              openPickerIcon: {
                                color: "primary", // กำหนดสีไอคอน
                              },
                            }}
                            renderInput={(params) => <TextField {...params} />}
                          />

                          <Button
                            variant="contained"
                            sx={{ marginLeft: 2 }}
                            onClick={() =>
                              handleSetAppointment(
                                patient.patient_id,
                                patient.lineid
                              )
                            }
                          >
                            Set Appointment
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
    </LocalizationProvider>
  );
};

export default Upload;
