import React from 'react';
import { Typography, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Chip } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesome
import { faCog } from '@fortawesome/free-solid-svg-icons'; // Import Settings Icon
import '../components/Table.css';

const rows = [
  { id: 1, user: 'P', email: 'cell1@example.com', location: 'Cell', status: 'Active' },
  { id: 2, user: 'H', email: 'cell2@example.com', location: 'Cell', status: 'Active' },
  { id: 3, user: 'L', email: 'cell3@example.com', location: 'Cell', status: 'Active' },
  { id: 4, user: 'C', email: 'cell4@example.com', location: 'Cell', status: 'Active' },
  { id: 5, user: 'T', email: 'cell5@example.com', location: 'Cell', status: 'Suspended' },
];

const columns = [
  { field: 'user', headerName: 'User', width: 100 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'location', headerName: 'Location', width: 150 },
  {
    field: 'status',
    headerName: 'Status',
    width: 150,
    renderCell: (params) => (
      <Chip
        label={params.value}
        color={params.value === 'Active' ? 'success' : 'warning'}
        variant="outlined"
      />
    ),
  },
  { field: 'id', headerName: 'ID', width: 150 },
];

const Patient = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
      Patient
      </Typography>
      <Typography variant="body1">การแจ้งเตือน</Typography>

      <Box sx={{ height: 450, width: '100%' }}>
        {/* ส่วนของ Search และ Attribute */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* ช่อง Search */}
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              sx={{ width: 200 }}
            />
            {/* Dropdown เลือก Attribute */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="attribute-select-label">Attribute</InputLabel>
              <Select
                labelId="attribute-select-label"
                label="Attribute"
                defaultValue="Property"
              >
                <MenuItem value="Property">Property</MenuItem>
                <MenuItem value="Email">Email</MenuItem>
                <MenuItem value="Status">Status</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* ปุ่ม Action, New และ Settings */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" color="primary">
              Action
            </Button>
            <Button variant="contained" color="secondary">
              New
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

        {/* Data Grid */}
        <DataGrid
          className="Table"
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 15]}
          checkboxSelection
        />
      </Box>
    </div>
  );
};

export default Patient;
