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

function App() {
  return (
    <div className='app-background'>
      <Router>
        <Routes>
         
          <Route path="/OtpPage" element={<OtpPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />

        
          <Route
            path="/*"
            element={
              <Sidebar>
                <Routes>
                  <Route path="/HOME" element={<Home />} />
                  <Route path="/UPLOAD" element={<Upload />} />
                  <Route path="/PROFILE" element={<Profile />} />
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
  );
}

export default App;
