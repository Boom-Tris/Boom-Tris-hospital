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
import Message from './pages/Message';
import OtpPage from './pages/OtpPage';
import LoginPage from './pages/LoginPage';
import Patient from './pages/Patient';
import '@fontsource/k2d';
import { createTheme, ThemeProvider } from '@mui/material/styles';
const theme = createTheme({
  typography: {
    fontFamily: '"K2D", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>

   
    <div className='app-background'>
      <Router>
        <Routes>
         
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/login" element={<LoginPage />} />
       
        

          <Route
            path="/*"
            element={
              <Sidebar>
                <Routes>
                  <Route path="/HOME" element={<Home />} />
                  <Route path="/UPLOAD" element={<Upload />} />
                  <Route path="/PROFILE" element={<Profile />} />
                  <Route path="/Patient" element={<Patient />} />
                  <Route path="/NOTIFICATION" element={<Notification />} />
                  <Route path="/MESSAGE" element={<Message />} />
                  <Route index element={<Home />} /> {/* หน้าเริ่มต้น */}
                </Routes>
              </Sidebar>
            }
          />
        </Routes>
      </Router>
    </div>
    </ThemeProvider>
  );
}

export default App;
