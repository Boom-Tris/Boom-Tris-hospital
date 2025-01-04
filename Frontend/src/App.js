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

function App() {
  return (
    <div className='app-background'>
      <Router>
        {/* แสดง Sidebar  */}
        <Sidebar>

          {/* Routes สำหรับเปลี่ยนเฉพาะ Main Content */}
          <Routes>
            <Route path="/HOME" element={<Home />} />
            <Route path="/UPLOAD" element={<Upload />} />
            <Route path="/PROFILE" element={<Profile />} />
            <Route path="/NOTIFICATION" element={<Notification />} />
            <Route path="/MESSAGE" element={<Message />} />
            <Route path="/" element={<Home />} /> {/* หน้าเริ่มต้น */}
          </Routes>
        </Sidebar>
      </Router>
    </div>
  );
}

export default App;
