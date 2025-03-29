import React, { useState, useEffect} from 'react';
import { Typography, TextField, IconButton, Box, Button, Dialog, DialogTitle, DialogActions, DialogContent , MenuItem ,Menu ,RadioGroup , FormControlLabel , Radio   } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faCog, faSearch } from '@fortawesome/free-solid-svg-icons';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import '../components/Table.css';
import { mt } from 'date-fns/locale';



const formatDate = (dateString) => {
  if (!dateString) return "ไม่ได้นัดหมาย"; 
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const Patient = () => {

  const [openConfirmGroupDelete, setOpenConfirmGroupDelete] = useState(false);
  const [openConfirmDeleteInEdit, setOpenConfirmDeleteInEdit] = useState(false);
  const [patientsToDelete, setPatientsToDelete] = useState([]);
  const [rows, setRows] = useState([]); 
  const [yearType, setYearType] = useState("AD");
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

  setPatientsToDelete(selectedPatients); 
  setOpenConfirmGroupDelete(true);
};
const handleDeletePatientInEdit = async () => {
  if (!selectedPatient) {
    //console.error("❌ ไม่พบข้อมูลผู้ป่วยที่ต้องการลบ");
    return;
  }

  //console.log("🟢 ผู้ป่วยที่กำลังลบ:", selectedPatient);

  try {
    const response = await fetch(`http://localhost:3001/delete-patient/${selectedPatient.patient_id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`❌ Error deleting patient: ${response.status} - ${errorText}`);
    }

   // console.log(`✅ ลบสำเร็จ: ${selectedPatient.name}`);

    setRows((prevRows) => prevRows.filter((row) => row.patient_id !== selectedPatient.patient_id));
    setOpenEditDialog(false);
    setOpenConfirmDeleteInEdit(false);
  } catch (error) {
    //console.error("❌ Fetch Error:", error.message);
  }
};


const handleConfirmGroupDelete = async () => {
  if (selectedIds.length === 0) return;

  try {
    
 //   console.log("🟢 กำลังลบผู้ป่วย:", selectedIds);
    
    const deletePromises = selectedIds.map(id => 
      fetch(`http://localhost:3001/delete-patient/${id}`, {
        method: "DELETE"
      })
    );
    
    const results = await Promise.allSettled(deletePromises);
    
    const errors = results.filter(r => r.status === 'rejected' || (r.value && !r.value.ok));
    
    if (errors.length > 0) {
     // console.error("❌ เกิดข้อผิดพลาดในการลบบางรายการ:", errors);
      alert(`ลบสำเร็จ ${results.length - errors.length} รายการ, ล้มเหลว ${errors.length} รายการ`);
    } else {
     // console.log("✅ ลบผู้ป่วยสำเร็จทั้งหมด:", selectedIds);
    }

    setRows(prevRows => prevRows.filter(row => !selectedIds.includes(row.patient_id)));
    setSelectedIds([]);
    setOpenConfirmGroupDelete(false);
  } catch (error) {
   // console.error("❌ Fetch Error:", error.message);
    alert("เกิดข้อผิดพลาดในการลบข้อมูล: " + error.message);
  }
};
  const [selectedIds, setSelectedIds] = useState([]); 
  const [search, setSearch] = useState("");

  
  const handleFilterConfirm = () => {
    
  
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
  const [anchorElGroup, setAnchorElGroup] = useState(null);
  const openGroupMenu = Boolean(anchorElGroup);

const handleGroupMenuOpen = (event) => {
  setAnchorElGroup(event.currentTarget);
};

const handleGroupMenuClose = () => {
  setAnchorElGroup(null);
};

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedDiseases, setSelectedDiseases] = useState('');
  const [selectedProvinces, setSelectedProvinces] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedViewPatient, setSelectedViewPatient] = useState(null);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3001/all-patients-with-age');
      const data = await response.json();
  
      if (response.ok) {
        const updatedRows = data.map(patient => ({
          ...patient,
          id: patient.patient_id,
          appointment_date: patient.appointment_date ? new Date(patient.appointment_date) : null,
          birthdate: patient.birthdate || "",
          birthYear: patient.birthdate ? new Date(patient.birthdate).getFullYear().toString() : "",

          age: patient.age || "", 

        }));
        setRows(updatedRows);
      } else {
      //  console.error('Error fetching patients:', data);
      }
    } catch (error) {
    //  console.error('Server error:', error);
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
  
  
  const handleEditRow = (patient) => {
    setSelectedPatient(patient);
  
    const year = patient.birthdate ? new Date(patient.birthdate).getFullYear() : null;
    if (year && year < 2500) {
      setYearType("AD");
    } else {
      setYearType("BE");
    }
  
    setOpenEditDialog(true);
  };
  
  const handleViewRow = (patient) => {
    setSelectedViewPatient(patient);  // ตั้งค่า selectedViewPatient ให้เป็นผู้ป่วยที่เลือก
    setOpenViewDialog(true);  // เปิด Dialog เพื่อแสดงข้อมูล
  };

  const isEmailValid = selectedPatient?.email
  ? /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/.test(selectedPatient.email)
  : false;

  const isPhoneValid = selectedPatient?.tel
  ? /^(06|08|09)[0-9]{8}$/.test(selectedPatient.tel)
  : false;

  const isSaveDisabled = !isEmailValid || !isPhoneValid;

  
  const handleUpdatePatient = async () => {
    if (!selectedPatient) return;
  
    const payload = {
      lineUserId: selectedPatient.lineUserId || selectedPatient.lineid || "",
      name: selectedPatient.name,
      birthdate: selectedPatient.birthdate || null,
      email: selectedPatient.email,
      tel: selectedPatient.tel,
      allergic: selectedPatient.allergic,
      sickness: selectedPatient.sickness,
      address: selectedPatient.address,
      appointment_date: selectedPatient.appointment_date || null, 
      status: selectedPatient.status,
    };
    
  //  console.log("📦 Payload ที่ส่งไป:", payload);
    //console.log("📆 appointment_date ที่ส่ง:", payload.appointment_date);
  
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
  
    
  
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.patient_id === selectedPatient.patient_id
            ? { ...row, ...selectedPatient }
            : row
        )
      );
  
      setOpenEditDialog(false);
    } catch (error) {
    //  console.error("❌ Fetch Error:", error.message);
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

        </>
      ),
    },
  ];
  const groupManagementComponent = (
    <>
      <Button
        variant="outlined"
        onClick={handleGroupMenuOpen}
        sx={{
          textTransform: "none",
          fontSize: "14px",
          padding: "4.5px 14px",
          minWidth: "120px",
          whiteSpace: 'nowrap',
          color: "rgba(0, 0, 0, 0.87)", 
          backgroundColor: "#ffffff",
          borderColor: "rgba(0, 0, 0, 0.23)",
          "&:hover": {
            backgroundColor: "#f5f5f5", 
            borderColor: "rgba(0, 0, 0, 0.87)",
          },marginLeft : "-5px"
        }}
      >
        การจัดการหมู่▼
      </Button>
  
      <Menu
        anchorEl={anchorElGroup}
        open={openGroupMenu}
        onClose={handleGroupMenuClose}
      >
        <MenuItem
  onClick={() => {
    handleGroupMenuClose();
    handleOpenConfirmGroupDelete(); 
  }}
  sx={{
    color: "red", 
    "&:hover": {
      backgroundColor: "#ffebee", 
      },
    }}
        >
    <DeleteIcon sx={{ fontSize: "1rem", marginRight: "8px" }} /> 
  ลบผู้ป่วยแบบหมู่
</MenuItem>
      </Menu>
    </>
  );
  
  return (
    
    <>
           <Typography variant="h3" gutterBottom>
           PATIENT
           <Box sx={{ borderBottom: "2px solid #000", marginTop: 3 }}></Box>
            </Typography>
      <PatientTableInternal
        rows={rows}
        filteredRows={filteredRows}
        columns={columns}
        search={search}
        handleSearch={handleSearch}
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
        handleRowSelection={handleRowSelection}
        selectedIds={selectedIds}
        showSelection={true}
        groupManagementComponent={groupManagementComponent}
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

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <RadioGroup
          value={yearType}
          onChange={(e) => {
            const newType = e.target.value;
            setYearType(newType);

            if (selectedPatient?.birthYear) {
              const year = parseInt(selectedPatient.birthYear);
              const adYear = newType === 'BE' ? year - 543 : year;

              setSelectedPatient({
                ...selectedPatient,
                birthdate: `${adYear}-01-01`
              });
            }
          }} 
          sx={{
            gap: -9, 
            mt: -2,
            '& .MuiFormControlLabel-root': {
              mb: -0.5, 
            },
            '& .MuiFormControlLabel-label': {
              marginLeft: -1,
            }
          }}
        >
          <FormControlLabel value="AD" control={<Radio />} label="ค.ศ." />
          <FormControlLabel value="BE" control={<Radio />} label="พ.ศ." />
        </RadioGroup>

        <TextField
          label="ปีเกิด"
          value={selectedPatient?.birthYear || ''}
          onChange={(e) => {
            const rawYear = e.target.value.replace(/\D/g, '');
            if (rawYear.length <= 4) {
              const adYear = yearType === 'BE' ? parseInt(rawYear) - 543 : parseInt(rawYear);
              setSelectedPatient({
                ...selectedPatient,
                birthYear: rawYear,
                birthdate: rawYear ? `${adYear}-01-01` : '',
              });
            }
          }}

          fullWidth
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 0.2 }}
        />
      </Box>



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
          error={selectedPatient?.tel && !/^(06|08|09)[0-9]{8}$/.test(selectedPatient.tel)}
          h helperText={
            selectedPatient?.tel && !/^(06|08|09)[0-9]{8}$/.test(selectedPatient.tel) ? (
              <>
                ขึ้นด้วย 06, 08, 09<br />
                และต้องมี 10 หลัก
              </>
            ) : ""
          }
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
          <MenuItem value="InActive">InActive ❌</MenuItem>
        </TextField>

        <TextField 
        label="อีเมล" 
        value={selectedPatient?.email || ''} 
        onChange={(e) => setSelectedPatient({ ...selectedPatient, email: e.target.value })} 
        variant="outlined"
        fullWidth 
        error={selectedPatient?.email && !/^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/.test(selectedPatient.email)}
        helperText={
          selectedPatient?.email &&
          !/^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/.test(selectedPatient.email) ? (
            <>
              ต้องลงท้ายด้วย@gmail.com <br />       หรือ @hotmail.com
            </>
          ) : ""
        }
        sx={{ gridColumn: 'span 2' }}
      />


      </Box>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
      

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
    <Button 
            onClick={handleUpdatePatient} 
            color="primary"
            disabled={isSaveDisabled}
            >SAVE
    </Button> {/* เรียกใช้ handleUpdatePatient */}
  </Box>
</DialogActions>

</Dialog> 

  
      <Dialog open={openConfirmGroupDelete} onClose={() => setOpenConfirmGroupDelete(false)} maxWidth="sm" fullWidth>
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
          <Button onClick={() => setOpenConfirmGroupDelete(false)} color="primary" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
            ยกเลิก
          </Button>
          <Button onClick={handleConfirmGroupDelete} color="error" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
            ยืนยันการลบ
          </Button>
        </DialogActions>
      </Dialog>
  
      <Dialog open={openConfirmDeleteInEdit} onClose={() => setOpenConfirmDeleteInEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>⚠️ ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            คุณแน่ใจหรือไม่ว่าต้องการลบ <b>{selectedPatient?.name}</b> ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDeleteInEdit(false)} color="primary" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
            ยกเลิก
          </Button>
          <Button onClick={handleDeletePatientInEdit} color="error" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
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
    <TextField label="ชื่อ-นามสกุล" value={selectedViewPatient?.name || ''} fullWidth variant="outlined" />
    <TextField label="อายุ" value={selectedViewPatient?.age || ''} fullWidth variant="outlined" />

    <TextField label="อาการแพ้" value={selectedViewPatient?.allergic || ''} fullWidth multiline rows={3} variant="outlined" />
    <TextField label="โรคประจำตัว" value={selectedViewPatient?.sickness || ''} fullWidth multiline rows={3} variant="outlined" />

    {/* ✅ ซ้าย: ที่อยู่ | ขวา: กล่องซ้อนกัน (เบอร์ + อีเมล) */}
    <TextField
      label="ที่อยู่"
      value={selectedViewPatient?.address || ''}
      fullWidth
      multiline
      rows={5}
      variant="outlined"
    />

    <Box sx={{ display: 'grid', gap: 2 }}>
      <TextField
        label="เบอร์โทรศัพท์"
        value={selectedViewPatient?.tel || ''}
        fullWidth
        variant="outlined"
      />
      <TextField
        label="อีเมล"
        value={selectedViewPatient?.email || ''}
        fullWidth
        variant="outlined"
      />
    </Box>

    <Box sx={{ gridColumn: 'span 2' }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="วันนัดหมาย"
          value={selectedViewPatient?.appointment_date ? new Date(selectedViewPatient.appointment_date) : null}
          disabled
          slotProps={{
            textField: {
              fullWidth: true,
              variant: 'outlined',
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  </Box>
</DialogContent>


      </Dialog>
    </>
  );
  

  
};



export default Patient;
export const PatientTableInternal = ({
  rows,
  filteredRows,
  columns,
  onViewRow,
  search,
  handleSearch,
  anchorEl,
  customStyle,
  open,
  handleClick,
  handleFilterConfirm,
  selectedAgeType,
  ageInput,
  selectedStatus,
  selectedDiseases,
  selectedProvinces,
  setSelectedAgeType,
  setAgeInput,
  setSelectedStatus,
  setSelectedDiseases,
  setSelectedProvinces,
  handleReset,
  handleRowSelection,
  selectedIds,
  hideFooterPagination = false,
  hideFooterSelectedRowCount = false,
  showSelection = true,
  groupManagementComponent = null,
  height = "auto",
  ...props
}) => {
  const defaultColumns = [
    { field: 'patient_id', headerName: 'ID', width: 30 },
    {
      field: 'view',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => onViewRow && onViewRow(params.row)}
>
          <FontAwesomeIcon icon={faSearch} />
        </IconButton>
      ),
      sortable: false,
      filterable: false,
    },
    { field: 'name', headerName: 'ชื่อ-นามสกุล', width: 200 },
    { field: 'age', headerName: 'อายุ', width: 60 },
    { field: 'tel', headerName: 'เบอร์โทร', width: 100 },
    { field: 'email', headerName: 'อีเมล', width: 150 },
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
  ];

  const appliedColumns = columns && columns.length > 0 ? columns : defaultColumns;
  return (
    <div>
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
          backgroundColor: "#ffffff", 
          borderColor: "rgba(0, 0, 0, 0.23)",
          "&:hover": {
            backgroundColor: "#f5f5f5", 
            borderColor: "rgba(0, 0, 0, 0.87)",
          },
        }}
      >
        Filter▼
      </Button>
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
              <FormControlLabel value="InActive" control={<Radio />} label="InActive" />
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
              borderRadius: "5px",
              fontSize: "1rem", 
              fontWeight: "bold", 
              color: "red",                 
              borderColor: "red",            
              "&:hover": {
                backgroundColor: "#ffebee",   
                borderColor: "darkred",       
              }
            }}
          >
            รีเซ็ต
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleFilterConfirm} 
            color="success"
            sx={{ 
              padding: "6px 12px", 
              borderRadius: "5px",
              fontSize: "1rem", 
              fontWeight: "bold", 
            }}
          >
            ค้นหา
          </Button>
        </Box>
      </Menu>

      {groupManagementComponent && (
        <Box sx={{ ml: 2 }}>
          {groupManagementComponent}
        </Box>
      )}
    </Box>
  </div>

  <DataGrid
    rows={filteredRows} 
    columns={appliedColumns}
    pageSize={5}
    rowsPerPageOptions={[5, 10, 15]}
    checkboxSelection={showSelection}
    getRowId={(row) => row.patient_id}
    onRowSelectionModelChange={handleRowSelection}
    hideFooterPagination={hideFooterPagination}
    hideFooterSelectedRowCount={hideFooterSelectedRowCount} 
    selectionModel={selectedIds}
    className="dataGridStyle"
    sx={{
      maxHeight: height,     
      overflowY: "auto",
      ...customStyle,  
    }}
    />
</div>
  );
};
