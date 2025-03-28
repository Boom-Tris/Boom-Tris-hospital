import React, { useState, useEffect } from "react";
import {Box, Typography,Grid,Card, Paper, Dialog ,DialogTitle , DialogContent , IconButton , TextField} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Pie } from "react-chartjs-2";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "../components/pages.css";
import axios from "axios";
import { PatientTableInternal } from "./Patient";  

ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [patientCount, setPatientCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [doctorCount, setDoctorCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedViewPatient, setSelectedViewPatient] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedAgeType, setSelectedAgeType] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDiseases, setSelectedDiseases] = useState("");
  const [selectedProvinces, setSelectedProvinces] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleReset = () => {
    setSelectedAgeType("");
    setAgeInput("");
    setSelectedStatus("");
    setSelectedDiseases("");
    setSelectedProvinces("");
    setFilteredRows(rows);
  };

  const handleFilterConfirm = () => {
    let filtered = rows;

    if (selectedAgeType && ageInput) {
      filtered = filtered.filter((row) =>
        selectedAgeType === "more"
          ? row.age > parseInt(ageInput)
          : row.age < parseInt(ageInput)
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((row) => row.status === selectedStatus);
    }

    if (selectedDiseases) {
      const diseasesArray = selectedDiseases.split(",").map((d) => d.trim());
      filtered = filtered.filter((row) =>
        diseasesArray.some((disease) => row.sickness.includes(disease))
      );
    }

    if (selectedProvinces) {
      const provincesArray = selectedProvinces.split(",").map((p) => p.trim());
      filtered = filtered.filter((row) =>
        provincesArray.some((province) => row.address.includes(province))
      );
    }

    setFilteredRows(filtered);
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axios.get("http://localhost:3001/all-patients-count");
        setPatientCount(response.data.totalPatients);
        setDoctorCount(response.data.totalDoctors);
        setAppointmentCount(response.data.totalAppointments);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };
    
   
    

    const fetchPatients = async () => {
      try {
        const response = await axios.get("http://localhost:3001/all-patients");
        if (response.status === 200) {
          const updatedRows = response.data.map((patient) => ({
            ...patient,
            id: patient.patient_id,
          }));
          setRows(updatedRows);
          setFilteredRows(updatedRows);
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
      }
    };

    fetchCounts();
    fetchPatients();
  }, []);

  const handleViewRow = (patient) => {
    setSelectedViewPatient(patient);
    setOpenViewDialog(true);
  };
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const data = {
    labels: ["จำนวนผู้ป่วยทั้งหมด", "บุคลากรทางการแพทย์", "ผู้ป่วยได้รับใบนัด", ], // Updated labels
    datasets: [
      {
        data: [patientCount, doctorCount, appointmentCount], // Use dynamic counts
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", ], 
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top', // You can also use 'bottom' or 'left' if you prefer
        labels: {
          boxWidth: 10,  // Customize box width for the legend
          padding: 20,   // Add padding between the labels
        },
      },
    },
    maintainAspectRatio: false, // Optional: Allow chart to resize
  };
  

  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        HOME
        <Box sx={{ borderBottom: "2px solid #000", marginTop: 3 }}></Box>
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        <Box className="custom-stat-card">
          <Typography variant="h6">จำนวนผู้ป่วยทั้งหมด</Typography>
          <div id="TextTyp">{patientCount}</div>
        </Box>
    
        <Box className="custom-stat-card">
          <Typography variant="h6">ผู้ป่วยได้รับใบนัด</Typography>
          <div id="TextTyp">{appointmentCount}</div>
        </Box>
        <Box className="custom-stat-card">
          <Typography variant="h6">บุคลากรทางการแพทย์</Typography>
          <div id="TextTyp">{doctorCount}</div>
        </Box>
      </Box>

      <Grid container spacing={3} mt={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Patient
          </Typography>
          <Paper sx={{ padding: 1 }}>
            <PatientTableInternal
              rows={rows}
              filteredRows={filteredRows}
              columns={undefined}  
              search={search}
              handleSearch={(e) => setSearch(e.target.value)}
              anchorEl={anchorEl}
              open={open}
              handleClick={handleClick}
              handleFilterConfirm={handleFilterConfirm}
              selectedAgeType={selectedAgeType}
              ageInput={ageInput}
              selectedStatus={selectedStatus}
              selectedDiseases={selectedDiseases}
              selectedProvinces={selectedProvinces}
              setSelectedAgeType={setSelectedAgeType}
              setAgeInput={setAgeInput}
              setSelectedStatus={setSelectedStatus}
              setSelectedDiseases={setSelectedDiseases}
              setSelectedProvinces={setSelectedProvinces}
              handleReset={handleReset}
              handleRowSelection={() => {}}
              selectedIds={[]}
              groupManagementComponent={null}
              onViewRow={handleViewRow}
              height={"260px"}
              hideFooter={true}
              hideFooterSelectedRowCount={true}
              hideFooterPagination={true}
              showSelection={false}
              customStyle={{
                "& .MuiDataGrid-footerContainer": {
                  display: "none",   
                },
              }}
              
            />
          </Paper>
        </Grid>

        <Grid item xs={12} mt={2}>
          <Grid container spacing={3}>
            <Grid item xs={4} sx={{ paddingLeft: 0 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateCalendar
                  date={selectedDate}
                  onChange={handleDateChange}
                  className="custom-calendar"
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={8}>
              <Card id="custom-pie-chart">
                <Typography variant="h6">Statistics</Typography>
                <div className="chart-container"> 
                  <Pie data={data} options={chartOptions} />
                </div>
                
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)}>
  <DialogTitle sx={{ position: 'relative', textAlign: 'center' }}>
    ข้อมูลผู้ป่วย
    <IconButton 
      onClick={() => setOpenViewDialog(false)} 
      sx={{ 
        position: 'absolute', 
        left: 10,  
        top: 10   
      }}
    >
      ❌
    </IconButton>
  </DialogTitle>
  <DialogContent>
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, paddingTop: 2 }}>
      <TextField 
        label="ชื่อ-นามสกุล" 
        value={selectedViewPatient?.name || ''} 
        fullWidth 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }} 
      />
      <TextField 
        label="อายุ" 
        value={selectedViewPatient?.age || ''} 
        fullWidth 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }} 
      />
      <TextField 
        label="อาการแพ้" 
        value={selectedViewPatient?.allergic || ''} 
        fullWidth 
        multiline 
        rows={3} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }} 
      />
      <TextField 
        label="โรคประจำตัว" 
        value={selectedViewPatient?.sickness || ''} 
        fullWidth 
        multiline 
        rows={3} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }} 
      />
      <TextField 
        label="ที่อยู่" 
        value={selectedViewPatient?.address || ''} 
        fullWidth 
        multiline 
        rows={3} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }} 
      />
      <TextField 
        label="เบอร์โทรศัพท์" 
        value={selectedViewPatient?.tel || ''} 
        fullWidth 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }} 
      />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="วันนัดหมาย"
          value={selectedViewPatient?.appointment_date ? new Date(selectedViewPatient.appointment_date) : null}
          disabled={true} 
          slots={{
            textField: (params) => (
              <TextField
                {...params}
                fullWidth
                variant="outlined"
                slotProps={{ inputLabel: { shrink: true } }}
                value={selectedViewPatient?.appointment_date ? params.value : "ยังไม่ได้นัด"}  
              />
            ),
          }}
        />
      </LocalizationProvider>
    </Box>
  </DialogContent>
</Dialog>

    </Box>
  );
};

export default Home;
