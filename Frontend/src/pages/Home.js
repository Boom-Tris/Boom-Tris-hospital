import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import { Pie } from "react-chartjs-2";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "../components/pages.css"; // Ensure this import is correct
import axios from "axios";

// Register the chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [patientCount, setPatientCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [doctorCount, setDoctorCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch data from the API
        const response = await axios.get("http://localhost:3001/all-patients-count");

        // Set state variables based on the data received from the API
        setPatientCount(response.data.totalPatients);
        setDoctorCount(response.data.totalDoctors);
        setAppointmentCount(response.data.totalAppointments);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []); // Fetch data when the component mounts

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const data = {
    labels: ["Series 1", "Series 2", "Series 3", "Series 4"],
    datasets: [
      {
        data: [25, 30, 45],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8E44AD"],
      },
    ],
  };

  const patients = [
    { id: 1, name: "Ramesh Kumar", doctor: "Dr. Jacob Ryan", date: "12 Jan 2022", status: "หายแล้ว", color: "success" },
    { id: 2, name: "Ramesh Kumar", doctor: "Dr. Jacob Ryan", date: "12 Jan 2022", status: "ยกเลิก", color: "error" },
    { id: 3, name: "Ramesh Kumar", doctor: "Dr. Jacob Ryan", date: "12 Jan 2022", status: "กำลังตรวจสอบ", color: "warning" },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h3" gutterBottom>
        HOME
      </Typography>

      {/* Display patient count below the header */}
   

      {/* Stats Section */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <Box className="custom-stat-card">
          <Typography variant="h6">จำนวผู้ป่วย</Typography>
         <div id="TextTyp">  {patientCount}</div>
        </Box>
        <Box className="custom-stat-card">
          <Typography variant="h6">จำนวนหมอ</Typography>
          <div id="TextTyp">  {doctorCount}</div>
        </Box>
        <Box className="custom-stat-card">
          <Typography variant="h6">ใบนัดวันนี้</Typography>
          <div id="TextTyp">  {appointmentCount}</div>
        </Box>
      </Box>

     {/* Main Content */}
{/* Main Content */}
<Grid container spacing={3}>
  {/* Table Section */}
  <Grid item xs={12}>
    <Typography variant="h6" gutterBottom>
      Patient
    </Typography>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Patient Name</TableCell>
            <TableCell>Assigned Doctor</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>{patient.id}</TableCell>
              <TableCell>{patient.name}</TableCell>
              <TableCell>{patient.doctor}</TableCell>
              <TableCell>{patient.date}</TableCell>
              <TableCell>
                <Chip label={patient.status} color={patient.color} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Grid>

  {/* Empty Grid for spacing below the table */}
  <Grid item xs={12}>
    <Box sx={{ height: '16px' }} /> {/* This adds spacing below the table */}
  </Grid>

  {/* Calendar and Chart Section */}
  <Grid container spacing={3}>
    {/* Calendar */}
    <Grid item xs={4} sx={{ paddingLeft: 0 }}>  {/* Calendar aligned to the left */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateCalendar
          date={selectedDate}
          onChange={handleDateChange}
          className="custom-calendar"
        />
      </LocalizationProvider>
    </Grid>

    {/* Chart */}
    <Grid item xs={8}>  {/* Remaining space for the chart */}
      <Card id="custom-pie-chart">
        <Typography variant="h6">Statistics</Typography>
        <div>
          <Pie data={data} options={chartOptions} />
        </div>
      </Card>
    </Grid>
  </Grid>
</Grid>

     
      
    </Box>
  );
};

export default Home;
