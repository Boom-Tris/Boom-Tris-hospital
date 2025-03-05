import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Typography, TextField, IconButton, Box, Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faCog , faSearch  } from '@fortawesome/free-solid-svg-icons';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import '../components/Table.css';

// 🔹 เชื่อมต่อกับ Supabase
const supabaseUrl = "https://wxsaarugacjbneliilek.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4c2FhcnVnYWNqYm5lbGlpbGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MTA3MjEsImV4cCI6MjA1NTE4NjcyMX0.NbNgb_oHFxNuwjnjaIEjIIhPvsowQ5nYE5hzuMtQeK0"; 
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 🗓️ ฟังก์ชันแปลง `appointment_date` เป็น `DD/MM/YYYY`
const formatDate = (dateString) => {
  if (!dateString) return "ไม่ได้นัดหมาย"; // ถ้าไม่มีวันนัดหมาย
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const Patient = () => {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    age: '',
    lineId: '',
    allergic: '',
    sickness: '',
    address: '',
    appointment_date: null // ✅ เพิ่มฟิลด์สำหรับนัดหมาย
  });
  
  
const [openEditDialog, setOpenEditDialog] = useState(false);
const [selectedPatient, setSelectedPatient] = useState(null);
const [isEditMode, setIsEditMode] = useState(false);
const [openViewDialog, setOpenViewDialog] = useState(false);
const [selectedViewPatient, setSelectedViewPatient] = useState(null);



  // ✅ ดึงข้อมูลจาก Supabase
  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase.from('patient').select('*');
  
      if (error) {
        console.error("Error fetching patients:", error);
      } else {
        console.log("✅ Data from Supabase:", data); // 🔍 เช็คข้อมูลที่ได้
        setRows(data);
      }
    };
  
    fetchPatients();
  }, []);
  
  // ✅ ค้นหาข้อมูลใน DataGrid
  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [rows, search]);

  // ✅ ฟังก์ชันลบข้อมูลออกจาก Supabase
  const handleDeleteRow = async (id) => {
    const { error } = await supabase.from('patient').delete().eq('patient_id', id);

    if (error) {
      console.error("Error deleting patient:", error);
    } else {
      setRows(rows.filter((row) => row.patient_id !== id));
    }
  };

  const handleEditRow = (patient) => {
    setSelectedPatient(patient);
    setOpenEditDialog(true);
  };
  
  const handleViewRow = (patient) => {
    setSelectedViewPatient(patient);
    setOpenViewDialog(true);
  };
  
  const handleAddPatient = async () => {
    const fullName = `${newPatient.firstName} ${newPatient.lastName}`;
    const formattedDate = newPatient.appointment_date
      ? newPatient.appointment_date.toISOString().split('T')[0] // ✅ แปลงเป็น YYYY-MM-DD
      : null;
  
    const newPatientData = {
      name: fullName,
      age: parseInt(newPatient.age, 10),
      lineid: newPatient.lineId,
      allergic: newPatient.allergic,
      sickness: newPatient.sickness,
      address: newPatient.address,
      tel: newPatient.tel,
      email: newPatient.email,
      appointment_date: formattedDate
    };
  
    const { data, error } = await supabase.from('patient').insert([newPatientData]).select("*");
  
    if (error) {
      console.error("Error inserting patient:", error);
    } else {
      // ✅ อัปเดตตารางทันทีโดยไม่ต้อง refresh
      setRows([...rows, data[0]]);
      
      // ✅ ปิด Dialog และเคลียร์ฟอร์ม
      setOpenDialog(false);
      setNewPatient({
        firstName: '',
        lastName: '',
        age: '',
        lineId: '',
        allergic: '',
        sickness: '',
        address: '',
        tel: '',
        email:'',
        appointment_date: null
      });
    }
  };

  const handleUpdatePatient = async () => {
    if (!selectedPatient) return;
  
    const { error } = await supabase
      .from('patient')
      .update({
        name: selectedPatient.name,
        age: parseInt(selectedPatient.age, 10) || null,
        lineid: selectedPatient.lineid,
        allergic: selectedPatient.allergic,
        sickness: selectedPatient.sickness,
        address: selectedPatient.address,
        appointment_date: selectedPatient.appointment_date
      })
      .eq('patient_id', selectedPatient.patient_id);
  
    if (error) {
      console.error("Error updating patient:", error);
    } else {
      setRows(rows.map(row => row.patient_id === selectedPatient.patient_id ? selectedPatient : row));
      setOpenEditDialog(false);
    }
  };
  
  
  
  

  // ✅ กำหนด Columns ของ DataGrid
  const columns = [
    { field: 'patient_id', headerName: 'ID', width: 30 },
    {
      field: 'view',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => handleViewRow(params.row)}>
          <FontAwesomeIcon icon={faSearch} />
        </IconButton>
      ),
    },
    
    
    { 
      field: 'name', 
      headerName: 'ชื่อ-นามสกุล', 
      width: 200, 
      renderCell: (params) => params.row.name ? params.row.name : "ไม่ระบุ"
    },
    { field: 'age', headerName: 'อายุ', width: 60 },
    { field: 'tel', headerName: 'เบอร์โทร', width: 80 },
    { field: 'email', headerName: 'อีเมล', width: 30 },
    { field: 'address', headerName: 'ที่อยู่', width: 250 },
    { field: 'sickness', headerName: 'โรคประจำตัว', width: 150 },
    { field: 'allergic', headerName: 'อาการแพ้', width: 150 },
    { field: 'status', headerName: 'สถานะ', width: 80 },
    {
      field: 'appointment_date',
      headerName: 'Appointment',
      width: 100,
      renderCell: (params) => formatDate(params.value) 
    },
    {
      field: 'actions',
      headerName: 'จัดการ',
      width: 100,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleEditRow(params.row)}>
            <FontAwesomeIcon icon={faCog} />
          </IconButton>
          <IconButton color="error" onClick={() => handleDeleteRow(params.row.patient_id)}>
            <FontAwesomeIcon icon={faTrashAlt} />
          </IconButton>
        </>
      ),
    }
    
  ];

  return (
    <div>
      <Typography variant="h3" gutterBottom>Patient</Typography>

      {/* ✅ จัดปุ่ม NEW, EDIT ให้อยู่ขวา และ Search Box อยู่ตรงกลาง */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        {/* Search Box ตรงกลาง */}
        <TextField 
          label="Search" 
          variant="outlined" 
          size="small" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          sx={{ flexGrow: 1, marginRight: '20px' }}
        />

        {/* ปุ่มอยู่ด้านขวา */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="contained"
            sx={{ bgcolor: '#6C63FF', color: 'white', fontWeight: 'bold', borderRadius: '8px' }}
            onClick={() => setOpenDialog(true)}
          >
            NEW
          </Button>

          <Button
          variant="contained"
          sx={{ bgcolor: isEditMode ? 'gray' : '#6EC7E2', color: 'white', fontWeight: 'bold', borderRadius: '8px' }}
          onClick={() => setIsEditMode(!isEditMode)}
>
          {isEditMode ? "CANCEL" : "EDIT"}
          </Button>


          <IconButton>
            <FontAwesomeIcon icon={faCog} style={{ fontSize: '20px', color: 'gray' }} />
          </IconButton>
        </div>
      </div>

      {/* ✅ Dialog สำหรับเพิ่มข้อมูล */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
  <DialogTitle>เพิ่มผู้ป่วยใหม่</DialogTitle>
  <DialogContent>
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
      <TextField 
        label="ชื่อจริง" 
        value={newPatient.firstName} 
        onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
      />
      <TextField 
        label="นามสกุล" 
        value={newPatient.lastName} 
        onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
      />
      <TextField 
        label="อายุ"
        value={newPatient.age} 
        onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value.replace(/\D/g, '') })} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
        inputProps={{ inputMode: 'numeric' }}
        sx={{ bgcolor: '#f0f0f0' }}
      />
      <TextField 
        label="LINE ID" 
        value={newPatient.lineId} 
        onChange={(e) => setNewPatient({ ...newPatient, lineId: e.target.value })} 
        fullWidth 
      />
      <TextField 
        label="อาการแพ้" 
        value={newPatient.allergic} 
        onChange={(e) => setNewPatient({ ...newPatient, allergic: e.target.value })} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
      />
      <TextField 
        label="โรคประจำตัว" 
        value={newPatient.sickness} 
        onChange={(e) => setNewPatient({ ...newPatient, sickness: e.target.value })} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
      />
    </Box>


    <TextField 
      label="เบอร์โทรศัพท์" 
      value={newPatient.tel} 
      onChange={(e) => setNewPatient({ ...newPatient, tel: e.target.value })} 
      variant="outlined"
      slotProps={{ inputLabel: { shrink: true } }}
      fullWidth 
      sx={{ marginTop: 2 }}
    />

<TextField 
      label="อีเมล" 
      value={newPatient.email} 
      onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })} 
      variant="outlined"
      slotProps={{ inputLabel: { shrink: true } }}
      fullWidth 
      sx={{ marginTop: 2 }}
    />
    <TextField 
      label="Address" 
      value={newPatient.address} 
      onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })} 
      variant="outlined"
      slotProps={{ inputLabel: { shrink: true } }}
      fullWidth 
      sx={{ marginTop: 2 }}
    />

    
<Box sx={{ mt: 4 }}>

<LocalizationProvider dateAdapter={AdapterDateFns}>
<TextField
    label="เบอร์โทรศัพท์"
    value={newPatient.tel}
    onChange={(e) => setNewPatient({ ...newPatient, tel: e.target.value })}
    variant="outlined"
    slotProps={{ inputLabel: { shrink: true } }}
    fullWidth
  />
</LocalizationProvider>


  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <DatePicker
      label="เลือกวันนัดหมาย"
      value={newPatient.appointment_date}
      onChange={(date) => setNewPatient({ ...newPatient, appointment_date: date })}
      renderInput={(params) => <TextField {...params} fullWidth />}
    />
  </LocalizationProvider>
</Box>


  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDialog(false)}>CANCEL</Button>
    <Button onClick={handleAddPatient} color="primary">ADD</Button>
  </DialogActions>
</Dialog>


      {/* ตารางข้อมูล */}
      <DataGrid 
        rows={filteredRows} 
        columns={columns} 
        pageSize={5} 
        rowsPerPageOptions={[5, 10, 15]} 
        checkboxSelection 
        getRowId={(row) => row.patient_id} // ✅ ใช้ patient_id เป็น ID
      />

<Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
  <DialogTitle>Edit Patient</DialogTitle>
  <DialogContent>
  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'start' }}>

      <TextField 
        label="ชื่อ-นามสกุล" 
        value={selectedPatient?.name || ''} 
        onChange={(e) => setSelectedPatient({ ...selectedPatient, name: e.target.value })} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
      />
      <TextField 
        label="อายุ" 
        value={selectedPatient?.age || ''} 
        onChange={(e) => setSelectedPatient({ ...selectedPatient, age: e.target.value.replace(/\D/g, '') })} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
      />
      <TextField 
        label="LINE ID" 
        value={selectedPatient?.lineid || ''} 
        onChange={(e) => setSelectedPatient({ ...selectedPatient, lineid: e.target.value })} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
      />
      <TextField 
        label="อาการแพ้" 
        value={selectedPatient?.allergic || ''} 
        onChange={(e) => setSelectedPatient({ ...selectedPatient, allergic: e.target.value })} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
      />
      <TextField 
        label="โรคประจำตัว" 
        value={selectedPatient?.sickness || ''} 
        onChange={(e) => setSelectedPatient({ ...selectedPatient, sickness: e.target.value })} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
      />
      <TextField 
        label="ที่อยู่" 
        value={selectedPatient?.address || ''} 
        onChange={(e) => setSelectedPatient({ ...selectedPatient, address: e.target.value })} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}

        fullWidth 
      />
    </Box>

    <Box sx={{ mt: 3 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="เลือกวันนัดหมาย"
          value={selectedPatient?.appointment_date}
          onChange={(date) => setSelectedPatient({ ...selectedPatient, appointment_date: date })}
          renderInput={(params) => <TextField {...params} fullWidth />}
        />
      </LocalizationProvider>
    </Box>
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setOpenEditDialog(false)}>CANCEL</Button>
    <Button onClick={handleUpdatePatient} color="primary">SAVE</Button>
  </DialogActions>
</Dialog>

<Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)}>
  <DialogTitle sx={{ position: 'relative', textAlign: 'center' }}>
    ข้อมูลผู้ป่วย
    <IconButton 
      onClick={() => setOpenViewDialog(false)} 
      sx={{ 
        position: 'absolute', 
        left: 10,  // ✅ ชิดซ้าย
        top: 10,   // ✅ ชิดด้านบน
      }}
    >
      ❌
    </IconButton>
  </DialogTitle>
  <DialogContent>
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
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
        slotProps={{ inputLabel: { shrink: true } }}       />
      <TextField 
        label="LINE ID" 
        value={selectedViewPatient?.lineid || ''} 
        fullWidth 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}       />
      <TextField 
        label="อาการแพ้" 
        value={selectedViewPatient?.allergic || ''} 
        fullWidth 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}       />
      <TextField 
        label="โรคประจำตัว" 
        value={selectedViewPatient?.sickness || ''} 
        fullWidth 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}       />
      <TextField 
        label="ที่อยู่" 
        value={selectedViewPatient?.address || ''} 
        fullWidth 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}       />
      <TextField 
        label="เบอร์โทรศัพท์" 
        value={selectedViewPatient?.tel || ''} 
        fullWidth 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}       />
    </Box>

    <Box sx={{ mt: 3 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="วันนัดหมาย"
          value={selectedViewPatient?.appointment_date ? new Date(selectedViewPatient.appointment_date) : null}
          disabled={true} // ✅ ปิดการเลือกวัน
          renderInput={(params) => (
            <TextField 
              {...params} 
              fullWidth 
              variant="outlined"
              slotProps={{ inputLabel: { shrink: true } }}               value={selectedViewPatient?.appointment_date ? params.value : "ยังไม่ได้นัด"} 
            />
          )}
        />
      </LocalizationProvider>
    </Box>
  </DialogContent>
</Dialog>

    </div>
  );
};

export default Patient;
