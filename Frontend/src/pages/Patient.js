import React, { useState } from 'react';
import { Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Grid, Paper } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faTrashAlt, faCog, faEdit } from '@fortawesome/free-solid-svg-icons'; 
import '../components/Table.css';

const initialRows = [
  { id: 1, name: 'P', age: 25, email: 'cell1@example.com', address: '123 Street A', sickness: 'Flu', allergic: 'None', imageUrl: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: 2, name: 'H', age: 30, email: 'cell2@example.com', address: '456 Street B', sickness: 'Cold', allergic: 'Pollen', imageUrl: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: 3, name: 'L', age: 28, email: 'cell3@example.com', address: '789 Street C', sickness: 'Asthma', allergic: 'Dust', imageUrl: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: 4, name: 'C', age: 35, email: 'cell4@example.com', address: '321 Street D', sickness: 'Diabetes', allergic: 'Peanuts', imageUrl: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: 5, name: 'T', age: 40, email: 'cell5@example.com', address: '654 Street E', sickness: 'Hypertension', allergic: 'Seafood', imageUrl: 'https://randomuser.me/api/portraits/men/5.jpg' },
];

const Patient = () => {
  const [rows, setRows] = useState(initialRows);
  const [openDialog, setOpenDialog] = useState(false);
  const [infoDialog, setInfoDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newRow, setNewRow] = useState({ name: '', dob: '', email: '', address: '', sickness: '', allergic: '', id: '', imageUrl: '' });

  const handleNewClick = () => {
    setOpenDialog(true);
    setEditing(false);
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewRow({ name: '', dob: '', email: '', address: '', sickness: '', allergic: '', id: '', imageUrl: '' });
  };

  const handleInfoDialogClose = () => {
    setInfoDialog(false);
    setSelectedRow(null);
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setInfoDialog(true);
  };

  const calculateAge = (dob) => {
    const [day, month, year] = dob.split('/').map(Number);
    return 2025 - year;
  };

  const handleAddRow = () => {
    const age = calculateAge(newRow.dob);
    setRows([...rows, { ...newRow, age, id: rows.length + 1 }]);
    handleCloseDialog();
  };

  const handleDeleteRow = (id) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const handleDobChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5);
    if (value.length > 10) value = value.slice(0, 10); // Limit to DD/MM/YYYY format
    setNewRow({ ...newRow, dob: value });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    {
      field: 'name',
      headerName: 'Name',
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          onClick={() => handleRowClick(params.row)}
        >
          <Avatar src={params.row.imageUrl} alt={params.row.name} />
          {params.row.name}
        </Box>
      ),
    },
    { field: 'age', headerName: 'Age', width: 100 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'address', headerName: 'Address', width: 250 },
    { field: 'sickness', headerName: 'Sickness', width: 150 },
    { field: 'allergic', headerName: 'Allergic', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        editing && (
          <IconButton color="error" onClick={() => handleDeleteRow(params.row.id)}>
            <FontAwesomeIcon icon={faTrashAlt} />
          </IconButton>
        )
      ),
    },
  ];

  return (
    <div>
      <Typography variant="h3" gutterBottom>
        Patient
      </Typography>
      <Typography variant="body1">การแจ้งเตือน</Typography>

      <Box sx={{ height: 450, width: '100%' }}>
        <Box 
          sx={{  
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex',  gap: 2 }}>
            <TextField 
              label="Search"
              variant="outlined"
              size="small"
              sx={{ width: 200 }}
            />
          </Box>

          <Box sx={{ display: 'flex',  gap: 1 }}>
            <Button variant="contained" color="secondary" onClick={handleNewClick}>
              New
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FontAwesomeIcon icon={faEdit} />}
              onClick={handleEditClick}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="info"
              className='settings-button'
              startIcon={<FontAwesomeIcon icon={faCog} />}
              disableRipple
            >
            </Button>
          </Box>
        </Box>

        <DataGrid
          className="Table"
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 15]}
          checkboxSelection
        />

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Name" 
                fullWidth 
                margin="dense" 
                value={newRow.name} 
                onChange={(e) => setNewRow({ ...newRow, name: e.target.value })} 
              />
              <TextField 
                label="Date of Birth (DD/MM/YYYY)" 
                fullWidth 
                margin="dense" 
                placeholder="02/07/1990" 
                value={newRow.dob} 
                onChange={handleDobChange} 
                inputProps={{ inputMode: 'numeric', maxLength: 10 }}
              />
            </Box>

            <TextField label="Email" fullWidth margin="dense" value={newRow.email} onChange={(e) => setNewRow({ ...newRow, email: e.target.value })} />
            <TextField label="Address" fullWidth margin="dense" value={newRow.address} onChange={(e) => setNewRow({ ...newRow, address: e.target.value })} />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom>Sickness</Typography>
                <TextField label="Sickness" fullWidth multiline rows={2} margin="dense" value={newRow.sickness} onChange={(e) => setNewRow({ ...newRow, sickness: e.target.value })} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom>Allergic</Typography>
                <TextField label="Allergic" fullWidth multiline rows={2} margin="dense" value={newRow.allergic} onChange={(e) => setNewRow({ ...newRow, allergic: e.target.value })} />
              </Box>
            </Box>

            <TextField 
              label="Image URL" 
              fullWidth 
              margin="dense" 
              value={newRow.imageUrl} 
              onChange={(e) => setNewRow({ ...newRow, imageUrl: e.target.value })} 
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleAddRow} color="primary">Add</Button>
          </DialogActions>
        </Dialog>

        {/* Info Dialog */}
        <Dialog open={infoDialog} onClose={handleInfoDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>User Information</DialogTitle>
          <DialogContent>
  {selectedRow && (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={8}>
        <Paper sx={{ padding: 2 }}>
          <Typography variant="h6">Details</Typography>
          <Typography variant="body1"><strong>ID:</strong> {selectedRow.id}</Typography>
          <Typography variant="body1"><strong>Name:</strong> {selectedRow.name}</Typography>
          <Typography variant="body1"><strong>Age:</strong> {selectedRow.age}</Typography>
          <Typography variant="body1"><strong>Email:</strong> {selectedRow.email}</Typography>
          <Typography variant="body1"><strong>Address:</strong> {selectedRow.address}</Typography>
        </Paper>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ padding: 2, mt: 2,border: '1px solid #ccc' }}>
            <Typography variant="subtitle1" gutterBottom>Sickness</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
              {selectedRow.sickness}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ padding: 2, mt: 2 , border: '1px solid #ccc' }}>
            <Typography variant="subtitle1" gutterBottom>Allergic</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
              {selectedRow.allergic}
            </Typography>
          </Paper>
        </Grid>
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
