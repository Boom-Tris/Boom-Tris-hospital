import React, { useState } from 'react';
import { Grid, Box, Typography, TextField, Button, Checkbox, FormControlLabel } from '@mui/material';
import axios from 'axios';
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import '../components/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate(); // ✅ Initialize useNavigate

  const handleLogin = async (event) => {
    event.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:3001/login', {
        email,
        password,
        rememberMe
      });
      
      console.log('✅ Response:', response.data);
      
      if (response.data.message === "Login Success") {
        
        navigate("/home"); // ✅ Redirect to Home after successful login
      } else {
        alert("Invalid credentials!");
      }
    } catch (error) {
      console.error("❌ Login Error:", error.response?.data?.message || "Unknown Error");
      alert("Login Failed! Please try again.");
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
              label="Email address"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FormControlLabel
              control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
              label="I accept the Terms and Conditions"
              className="checkbox"
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              className="sign-in-button"
              type="submit"
            >
              SIGN IN
            </Button>
          </form>
        </Box>
      </Grid>
    </Grid>
  );
};

export default LoginPage;
