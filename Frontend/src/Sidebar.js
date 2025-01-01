import React, { useState } from 'react';
import './components/Sidebar.css';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUpload, faCircleUser, faBell, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'; // ใช้ DateCalendar แทน CalendarPicker

const Sidebar = () => {
  const [selectedMenu, setSelectedMenu] = useState('HOME');  // เก็บเมนูที่ถูกเลือก
  const [selectedDate, setSelectedDate] = useState(new Date());  // เก็บวันที่ที่เลือก

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);  // เปลี่ยนเมนูที่เลือก
  };

  // ข้อมูลที่จะแสดงใน main-content ตามเมนูที่เลือก
  const renderContent = () => {
    switch (selectedMenu) {
      case 'HOME':
        return (
          <div>
            <Typography variant="body1" gutterBottom> 
              หน้าหลัก
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}  >
              <DateCalendar
                date={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate) }  
                className="custom-calendar" 
              />
            </LocalizationProvider>
            
          </div>
        );
      case 'UPLOAD':
        return <Typography variant="body1">พื้นที่สำหรับอัพโหลดไฟล์</Typography>;
      case 'PROFILE':
        return <Typography variant="body1">โปรไฟล์ของคุณ</Typography>;
      case 'NOTIFICATION':
        return <Typography variant="body1">การแจ้งเตือน</Typography>;
      case 'MESSAGE':
        return <Typography variant="body1">ข้อความของคุณ</Typography>;
      default:
        return <Typography variant="body1">เนื้อหาหลัก</Typography>;
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box className="sidebar">
        <Typography variant="h5" className="menu-title">
          Menu
        </Typography>

        <List>
          {['HOME', 'UPLOAD', 'PROFILE', 'NOTIFICATION', 'MESSAGE'].map((menu) => (
            <ListItem 
              button 
              key={menu} 
              className={`menu-item ${selectedMenu === menu ? 'selected' : ''}`}  // เพิ่ม class selected เมื่อเมนูถูกเลือก
              onClick={() => handleMenuClick(menu)}  // เปลี่ยนเมนูที่เลือก
            >
              <ListItemIcon>
                <FontAwesomeIcon icon={menu === 'HOME' ? faHome : menu === 'UPLOAD' ? faUpload : menu === 'PROFILE' ? faCircleUser : menu === 'NOTIFICATION' ? faBell : faEnvelope} size="lg" className="icon-color" />
              </ListItemIcon>
              <ListItemText primary={menu} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main Content */}
      <Box className="main-content">
        <Typography variant="h4" gutterBottom>
          {selectedMenu}
        </Typography>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default Sidebar;
