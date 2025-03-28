  import React, { useState } from 'react';
  import { Grid, Box, Typography, TextField, Button, Checkbox, FormControlLabel } from '@mui/material';
  import axios from 'axios';
  import { useNavigate } from "react-router-dom";
  import '../components/LoginPage.css';

  const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
 
    const navigate = useNavigate();

    const handleLogin = async (event) => {
      event.preventDefault();
      setError('');
     
      try {
        const response = await axios.post('http://localhost:3001/login', { 
          username,  
          password 
        });

      

        if (response.data.message === "Login Success") {

          // เก็บข้อมูลผู้ใช้ใน LocalStorage
         localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // เก็บ token ใน sessionStorage
        sessionStorage.setItem("token", response.data.token);
        
          setTimeout(() => {
            navigate("/home"); // เพิ่มดีเลย์เล็กน้อยเพื่อให้ React อัปเดต UI
          }, 500);
        } else {
          setError(response.data.message || 'Invalid username or password!');
        }

      } catch (error) {
      
        setError('Login Failed! Please try again.');
      }
    };

    return (
      <Grid container className="container">
        <Grid item xs={12} md={4} className="left-section">
          <Box>
            <img
              src={`${process.env.PUBLIC_URL}/images/skeleton.png`}
              alt="Medical Illustration"
              className="illustration"
            />
          </Box>
        </Grid>
  
        <Grid item xs={12} md={7} className="right-section">
          <Typography variant="h2" className="login-title">
            Login
            <Box sx={{ borderBottom: "2px solid #000", marginTop: 3 }}></Box>
          </Typography>
  
          <Box className="form-box Login-with-background">
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="username"
                variant="outlined"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="password"
                type="password"
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FormControlLabel
                control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                label="Remember me"
                className="checkbox"
              />
       {error && (
  <Typography color="error" sx={{ marginBottom: 2 }}>
    {error}
  </Typography>
)}
<Button
  variant="contained"
  color="primary"
  className="sign-in-button"
  type="submit"
>
Login
</Button>

            </form>
          </Box>
          
        </Grid>
      </Grid>
    );
  };
  
  export default LoginPage;