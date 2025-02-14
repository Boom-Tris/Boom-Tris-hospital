import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import Sidebar from './Sidebar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Notification from './pages/Notification';
import Profile from './pages/Profile';
import { useEffect, useState } from "react";
import OtpPage from './pages/OtpPage';
import LoginPage from './pages/LoginPage';
import Patient from './pages/Patient';
import Add_personnel from './pages/Add_personnel';
import '@fontsource/k2d';
import axios from "axios";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CircularProgress, Typography } from '@mui/material'; // เพิ่มการนำเข้า


const theme = createTheme({
  typography: {
    fontFamily: '"K2D", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [serverOnline, setServerOnline] = useState(null); // เช็คสถานะเซิร์ฟเวอร์

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        await axios.get("http://localhost:3001/", { timeout: 5000 });
        setServerOnline(true); // เซิร์ฟเวอร์ทำงานอยู่
      } catch (error) {
        console.error("❌ Server is offline or API error:", error);
        setServerOnline(false); // เซิร์ฟเวอร์ล่ม
      }
    };

    fetchUsers();
  }, []);

  return (
    <ThemeProvider theme={theme}>
       {serverOnline === null ? ( // ขณะเช็คเซิร์ฟเวอร์
        <CircularProgress className="LoadServer"/>
      ) : !serverOnline ? ( // เซิร์ฟเวอร์ไม่ทำงาน
        <Typography variant="h5" color="error" className="NE">
          ⚠️ เซิร์ฟเวอร์ไม่ทำงาน กรุณาลองใหม่ภายหลัง
        </Typography>
      ) : (
        <div className='app-background'>
          <Router>
            <Routes>
              <Route path="/otp" element={<OtpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/Add_personnel" element={<Add_personnel />} />
              <Route
                path="/*"
                element={
                  <Sidebar>
                    <Routes>
                      <Route path="/home" element={<Home />} />
                      <Route path="/upload" element={<Upload />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/patient" element={<Patient />} />
                      <Route path="/notification" element={<Notification />} />
                     
                      <Route index element={<Home />} /> {/* หน้าเริ่มต้น */}
                    </Routes>
                  </Sidebar>
                }
              />
            </Routes>
          </Router>
        </div>
      )}
    </ThemeProvider>
  );
}

export default App;
