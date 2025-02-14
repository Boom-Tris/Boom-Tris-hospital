import React, { useState } from 'react';
import { Grid, Box, Typography, TextField, Button } from '@mui/material';
import '../components/LoginPage.css';
import { Add } from '@mui/icons-material';

const Add_personnel = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // Add login logic here
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Remember Me:', rememberMe);
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
          Add personnel
          <Box
            sx={{
              borderBottom: "2px solid #000",
              marginTop: 3,
            }}
          ></Box>
        </Typography>

        {/* Form */}
        <Box className="form-boxAdd_personnel Login-with-background">
          <form>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full name"
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nickname"
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email address"
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ID"
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Position"
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expertise"
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Affiliation"
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
               <Button
              fullWidth
              variant="contained"
              color="primary"
              id="Cancel-button"
            >
              Cancel
            </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
               <Button
              fullWidth
              variant="contained"
              color="primary"
              className="Confirm-button"
            >
              Confirm
            </Button>
              </Grid>
              

             
            
            
            </Grid>
            
          </form>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Add_personnel;
