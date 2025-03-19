import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import Sidebar from './Sidebar';
import Home from './pages/Home';
import Upload from './pages/Upload';

import Profile from './pages/Profile';

import LoginPage from './pages/LoginPage';
import Patient from './pages/Patient';
import AddPersonnel from './pages/Add_personnel';


import '@fontsource/k2d';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"K2D", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <Router> {/* Move Router outside ThemeProvider */}
      <ThemeProvider theme={theme}>
        <div className='app-background'>
          <Routes>
                  <Route path="/login" element={<LoginPage />} />
            <Route path="/Add Personnel" element={<AddPersonnel />} />
            <Route
              path="/*"
              element={
                <Sidebar>
                  <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/Manage Appointments" element={<Upload />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/patient" element={<Patient />} />
                   
                    <Route index element={<Home />} /> {/* หน้าเริ่มต้น */}
                  </Routes>
                </Sidebar>
              }
            />
          </Routes>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
