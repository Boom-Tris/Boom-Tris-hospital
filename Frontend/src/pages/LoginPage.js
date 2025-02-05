import React ,{ useState }  from 'react';
import { Grid, Box, Typography, TextField, Button, Checkbox, FormControlLabel } from '@mui/material';
import '../components/LoginPage.css';

const LoginPage = () => {
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
          Login  
          <Box
            sx={{
              borderBottom: "2px solid #000"  ,
              marginTop: 3,
              }}
          ></Box>
        </Typography>
        
        
        {/* Form */}
        <Box className="form-box Login-with-background">
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
