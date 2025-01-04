import React from 'react';
import { Typography, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Chip } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesome
import { faCog } from '@fortawesome/free-solid-svg-icons'; // Import Settings Icon




const Notification = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Notification
      </Typography>
      <Typography variant="body1">การแจ้งเตือน</Typography>

     
    </div>
  );
};

export default Notification;
