import React from 'react';
import { Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import '../components/pages.css';
const Home = ({ selectedDate, setSelectedDate }) => {
  return (
    <div>
         <Typography variant="h4" gutterBottom>
        HOME
      </Typography>
      <Typography variant="body1" gutterBottom>
        หน้าหลัก
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateCalendar
          date={selectedDate}
          onChange={(newDate) => setSelectedDate(newDate)}
          className="custom-calendar"
        />
      </LocalizationProvider>
    </div>
  );
};

export default Home;
