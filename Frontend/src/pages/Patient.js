import React, { useState, useEffect} from 'react';
import { Typography, TextField, IconButton, Box, Button, Dialog, DialogTitle, DialogActions, DialogContent , MenuItem ,Menu ,RadioGroup , FormControlLabel , Radio  } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faCog, faSearch } from '@fortawesome/free-solid-svg-icons';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import '../components/Table.css';
import CryptoJS from "crypto-js";


const formatDate = (dateString) => {
  if (!dateString) return "ไม่ได้นัดหมาย"; 
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
};



const encryptData = (data) => {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), 'secret_key').toString();
  return encrypted;
};
const decryptData = (data) => {
  const bytes = CryptoJS.AES.decrypt(data, 'secret_key');
  const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decrypted;
};


const Patient = () => {

  const [openConfirmGroupDelete, setOpenConfirmGroupDelete] = useState(false);
  const [openConfirmDeleteInEdit, setOpenConfirmDeleteInEdit] = useState(false);
  const [patientsToDelete, setPatientsToDelete] = useState([]);
  const [rows, setRows] = useState([]); 

  const handleRowSelection = (newSelection) => {
    setSelectedIds(newSelection);
  };
  

  const handleReset = () => {
    setSelectedAgeType('');
    setAgeInput('');
    setSelectedStatus('');
    setSelectedDiseases('');
    setSelectedProvinces('');
  };
  

  const [selectedAgeType, setSelectedAgeType] = useState(''); // มากกว่า/น้อยกว่า
  const [ageInput, setAgeInput] = useState(''); // ค่าอายุที่กรอก
  const [selectedStatus, setSelectedStatus] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); 
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
  setAnchorEl(event.currentTarget);
};


const [anchorElManagement, setAnchorElManagement] = useState(null);
const openManagementMenu = Boolean(anchorElManagement);

const handleManagementOpen = (event) => {
  setAnchorElManagement(event.currentTarget);
};

const handleManagementClose = () => {
  setAnchorElManagement(null);
};

const handleOpenConfirmDeleteInEdit = () => {
  setOpenConfirmDeleteInEdit(true);
};

const handleSearch = (event) => {
  const value = event.target.value.toLowerCase(); 
  setSearch(value);

  if (value.trim() === "") {
    setFilteredRows(rows); 
    return;
  }

  const filtered = rows.filter((row) =>
    Object.values(row).some(
      (field) =>
        field &&
        field.toString().toLowerCase().includes(value)
    )
  );

  setFilteredRows(filtered);
};



const handleOpenConfirmGroupDelete = () => {
  if (selectedIds.length === 0) {
    alert("❌ กรุณาเลือกผู้ป่วยก่อนทำการลบ!");
    return;
  }

  const selectedPatients = rows.filter((row) => selectedIds.includes(row.patient_id));

  setPatientsToDelete(selectedPatients); // อัปเดตรายชื่อผู้ป่วยที่จะแสดง
  setOpenConfirmGroupDelete(true); // เปิด Dialog
};
const handleDeletePatientInEdit = async () => {
  if (!selectedPatient) {
    console.error("❌ ไม่พบข้อมูลผู้ป่วยที่ต้องการลบ");
    return;
  }

  console.log("🟢 ผู้ป่วยที่กำลังลบ:", selectedPatient);

  try {
    const response = await fetch(`http://localhost:3001/delete-patient/${selectedPatient.patient_id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`❌ Error deleting patient: ${response.status} - ${errorText}`);
    }

    console.log(`✅ ลบสำเร็จ: ${selectedPatient.name}`);

    // ✅ อัปเดต UI หลังลบ
    setRows((prevRows) => prevRows.filter((row) => row.patient_id !== selectedPatient.patient_id));
    setOpenEditDialog(false);
    setOpenConfirmDeleteInEdit(false);
  } catch (error) {
    console.error("❌ Fetch Error:", error.message);
  }
};


const handleConfirmGroupDelete = async () => {
  if (selectedIds.length === 0) return;

  try {
    const response = await fetch(`http://localhost:3001/delete-patients`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientIds: selectedIds }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`❌ Error deleting patients: ${response.status} - ${errorText}`);
    }

    console.log("✅ ลบผู้ป่วยสำเร็จ:", selectedIds);

    setRows((prevRows) => prevRows.filter((row) => !selectedIds.includes(row.patient_id)));
    setSelectedIds([]); 
    setOpenConfirmGroupDelete(false); 
  } catch (error) {
    console.error("❌ Fetch Error:", error.message);
  }
};
  const [selectedIds, setSelectedIds] = useState([]); 
  const [search, setSearch] = useState("");

  
  const handleFilterConfirm = () => {
    console.log("✅ ใช้ค่ากรอง...");
  
    let filtered = rows; 
      if (selectedAgeType && ageInput) {
      filtered = filtered.filter(row =>
        selectedAgeType === "more" ? row.age > parseInt(ageInput) : row.age < parseInt(ageInput)
      );
    }
      if (selectedStatus) {
      filtered = filtered.filter(row => row.status === selectedStatus);
    }
  
    if (selectedDiseases) {
      const diseasesArray = selectedDiseases.split(",").map(d => d.trim());
      filtered = filtered.filter(row =>
        diseasesArray.some(disease => row.sickness.includes(disease))
      );
    }
      if (selectedProvinces) {
      const provincesArray = selectedProvinces.split(",").map(p => p.trim());
      filtered = filtered.filter(row =>
        provincesArray.some(province => row.address.includes(province))
      );
    }
  
    setFilteredRows(filtered);
    setAnchorEl(null); 
  };
  
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedDiseases, setSelectedDiseases] = useState('');
  const [selectedProvinces, setSelectedProvinces] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedViewPatient, setSelectedViewPatient] = useState(null);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  const [patientToDelete] = useState(null);
  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3001/all-patients');
      const data = await response.json();
  
      if (response.ok) {
        const updatedRows = data.map(patient => ({
          ...patient,
          id: patient.patient_id,
          appointment_date: patient.appointment_date ? new Date(patient.appointment_date) : null, // แปลงเป็น Date object
        }));
        setRows(updatedRows);
      } else {
        console.error('Error fetching patients:', data);
      }
    } catch (error) {
      console.error('Server error:', error);
    }
  };
  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    setFilteredRows(rows);
  }, [rows]);

  useEffect(() => {
    setFilteredRows(rows); 
  }, [rows]);
  const confirmDeletePatient = async () => {
    if (!patientToDelete || patientToDelete.length === 0) return;
  
    const patientIds = patientToDelete.map(p => p.patient_id);
    console.log("🟢 กำลังส่งค่าไปลบ:", JSON.stringify({ patientIds }));
  
    try {
      let response;
  
      if (patientIds.length === 1) {
        // กรณีลบเดี่ยว
        response = await fetch(`http://localhost:3001/delete-patient/${patientIds[0]}`, {
          method: 'DELETE',
        });
      } else {
        // กรณีลบหลายรายการ
        response = await fetch(`http://localhost:3001/delete-patients`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientIds }),
        });
      }
  
      console.log("Response Status: ", response.status); // ดูสถานะการตอบกลับจากเซิร์ฟเวอร์
  
      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("❌ Server error:", errorMessage);
        return;
      }
  
      console.log("✅ ลบสำเร็จ");
      setRows((prevRows) => prevRows.filter(row => !patientIds.includes(row.patient_id))); // ✅ อัปเดต UI
      setSelectedIds([]); // ✅ เคลียร์ค่า ID ที่เลือก
      setOpenConfirmDeleteDialog(false); // ปิด Dialog
    } catch (error) {
      console.error("❌ Fetch Error:", error.message);
    }
  };
  



  const handleEditRow = (patient) => {
    setSelectedPatient(patient);
    setOpenEditDialog(true);
  };

  const handleViewRow = (patient) => {
    setSelectedViewPatient(patient);  // ตั้งค่า selectedViewPatient ให้เป็นผู้ป่วยที่เลือก
    setOpenViewDialog(true);  // เปิด Dialog เพื่อแสดงข้อมูล
  };
  
  const handleUpdatePatient = async () => {
    if (!selectedPatient) return;
  
    const payload = {
      lineUserId: selectedPatient.lineUserId || selectedPatient.lineid || "",
      name: selectedPatient.name,
      age: parseInt(selectedPatient.age, 10) || null,
      email: selectedPatient.email,
      tel: selectedPatient.tel,
      allergic: selectedPatient.allergic,
      sickness: selectedPatient.sickness,
      address: selectedPatient.address,
      appointment_date: selectedPatient.appointment_date || null, // ✅ ใช้ค่าเดิมที่แปลงจาก DatePicker
    };
    
    console.log("📦 Payload ที่ส่งไป:", payload);
    console.log("📆 appointment_date ที่ส่ง:", payload.appointment_date);
  
    try {
      const response = await fetch("http://localhost:3001/update-patient", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`❌ Error updating patient: ${response.status} - ${errorText}`);
      }
  
      console.log("✅ อัปเดตสำเร็จ");
  
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.patient_id === selectedPatient.patient_id
            ? { ...row, ...selectedPatient }
            : row
        )
      );
  
      setOpenEditDialog(false);
    } catch (error) {
      console.error("❌ Fetch Error:", error.message);
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ป่วย");
    }
  };
  
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
    { field: 'name', headerName: 'ชื่อ-นามสกุล', width: 200 },
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
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: 'actions',
  headerName: 'แก้ไขข้อมูล',
  width: 100,
  renderCell: (params) => (
    <>
      <IconButton color="primary" onClick={() => handleEditRow(params.row)}>
        <FontAwesomeIcon icon={faCog} />
      </IconButton>
    <Dialog
  open={openConfirmDeleteDialog}
  onClose={() => setOpenConfirmDeleteDialog(false)}
  aria-labelledby="confirm-delete-dialog-title"
  maxWidth="sm" 
  fullWidth 
  disableBackdropClick 
  disableEscapeKeyDown 
  PaperProps={{
    sx: {
      backgroundColor: 'white', 
      boxShadow: 'none', 
      borderRadius: '12px', 
      padding: '20px', 
    },
  }}
>
  <DialogTitle id="confirm-delete-dialog-title" sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
    ยืนยันการลบ
  </DialogTitle>
  <DialogContent>
    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '10px' }}>
      คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลผู้ป่วยเหล่านี้?
    </Typography>
    <ul>
      {patientToDelete && patientToDelete.map((patient) => (
        <li key={patient.patient_id} style={{ fontSize: '1rem', marginBottom: '5px' }}>
          {patient.name}
        </li>
      ))}
    </ul>
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setOpenConfirmDeleteDialog(false)} 
      color="primary"
      sx={{ fontSize: '1rem', fontWeight: 'bold' }}
    >
      ยกเลิก
    </Button>
    <Button 
      onClick={confirmDeletePatient} 
      color="error"
      sx={{ fontSize: '1rem', fontWeight: 'bold' }}
    >
      ลบ
    </Button>
  </DialogActions>
</Dialog>



        </>
      ),
    },
  ];

  return (
    <div>
      <Typography variant="h3" gutterBottom>Patient</Typography>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
  <Box sx={{ marginRight: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
  <TextField 
    label="Search" 
    variant="outlined" 
    size="small" 
    value={search} 
    onChange={handleSearch}
    className="searchTextField"
  />
<Button
  variant="outlined"
  onClick={handleClick}
  sx={{
    textTransform: "none",
    fontSize: "14px",
    padding: "4px 10px",
    minWidth: "90px",
    color: "rgba(0, 0, 0, 0.87)", 
    borderColor: "rgba(0, 0, 0, 0.23)",
    "&:hover": {
      backgroundColor: "#f5f5f5", 
      borderColor: "rgba(0, 0, 0, 0.87)",
    },
  }}
>
  Filter ▼
</Button>


{/* เมนูสำหรับ Filter */}
<Menu
  anchorEl={anchorEl}
  open={open}
  onClose={handleFilterConfirm}  
  sx={{ padding: '8px' }}
>
  <MenuItem>
    <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 2, alignItems: 'center' }}>
      <Typography sx={{ fontWeight: 'bold' }}>อายุ</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <RadioGroup
          row
          value={selectedAgeType}
          onChange={(e) => setSelectedAgeType(e.target.value)}
        >
          <FormControlLabel value="more" control={<Radio />} label="มากกว่า" />
          <FormControlLabel value="less" control={<Radio />} label="น้อยกว่า" />
        </RadioGroup>
        <TextField 
          type="number"
          size="small"
          value={ageInput}
          onChange={(e) => setAgeInput(e.target.value)}
          sx={{ width: '80px' }}
        />
      </Box>
    </Box>
  </MenuItem>

  <MenuItem>
    <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 2, alignItems: 'center' }}>
      <Typography sx={{ fontWeight: 'bold' }}>สถานะ</Typography>
      <RadioGroup
        row
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
      >
        <FormControlLabel value="Active" control={<Radio />} label="Active" />
        <FormControlLabel value="Inactive" control={<Radio />} label="Inactive" />
      </RadioGroup>
    </Box>
  </MenuItem>

  <MenuItem>
    <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 2, alignItems: 'center' }}>
      <Typography sx={{ fontWeight: 'bold' }}>กรองโรค</Typography>
      <TextField 
        placeholder="เช่น หวัด,เบาหวาน"
        size="small"
        value={selectedDiseases}
        onChange={(e) => setSelectedDiseases(e.target.value)}
        sx={{ width: '100%' }}
      />
    </Box>
  </MenuItem>

  <MenuItem>
    <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 2, alignItems: 'center' }}>
      <Typography sx={{ fontWeight: 'bold' }}>จังหวัด</Typography>
      <TextField 
        placeholder="เช่น กรุงเทพ,เชียงใหม่"
        size="small"
        value={selectedProvinces}
        onChange={(e) => setSelectedProvinces(e.target.value)}
        sx={{ width: '100%' }}
      />
    </Box>
  </MenuItem>

  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, px: 2 }}>
  <Button 
  variant="outlined" 
  onClick={handleReset}
  sx={{ 
    padding: "6px 12px", 
    minWidth: "auto",
    borderRadius: "5px",
    ml: 0.5,
    fontSize: "1rem", 
    fontWeight: "bold", 
    display: "flex",
    alignItems: "center",
    gap: "8px", 
    color: "red",                 
    borderColor: "red",            
    "&:hover": {
      backgroundColor: "#ffebee",   
      borderColor: "darkred",       
    }
  }}
>
  รีเซ็ต 🔄
</Button>


<Button 
  variant="outlined" 
  onClick={handleFilterConfirm} 
  color="success"
  sx={{ 
    padding: "6px 12px", 
    minWidth: "auto",
    borderRadius: "5px",
    ml: 0.5,
    fontSize: "1rem", 
    fontWeight: "bold", 
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }}
>
  ค้นหา✅
</Button>
</Box>

</Menu>

<Button
  variant="outlined"
  onClick={handleManagementOpen}
  sx={{ 
    textTransform: "none",
    fontSize: "14px", 
    padding: "4px 10px", 
    minWidth: "auto", 
    color: "rgba(0, 0, 0, 0.87)",           
    borderColor: "rgba(0, 0, 0, 0.23)",     
    "&:hover": {
      backgroundColor: "#f5f5f5",           
      borderColor: "rgba(0, 0, 0, 0.87)",   
    }
  }}
>
  การจัดการหมู่▼
</Button>

<Menu
  anchorEl={anchorElManagement} 
  open={openManagementMenu}
  onClose={handleManagementClose}
  sx={{ padding: '8px' }}
>
<MenuItem 
  onClick={handleOpenConfirmGroupDelete}
  sx={{ padding: '4px 8px', minWidth: 'auto' }} 
>
<Typography 
  sx={{ fontWeight: 'normal', color: 'red', fontSize: '0.875rem' }} 
>
  ลบผู้ป่วยที่เลือก🗑️
</Typography>

</MenuItem>


</Menu>

</Box>





 

</div>
      <DataGrid
  rows={filteredRows} 
  columns={columns}
  pageSize={5}
  rowsPerPageOptions={[5, 10, 15]}
  checkboxSelection
  getRowId={(row) => row.patient_id}
  onRowSelectionModelChange={handleRowSelection}
  selectionModel={selectedIds}
  className="dataGridStyle"
/>

<Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
  <DialogTitle>แก้ไขข้อมูลผู้ป่วย</DialogTitle>
  <DialogContent>
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, paddingTop: 2 }}>
      
      <TextField 
        label="ชื่อ-นามสกุล" 
        value={selectedPatient?.name || ''} 
        onChange={(e) => setSelectedPatient({ ...selectedPatient, name: e.target.value })} 
        variant="outlined"
        fullWidth 
      />

      <TextField 
        label="อายุ" 
        value={selectedPatient?.age || ''} 
        onChange={(e) => setSelectedPatient({ ...selectedPatient, age: e.target.value.replace(/\D/g, '') })} 
        variant="outlined"
        fullWidth 
      />

      <TextField 
        label="อาการแพ้" 
        value={selectedPatient?.allergic || ''} 
        onChange={(e) => setSelectedPatient({ ...selectedPatient, allergic: e.target.value })} 
        variant="outlined"
        multiline 
        rows={3} 
        fullWidth 
      />

      <TextField 
        label="โรคประจำตัว" 
        value={selectedPatient?.sickness || ''} 
        onChange={(e) => setSelectedPatient({ ...selectedPatient, sickness: e.target.value })} 
        variant="outlined"
        multiline 
        rows={3} 
        fullWidth 
      />

      <TextField 
        label="ที่อยู่" 
        value={selectedPatient?.address || ''} 
        onChange={(e) => setSelectedPatient({ ...selectedPatient, address: e.target.value })} 
        variant="outlined"
        multiline 
        rows={4} 
        fullWidth 
      />

      <Box sx={{ display: 'grid', gap: 1.6 }}>
        <TextField 
          label="เบอร์โทรศัพท์" 
          value={selectedPatient?.tel || ''} 
          onChange={(e) => {
            const onlyNums = e.target.value.replace(/\D/g, ""); 
            setSelectedPatient({ ...selectedPatient, tel: onlyNums });
          }} 
          variant="outlined"
          fullWidth 
        />

        <TextField
          select
          label="สถานะ"
          value={selectedPatient?.status || ''} 
          onChange={(e) => setSelectedPatient({ ...selectedPatient, status: e.target.value })}
          variant="outlined"
          fullWidth
        >
          <MenuItem value="Active">Active ✅</MenuItem>
          <MenuItem value="Inactive">Inactive ❌</MenuItem>
        </TextField>

        <TextField 
          label="อีเมล" 
          value={selectedPatient?.email || ''} 
          onChange={(e) => setSelectedPatient({ ...selectedPatient, email: e.target.value })} 
          variant="outlined"
          fullWidth 
          error={selectedPatient?.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(selectedPatient.email)}
          helperText={selectedPatient?.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(selectedPatient.email) ? "กรุณากรอกอีเมลที่ถูกต้อง" : ""}
          sx={{ gridColumn: 'span 2' }} // ✅ ทำให้ขยายเต็ม 2 คอลัมน์
/>

      </Box>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
  <DatePicker
    label="เลือกวันนัดหมาย"
    value={selectedPatient?.appointment_date ? new Date(selectedPatient.appointment_date) : null}
    onChange={(date) => {
      if (date) {
        const formattedDate = date.toISOString().split('T')[0]; // แปลงเป็น "YYYY-MM-DD"
        console.log("📅 วันนัดหมายที่เลือก:", formattedDate); // Debug
        setSelectedPatient((prev) => {
          const updated = {
            ...prev,
            appointment_date: formattedDate
          };
          console.log("🔄 ข้อมูลผู้ป่วยหลังอัพเดท:", updated); // Debug
          return updated;
        });
      } else {
        setSelectedPatient((prev) => ({
          ...prev,
          appointment_date: null,
        }));
      }
    }}
    // แทนที่ renderInput ด้วยการกำหนด slotProps สำหรับ MUI v6+
    slotProps={{ 
      textField: { 
        fullWidth: true,
        variant: "outlined" 
      } 
    }}
  />
</LocalizationProvider>

</LocalizationProvider>

    </Box>
  </DialogContent> 
  <DialogActions sx={{ justifyContent: "space-between", padding: "16px" }}>
  <Button
    variant="outlined"
    color="error"
    onClick={handleOpenConfirmDeleteInEdit}
    sx={{ 
      fontSize: '1rem', 
      fontWeight: 'bold', 
      border: '1px solid red',
      borderRadius: '8px',
      padding: '8px 12px',
      textTransform: 'none',
      bgcolor: '#ffebee',
      "&:hover": { bgcolor: '#ffcccc' }
    }}
  >
    ลบผู้ป่วยรายนี้
  </Button>

  <Box sx={{ display: "flex", gap: "8px" }}>
    <Button onClick={() => setOpenEditDialog(false)}>CANCEL</Button>
    <Button onClick={handleUpdatePatient} color="primary">SAVE</Button> {/* เรียกใช้ handleUpdatePatient */}
  </Box>
</DialogActions>

</Dialog> {/* ✅ ปิด Dialog อย่างถูกต้อง */}

<Dialog
  open={openConfirmGroupDelete}
  onClose={() => setOpenConfirmGroupDelete(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>⚠️ ยืนยันการลบ</DialogTitle>
  <DialogContent>
    <Typography variant="body1" sx={{ marginBottom: 2 }}>
      คุณแน่ใจหรือไม่ว่าต้องการลบผู้ป่วยเหล่านี้?
    </Typography>
    <ul>
      {patientsToDelete.map((patient) => (
        <li key={patient.patient_id} style={{ fontSize: '1rem', marginBottom: '5px' }}>
          {patient.name}
        </li>
      ))}
    </ul>
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setOpenConfirmGroupDelete(false)} 
      color="primary"
      sx={{ fontSize: '1rem', fontWeight: 'bold'  }}
    >
      ยกเลิก
    </Button>
    <Button 
      onClick={handleConfirmGroupDelete} 
      color="error"
      sx={{ fontSize: '1rem', fontWeight: 'bold' }}
    >
      ยืนยันการลบ
    </Button>
  </DialogActions>
</Dialog>



<Dialog
  open={openConfirmDeleteInEdit}
  onClose={() => setOpenConfirmDeleteInEdit(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>⚠️ ยืนยันการลบ</DialogTitle>
  <DialogContent>
    <Typography variant="body1" sx={{ marginBottom: 2 }}>
      คุณแน่ใจหรือไม่ว่าต้องการลบ <b>{selectedPatient?.name}</b> ?
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setOpenConfirmDeleteInEdit(false)} 
      color="primary"
      sx={{ fontSize: '1rem', fontWeight: 'bold' }}
    >
      ยกเลิก
    </Button>
    <Button 
      onClick={handleDeletePatientInEdit} 
      color="error"
      sx={{ fontSize: '1rem', fontWeight: 'bold' }}
    >
      ยืนยันการลบ
    </Button>
  </DialogActions>
</Dialog>


<Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)}>
  <DialogTitle sx={{ position: 'relative', textAlign: 'center' }}>
    ข้อมูลผู้ป่วย
    <IconButton 
      onClick={() => setOpenViewDialog(false)} 
      sx={{ 
        position: 'absolute', 
        left: 10,  
        top: 10,   
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
    rows={3} // ✅ เพิ่มความสูง
    variant="outlined"
    slotProps={{ inputLabel: { shrink: true } }} 
  />
  <TextField 
    label="โรคประจำตัว" 
    value={selectedViewPatient?.sickness || ''} 
    fullWidth 
    multiline 
    rows={3} // ✅ เพิ่มความสูง
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

    </div>
  );
};

export default Patient;