import React, { useState, useEffect } from 'react';
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
  faSignOutAlt, // Icon สำหรับออกจากระบบ
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ children }) => {
  const [selectedMenu, setSelectedMenu] = useState('HOME');
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // เพิ่มสถานะ isAdmin

  useEffect(() => {
    // ตรวจสอบว่า user login หรือไม่
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');  // ถ้าไม่ได้ login ให้เปลี่ยนเส้นทางไปหน้า login
    } else {
      const userData = JSON.parse(user);
      setIsAuthenticated(true); // ถ้า login แล้ว set เป็น true
      setIsAdmin(userData.role === 'admins'); // ตรวจสอบว่าเป็น admin หรือไม่
    }
  }, [navigate]);

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    navigate(`/${menu.toLowerCase()}`); // เปลี่ยน URL เป็นตัวพิมพ์เล็ก
  };

  const handleLogout = () => {
    // ลบข้อมูลผู้ใช้จาก localStorage
    localStorage.removeItem('user');
    setIsAuthenticated(false); // อัพเดตสถานะการ login
    navigate('/login'); // เปลี่ยนเส้นทางไปหน้า login
  };
  const menuItems = [
    { text: 'HOME', icon: faHome },
    { text: 'UPLOAD', icon: faUpload },
    ...(isAdmin ? [] : [{ text: 'PROFILE', icon: faCircleUser }]), // Show PROFILE only for non-admin users
    { text: 'PATIENT', icon: faStethoscope },
    // Show Add_personnel only for admin
    ...(isAdmin ? [{ text: 'Add_personnel', icon: faColonSign }] : []),
    { text: 'LOG OUT', icon: faSignOutAlt }, // Show LOG OUT for all users
  ];
  

  if (!isAuthenticated) {
    return null; // ถ้าไม่ได้ login จะไม่แสดง Sidebar และเนื้อหา
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box className="sidebar">
        <Typography variant="h5" className="menu-title">
          Menu
        </Typography>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button="true" // แปลงเป็นสตริง
              key={item.text}
              className={`menu-item ${selectedMenu === item.text ? 'selected' : ''}`}
              onClick={() => {
                if (item.text === 'LOG OUT') {
                  handleLogout(); // ถ้าคลิก "LOG OUT" จะเรียก handleLogout
                } else {
                  handleMenuClick(item.text);
                }
              }}
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
