import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './components/Sidebar.css';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUpload, faCircleUser, faBell, faEnvelope,faStethoscope } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ children }) => { //  props children เพื่อแสดงเนื้อหาหลัก
  const [selectedMenu, setSelectedMenu] = useState('HOME');
  const navigate = useNavigate();

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    navigate(`/${menu}`); // เปลี่ยน URL
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
     
      <Box className="sidebar">
        <Typography variant="h5" className="menu-title" >
          Menu 
        </Typography>
        <List >
          {['HOME', 'UPLOAD', 'PROFILE','PATIENT', 'NOTIFICATION', 'MESSAGE' ].map((menu) => (
            <ListItem 
              button
              key={menu}
              className={`menu-item ${selectedMenu === menu ? 'selected' : ''}`}
              onClick={() => handleMenuClick(menu)} // เปลี่ยน route
              
            >
              <ListItemIcon>
                <FontAwesomeIcon 
                  icon={
                    menu === 'HOME' ? faHome
                      : menu === 'UPLOAD' ? faUpload
                      : menu === 'PROFILE' ? faCircleUser
                      : menu === 'PATIENT' ? faStethoscope
                      : menu === 'NOTIFICATION' ? faBell
                      : faEnvelope
                  }
                  size="lg"
                  className="icon-color"
                />
              </ListItemIcon>
              <ListItemText primary={menu} />
              
            </ListItem>
          ))}
        </List>
      </Box >

      {/*Content */}
      <Box className="main-content" >
        {children} {/* Render เนื้อหาจาก Routes */}
      </Box>
    </Box>
  );
};

export default Sidebar;
