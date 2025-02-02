import React, { useState } from "react";
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
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "../components/pages.css"; // Make sure this import is correct

// Register the chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(null);

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
  const items = ["จำนวนคนใช้", "จำนวนหมอ", "ใบนัดวันนี้", "ได้รับการกลืนแล้ว", "ผู้ป่วยที่ไม่ได้ตรวจ"];
  return (
    <Box>
      {/* Header */}
      <Typography variant="h3" gutterBottom>
        HOME
      </Typography>
      <Typography variant="body1">หน้าแรก</Typography>

      {/* Stats Section */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {items.map((text, index) => (
          <Box
            key={index}
            className =""
          >
            <Typography variant="h6">{text}</Typography>
          </Box>
        ))}
      </Box>

      {/* Main Content */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateCalendar
              date={selectedDate}
              onChange={handleDateChange}
              className="custom-calendar"
            />
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
            <div>
              <Pie data={data} options={chartOptions} />
            </div>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
