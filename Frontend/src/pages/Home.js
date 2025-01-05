import React from "react";
<<<<<<< Updated upstream
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
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
import '../components/pages.css';  // Make sure this import is correct
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
=======
import { Typography, Box} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import "../components/pages.css";
>>>>>>> Stashed changes


ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
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
<<<<<<< Updated upstream
    <Box>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        HOME
      </Typography>
      <Typography variant="body1">หน้าแรก</Typography>

      
      <Grid container spacing={2} sx={{ marginBottom: 4 }}>
  {["จำนวนคนใช้", "จำนวนหมอ", "ใบนัดวันนี้", "ได้รับการกลืนแล้ว", "ผู้ป่วยที่ไม่ได้ตรวจ"].map((text, index) => (
    <Grid item xs={10} sm={5} md={1.7} key={index}>
      <Card id="custom-stat-card">
        <CardContent>
          <div className="custom-stat-card-content">
            <Typography variant="h5">250</Typography>
            <Typography variant="body2">{text}</Typography>
          </div>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>


     {/* Main Content */}
      <Grid container spacing={4}>
     
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateCalendar className="custom-calendar" />
          </LocalizationProvider>
        </Grid>

       
        <Grid item xs={12} md={6}>
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

     
        <Grid item xs={10}>
          <Card id="custom-pie-chart">
           
              <Typography variant="h6">Statistics</Typography>
              <div >
                <Pie data={data} options={chartOptions} />
              </div>
           
          </Card>
        </Grid>
      </Grid>
    </Box>
=======
    <div>
      <Typography variant="h3" gutterBottom>
        HOME
      </Typography>
      <Box
        sx={{
          borderBottom: "2px solid #000",
          marginBottom: 3
        }}
      ></Box>
      <Typography variant="body1" gutterBottom>
        หน้าหลัก
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateCalendar
          date={selectedDate}
          onChange={handleDateChange}
          className="custom-calendar"
        />
      </LocalizationProvider>
    </div>
>>>>>>> Stashed changes
  );
};

export default Home;
