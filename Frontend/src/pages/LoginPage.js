import React from 'react';
import { Grid, Box, Typography, TextField, Button, Checkbox, FormControlLabel } from '@mui/material';
import '../components/LoginPage.css';

const LoginPage = () => {
  return (
    <Grid container className="container">
   
      <Grid item xs={12} md={5} className="left-section">
        <Box>
          <img
            src="https://via.placeholder.com/300x400"
            alt="Medical Illustration"
            className="illustration"
          />
        </Box>
      </Grid>

      
      <Grid item xs={12} md={7} className="right-section">
        
        <Typography variant="h1" className="login-title">
          Login
        </Typography>

        {/* Form */}
        <Box className="form-box with-background">
          <form>
            <TextField
              fullWidth
              label="Email address"
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="I accept the Terms and Conditions"
              className="checkbox"
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              className="sign-in-button"
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
