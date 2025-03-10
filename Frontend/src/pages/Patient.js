import React, { useState, useEffect, useMemo } from 'react';
import { Typography, TextField, IconButton, Box, Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faCog, faSearch } from '@fortawesome/free-solid-svg-icons';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import '../components/Table.css';
import CryptoJS from "crypto-js";
import validator from 'validator';
// 🗓️ ฟังก์ชันแปลง `appointment_date` เป็น `DD/MM/YYYY`
const formatDate = (dateString) => {
  if (!dateString) return "ไม่ได้นัดหมาย"; // ถ้าไม่มีวันนัดหมาย
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
  const handleRowSelection = (newSelection) => {
    setSelectedIds(newSelection);
  
    if (newSelection.length > 0) {
      setShowTrashIcon(true); // แสดงถังขยะ
      setIsMultiDelete(newSelection.length > 1); // ถ้าเลือกหลายแถวให้เป็น true
    } else {
      setShowTrashIcon(false); // ซ่อนถังขยะ
    }
  };
  
  const [selectedIds, setSelectedIds] = useState([]); 
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState("");
  const [showTrashIcon, setShowTrashIcon] = useState(false);
  const [isMultiDelete, setIsMultiDelete] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    age: '',
    lineId: '',
    allergic: '',
    sickness: '',
    address: '',
    email: '',
    tel: '',
    appointment_date: null, // ✅ Ensure appointment_date is set as null initially
  });
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedViewPatient, setSelectedViewPatient] = useState(null);
  const [submitted, setSubmitted] = useState(false);

 // สำหรับ Dialog การยืนยันการลบ
 const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
 const [patientToDelete, setPatientToDelete] = useState(null);
  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3001/all-patients');
      const data = await response.json();

      if (response.ok) {
       
        // เพิ่มฟิลด์ id สำหรับแต่ละแถว
        const updatedRows = data.map(patient => ({
          ...patient,
          id: patient.patient_id, // ใช้ patient_id เป็น id
        }));
        setRows(updatedRows);
      } else {
        console.error('Error fetching patients:', data);
      }
    } catch (error) {
      console.error('Server error:', error);
    }
  };



  // ดึงข้อมูลผู้ป่วยเมื่อคอมโพเนนต์โหลดครั้งแรก
  useEffect(() => {
    fetchPatients();
  }, []);

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
  


  // ✅ ค้นหาข้อมูลใน DataGrid
  const filteredRows = useMemo(() => {
    return rows
      .filter((row) => row.patient_id !== undefined && row.patient_id !== null)
      .filter((row) =>
        Object.values(row).some((value) =>
          value?.toString().toLowerCase().includes(search.toLowerCase())
        )
      );
  }, [rows, search]);
  
  const handleDeleteRow = (selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) {
      console.error("❌ ไม่มีข้อมูลที่เลือกสำหรับลบ");
      return;
    }
  
    const selectedPatients = rows.filter(row => selectedIds.includes(row.patient_id));
    console.log('Selected patients for delete:', selectedPatients);
  
    setPatientToDelete(selectedPatients); // บันทึกข้อมูลไว้ใช้ตอนยืนยันลบ
    setOpenConfirmDeleteDialog(true); // เปิด Popup ยืนยัน
  };

  

  const validateForm = () => {
    const { firstName, lastName, age, tel, email, address } = newPatient;
  
    if (!firstName || !lastName || !age || !tel || !email || !address) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return false;
    }
  
    if (!validator.isEmail(email)) {
      setError("กรุณาใช้อีเมลที่รองรับ เช่น Gmail, Yahoo, Hotmail, Outlook, iCloud");
      return false;
    }
  
    if (!validator.isMobilePhone(tel, 'th-TH', { strictMode: false })) {
      setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");
      return false;
    }
  
    setError(""); // If all validations pass
    return true;
  };
  

  const handleEditRow = (patient) => {
    setSelectedPatient(patient);
    setOpenEditDialog(true);
  };

  const handleViewRow = (patient) => {
    setSelectedViewPatient(patient);  // ตั้งค่า selectedViewPatient ให้เป็นผู้ป่วยที่เลือก
    setOpenViewDialog(true);  // เปิด Dialog เพื่อแสดงข้อมูล
  };
  
  const handleCancelDelete = () => {
    setOpenConfirmDeleteDialog(false); // Close the dialog
  };


    const handleSubmit = () => {
      setSubmitted(true);
    if (validateForm()) {
      
      handleAddPatient();

      setOpenDialog(false);
      
    }
  };

  
  const handleAddPatient = async () => {
    try {
     
      const response = await fetch('http://localhost:3001/add-patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${newPatient.firstName} ${newPatient.lastName}`,
          age: newPatient.age,
          lineid: newPatient.lineId,
          allergic: newPatient.allergic,
          sickness: newPatient.sickness,
          address: newPatient.address,
          email: newPatient.email,
          tel: newPatient.tel,
          
          appointment_date: newPatient.appointment_date,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setRows([...rows, data]); // Add new patient to rows
        setOpenDialog(false); // Close dialog after adding
      } else {
        
      }
    } catch (error) {
      console.error('Server error:', error);
    }
  };
  
  const handleUpdatePatient = async () => {
    if (!selectedPatient) return;
  
    console.log("🟢 ข้อมูลที่ถูกแก้ไข:", selectedPatient);
  
    // ✅ แปลง `appointment_date` เป็น YYYY-MM-DD ก่อนส่งไปที่เซิร์ฟเวอร์
    const formattedAppointmentDate = selectedPatient.appointment_date
      ? new Date(selectedPatient.appointment_date).toISOString().split("T")[0]
      : null;
  
    // ✅ ส่ง `lineUserId` แต่ไม่ต้องโชว์ใน Edit Dialog
    const payload = {
      patient_id: selectedPatient.patient_id,
      name: selectedPatient.name,
      age: parseInt(selectedPatient.age, 10) || null,
      email: selectedPatient.email,
      tel: selectedPatient.tel,
      allergic: selectedPatient.allergic,
      sickness: selectedPatient.sickness,
      address: selectedPatient.address,
      appointment_date: formattedAppointmentDate,
      lineUserId: selectedPatient.lineUserId || selectedPatient.lineid || ""
    };
  
    console.log("📦 Payload ที่ส่งไป:", payload);
  
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
  
      const data = await response.json();
      console.log("✅ อัปเดตสำเร็จ:", data);
  
      // ✅ อัปเดต UI
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
      {/* Dialog สำหรับยืนยันการลบ */}
    {/* แสดงป๊อปอัพการยืนยันการลบ */}
    <Dialog
  open={openConfirmDeleteDialog}
  onClose={() => setOpenConfirmDeleteDialog(false)}
  aria-labelledby="confirm-delete-dialog-title"
  maxWidth="sm" // ขยายขนาด Dialog
  fullWidth // ทำให้ Dialog เต็มความกว้าง
  disableBackdropClick // ป้องกันการคลิกพื้นหลังเพื่อปิด Dialog
  disableEscapeKeyDown // ป้องกันการกด Esc เพื่อปิด Dialog
  PaperProps={{
    sx: {
      backgroundColor: 'white', // ตั้งค่าสีพื้นหลังของ Dialog
      boxShadow: 'none', // ลบเงา (ถ้าต้องการ)
      borderRadius: '12px', // ปรับความโค้งของมุม
      padding: '20px', // เพิ่ม padding
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
  {/* Search Box ตรงกลาง */}
  <TextField 
    label="Search" 
    variant="outlined" 
    size="small" 
    value={search} 
    onChange={(e) => setSearch(e.target.value)} 
    className="searchTextField"
  />
  {/* ปุ่มอยู่ด้านขวา */}
  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
  <Button
    variant="contained"
    sx={{ bgcolor: '#6C63FF', color: 'white', fontWeight: 'bold', borderRadius: '8px' }}
    onClick={() => setOpenDialog(true)}
  >
    NEW
  </Button>

  {/* ✅ แสดงไอคอนถังขยะเมื่อมีการเลือกแถว */}
  {showTrashIcon && (
    <IconButton 
      color="error" 
      onClick={() => handleDeleteRow(selectedIds)} // เรียกใช้ handleDeleteRow พร้อมส่ง selectedIds
      sx={{ 
        color: isMultiDelete ? 'purple' : 'red' // ถ้าเลือกหลายคนจะเปลี่ยนสีเป็นม่วง
      }}
    >
      <FontAwesomeIcon icon={faTrashAlt} />
    </IconButton>
  )}
</div>
</div>


      {/* ✅ Dialog สำหรับเพิ่มข้อมูล */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
  <DialogTitle>เพิ่มผู้ป่วยใหม่</DialogTitle>
  <DialogContent>
  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, paddingTop: 2 }}>


      <TextField 
        label="ชื่อจริง" 
        value={newPatient.firstName} 
        onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })} 
        
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
        error={submitted && !newPatient.firstName}

      />
      <TextField 
        label="นามสกุล" 
        value={newPatient.lastName} 
        onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
        error={submitted && !newPatient.lastName}
       
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
        error={submitted && !newPatient.age}
      />
   
      <TextField 
        label="อาการแพ้" 
        value={newPatient.allergic} 
        onChange={(e) => setNewPatient({ ...newPatient, allergic: e.target.value })} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
        error={submitted && !newPatient.allergic}
      />
      <TextField 
        label="โรคประจำตัว" 
        value={newPatient.sickness} 
        onChange={(e) => setNewPatient({ ...newPatient, sickness: e.target.value })} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
        error={submitted && !newPatient.sickness}
      />

      
    <TextField 
  label="เบอร์โทรศัพท์" 
  value={newPatient.tel} 
  onChange={(e) => {
    const onlyNums = e.target.value.replace(/\D/g, ""); // ลบตัวอักษรที่ไม่ใช่ตัวเลข
    setNewPatient({ ...newPatient, tel: onlyNums });
  }} 
  variant="outlined"
  slotProps={{ inputLabel: { shrink: true } }}
  fullWidth 
  error={submitted && (!newPatient.tel || !/^0[689]\d{8}$/.test(newPatient.tel))}
  helperText={submitted && (!newPatient.tel 
    ? "กรุณากรอกเบอร์โทรศัพท์" 
    : !/^0[689]\d{8}$/.test(newPatient.tel) 
      ? "เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 08, 09 หรือ 06 และมี 10 หลัก" 
      : ""
  )}

/>
   



<TextField 
  label="อีเมล" 
  value={newPatient.email} 
  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })} 
  variant="outlined"
  slotProps={{ inputLabel: { shrink: true } }}
  fullWidth 
 
  error={submitted && (!newPatient.email || !/^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|icloud\.com)$/.test(newPatient.email))}
  helperText={submitted && (!newPatient.email 
    ? "กรุณากรอกอีเมล" 
    : !/^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|icloud\.com)$/.test(newPatient.email) 
      ? "กรุณาใช้อีเมลที่รองรับ เช่น Gmail, Yahoo, Hotmail, Outlook, iCloud" 
      : ""
  )}
/>

    <TextField 
      label="Address" 
      value={newPatient.address} 
      onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })} 
      variant="outlined"
      slotProps={{ inputLabel: { shrink: true } }}
      fullWidth 
      error={submitted && !newPatient.address}
  
    />

</Box>

<Box sx={{ mt: 4 }}>


  <LocalizationProvider dateAdapter={AdapterDateFns}>
  <DatePicker
  label="เลือกวันนัดหมาย"
  value={newPatient.appointment_date}
  onChange={(date) => setNewPatient({ ...newPatient, appointment_date: date })}
  slots={{ textField: (params) => <TextField {...params} fullWidth /> }} // ใช้ slots แทน renderInput
  error={submitted && !newPatient.appointment_date}
/>

  </LocalizationProvider>
</Box>


  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDialog(false)}>CANCEL</Button>
    <Button onClick={handleSubmit} color="primary">ADD</Button>
  </DialogActions>
</Dialog>


      {/* ตารางข้อมูล */}
      <DataGrid
  key={rows.length}
  rows={filteredRows}
  columns={columns}
  pageSize={5}
  rowsPerPageOptions={[5, 10, 15]}
  checkboxSelection // ทำให้เลือกหลายแถวได้
  getRowId={(row) => row.patient_id} // ใช้ patient_id เป็น ID
  onRowSelectionModelChange={handleRowSelection}  // ใช้ handleRowSelection ที่นี่
  selectionModel={selectedIds} // เชื่อมค่า ID ที่เลือกกลับเข้า DataGrid
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
        label="อาการแพ้" 
        value={selectedPatient?.allergic || ''} 
        onChange={(e) => setSelectedPatient({ ...selectedPatient, allergic: e.target.value })} 
        variant="outlined"
        multiline 
        rows={3} // ✅ เพิ่มความสูง
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
      />
      <TextField 
        label="โรคประจำตัว" 
        value={selectedPatient?.sickness || ''} 
        onChange={(e) => setSelectedPatient({ ...selectedPatient, sickness: e.target.value })} 
        variant="outlined"
        multiline 
        rows={3} // ✅ เพิ่มความสูง
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
      />
      
      <TextField 
        label="ที่อยู่" 
        value={selectedPatient?.address || ''} 
        onChange={(e) => setSelectedPatient({ ...selectedPatient, address: e.target.value })} 
        variant="outlined"
        multiline 
        rows={3} // ✅ เพิ่มความสูง
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
      />

      <TextField 
        label="เบอร์โทรศัพท์" 
        value={selectedPatient?.tel || ''} 
        onChange={(e) => {
          const onlyNums = e.target.value.replace(/\D/g, ""); // ลบตัวอักษรที่ไม่ใช่ตัวเลข
          setSelectedPatient({ ...selectedPatient, tel: onlyNums });
        }} 
        variant="outlined"
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth 
      />

      {/* ✅ ย้ายวันนัดหมายมาไว้ใต้เบอร์โทรศัพท์ */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="เลือกวันนัดหมาย"
          value={selectedPatient?.appointment_date ? new Date(selectedPatient.appointment_date) : null}
          onChange={(date) => setSelectedPatient({ ...selectedPatient, appointment_date: date })}
          slots={{
            textField: (params) => (
              <TextField
                {...params}
                fullWidth
                variant="outlined"
                slotProps={{ inputLabel: { shrink: true } }}
                value={selectedPatient?.appointment_date ? params.value : "ยังไม่ได้นัด"}  
              />
            ),
          }}
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
    rows={3} // ✅ เพิ่มความสูง
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

  {/* ✅ ย้ายฟิลด์วันนัดหมายมาไว้ใต้เบอร์โทรศัพท์ */}
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