import React, { useState, useMemo } from 'react';
import { Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Grid, Paper } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faTrashAlt, faCog, faEdit } from '@fortawesome/free-solid-svg-icons'; 
import '../components/Table.css';

const initialRows = [
  { id: 1, name: 'P', age: 25, email: 'cell1@example.com', address: '123 Street A', sickness: 'Flu', LINE_ID: 'None', imageUrl: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: 2, name: 'H', age: 30, email: 'cell2@example.com', address: '456 Street B', sickness: 'Cold', LINE_ID: 'Pollen', imageUrl: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: 3, name: 'L', age: 28, email: 'cell3@example.com', address: '789 Street C', sickness: 'Asthma', LINE_ID: 'Dust', imageUrl: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: 4, name: 'C', age: 35, email: 'cell4@example.com', address: '321 Street D', sickness: 'Diabetes', LINE_ID: 'Peanuts', imageUrl: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: 5, name: 'T', age: 40, email: 'cell5@example.com', address: '654 Street E', sickness: 'Hypertension', LINE_ID: 'Seafood', imageUrl: 'https://randomuser.me/api/portraits/men/5.jpg' },
];

const Patient = () => {
  const [rows, setRows] = useState(initialRows);
  const [openDialog, setOpenDialog] = useState(false);
  const [infoDialog, setInfoDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newRow, setNewRow] = useState({ name: '', dob: '', email: '', address: '', sickness: '', LINE_ID: '', id: '', imageUrl: '' });
  const [search, setSearch] = useState("");

  // Filter rows based on search term, memoized for performance
  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      Object.values(row).some((value) =>
        value.toString().toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [rows, search]);

  const calculateAge = (dob) => {
    const [day, month, year] = dob.split('/').map(Number);
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleAddRow = () => {
    const age = calculateAge(newRow.dob);
    const newId = rows.length ? Math.max(...rows.map(row => row.id)) + 1 : 1;
    setRows([...rows, { ...newRow, age, id: newId }]);
    handleCloseDialog();
  };

  const handleDeleteRow = (id) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

 

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewRow({ name: '', dob: '', email: '', address: '', sickness: '', LINE_ID: '', id: '', imageUrl: '' });
  };

  const handleInfoDialogClose = () => {
    setInfoDialog(false);
    setSelectedRow(null);
  };

  const handleDobChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5);
    if (value.length > 10) value = value.slice(0, 10); // Limit to DD/MM/YYYY format
    setNewRow(prev => ({ ...prev, dob: value }));
  };

  const columns = [
    
    { field: 'id', headerName: 'ID', width: 100, headerClassName: 'column-header', cellClassName: 'column-cell' },
  { 
    field: 'name', 
    headerName: 'ชื่อ-นามสกุล', 
    width: 150, 
    headerClassName: 'column-header', 
    cellClassName: 'column-cell', 
    renderCell: (params) => (
      <div className="column-cell">  <Avatar src={params.row.imageUrl} alt={params.row.name} /> {params.row.name}</div>
    )
  },
     
    
  { 
    field: 'age', 
    headerName: 'อายุ', 
    width: 100, 
    headerClassName: 'column-header column-age', 
    cellClassName: 'column-cell column-age' 
  },
  { 
    field: 'email', 
    headerName: 'อีเมล', 
    width: 200, 
    headerClassName: 'column-header column-email', 
    cellClassName: 'column-cell column-email' 
  },
  { 
    field: 'address', 
    headerName: 'ที่อยู่', 
    width: 250, 
    headerClassName: 'column-header column-address', 
    cellClassName: 'column-cell column-address' 
  },
  { 
    field: 'sickness', 
    headerName: 'โรคประจำตัว', 
    width: 150, 
    headerClassName: 'column-header column-sickness', 
    cellClassName: 'column-cell column-sickness' 
  },
  { 
    field: 'LINE_ID', 
    headerName: 'LINE ID', 
    width: 150, 
    headerClassName: 'column-header column-allergic', 
    cellClassName: 'column-cell column-allergic' 
  },
    {
      field: 'status',
      headerName: 'สถานะ',
      width: 150,
      renderCell: (params) => (
        <IconButton color="error" onClick={() => handleDeleteRow(params.row.id)}>
          <FontAwesomeIcon icon={faTrashAlt} />
        </IconButton>
      ),
    }
  ];

  return (
    <div>
      <Typography variant="h3" gutterBottom className="typography-header">Patient</Typography>
      <Box className="divider" />

      <Box className="data-grid-container">
        <Box className="top-bar">
          <Box className="search-box">
            <TextField label="Search" variant="outlined" size="small" value={search} onChange={(e) => setSearch(e.target.value)} />
          </Box>

          <Box className="action-buttons">
            <Button variant="contained" color="primary" startIcon={<FontAwesomeIcon icon={faEdit} />} onClick={() => setEditing(!editing)}>
              {editing ? 'Save' : 'Edit'}
            </Button>
            <Button variant="contained" color="info" startIcon={<FontAwesomeIcon icon={faCog} />} onClick={() => console.log('Settings clicked')} />
          </Box>
        </Box>

        <DataGrid className="Table" rows={filteredRows} columns={columns} pageSize={5} rowsPerPageOptions={[5, 10, 15]} checkboxSelection />

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogContent>
            <Box className="dialog-content">
              <TextField label="Name" fullWidth margin="dense" value={newRow.name} onChange={(e) => setNewRow(prev => ({ ...prev, name: e.target.value }))} />
              <TextField label="Date of Birth (DD/MM/YYYY)" fullWidth margin="dense" value={newRow.dob} onChange={handleDobChange} inputProps={{ inputMode: 'numeric', maxLength: 10 }} />
              <TextField label="Email" fullWidth margin="dense" value={newRow.email} onChange={(e) => setNewRow(prev => ({ ...prev, email: e.target.value }))} />
              <TextField label="Address" fullWidth margin="dense" value={newRow.address} onChange={(e) => setNewRow(prev => ({ ...prev, address: e.target.value }))} />
              <TextField label="Sickness" fullWidth margin="dense" value={newRow.sickness} onChange={(e) => setNewRow(prev => ({ ...prev, sickness: e.target.value }))} />
              <TextField label="LINE" fullWidth margin="dense" value={newRow.LINE_ID} onChange={(e) => setNewRow(prev => ({ ...prev, LINE_ID: e.target.value }))} />
              <TextField label="Image URL" fullWidth margin="dense" value={newRow.imageUrl} onChange={(e) => setNewRow(prev => ({ ...prev, imageUrl: e.target.value }))} />
            </Box>
          </DialogContent>
          <DialogActions className="dialog-actions">
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleAddRow} color="primary">Add</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={infoDialog} onClose={handleInfoDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>User Information</DialogTitle>
          <DialogContent>
            {selectedRow && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={8}>
                  <Paper className="user-info-paper">
                    <Typography variant="body1"><strong>ID:</strong> {selectedRow.id}</Typography>
                    <Typography variant="body1"><strong>Name:</strong> {selectedRow.name}</Typography>
                    <Typography variant="body1"><strong>Age:</strong> {selectedRow.age}</Typography>
                    <Typography variant="body1"><strong>Email:</strong> {selectedRow.email}</Typography>
                    <Typography variant="body1"><strong>Address:</strong> {selectedRow.address}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper className="user-info-paper">
                    <Typography variant="subtitle1" gutterBottom>Sickness</Typography>
                    <Typography variant="body1">{selectedRow.sickness}</Typography>
                    <Typography variant="subtitle1" gutterBottom>LINE</Typography>
                    <Typography variant="body1">{selectedRow.LINE_ID}</Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleInfoDialogClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default Patient;
