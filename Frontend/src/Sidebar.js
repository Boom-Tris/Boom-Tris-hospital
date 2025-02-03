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
import {
  faHome,
  faUpload,
  faCircleUser,
  faBell,
  faStethoscope,
  faColonSign,
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ children }) => {
  const [selectedMenu, setSelectedMenu] = useState('HOME');
  const navigate = useNavigate();

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    navigate(`/${menu.toLowerCase()}`); // เปลี่ยน URL เป็นตัวพิมพ์เล็ก
  };

  const menuItems = [
    { text: 'HOME', icon: faHome },
    { text: 'UPLOAD', icon: faUpload },
    { text: 'PROFILE', icon: faCircleUser },
    { text: 'PATIENT', icon: faStethoscope },
    { text: 'NOTIFICATION', icon: faBell },
    { text: 'LOGIN', icon: faColonSign },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box className="sidebar">
        <Typography variant="h5" className="menu-title">
          Menu
        </Typography>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button="true" // Convert to string
              key={item.text}
              className={`menu-item ${selectedMenu === item.text ? 'selected' : ''}`}
              onClick={() => handleMenuClick(item.text)}
            >
              <ListItemIcon>
                <FontAwesomeIcon icon={item.icon} size="lg" className="icon-color" />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Content */}
      <Box className="main-content">
        {children} {/* Render เนื้อหาจาก Routes */}
      </Box>
    </Box>
  );
};

export default Sidebar;
