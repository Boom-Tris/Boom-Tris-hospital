import React from 'react';
import { Select, MenuItem, InputLabel, FormControl , Grid, Box, Typography,
   TextField, Button, Checkbox, FormControlLabel,Avatar } from '@mui/material';
import '../components/Table.css';
import'../components/ProfilePage.css';
const Profile = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>Profile</Typography>
      <Typography variant="subtitle1">โปรไฟล์ของคุณ</Typography>  
      <hr style={{ marginBottom: "20px", borderColor: "#ccc" }} />
      <Box className="Form-box-profile Profile-background"> 
        <form className="form-container">
        <Box
      sx={{
        p: 3,
        maxWidth: "900px",
        margin: "0 auto",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >

      

      {/* Profile Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 4,
        }}
      >
        {/* Avatar */}
        <Avatar
          src="https://via.placeholder.com/100"
          sx={{
            width: 100,
            height: 100,
            mr: 3,
          }}
        />
        <Box>
          <Typography variant="h6">Alexa Rawles</Typography>
          <Typography variant="subtitle1" sx={{ color: "gray" }}>
            alexarawles@gmail.com
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          sx={{
            marginLeft: "auto",
            height: "40px",
            textTransform: "capitalize",
          }}
        >
          Edit
        </Button>
      </Box>

      {/* Form Section */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Full Name
          </Typography>
          <TextField fullWidth variant="outlined" />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Nick Name
          </Typography>
          <TextField fullWidth variant="outlined" />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            ID
          </Typography>
          <TextField fullWidth variant="outlined" />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Position
          </Typography>
          <TextField fullWidth variant="outlined" />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Expertise
          </Typography>
          <TextField fullWidth variant="outlined" />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Affiliation
          </Typography>
          <TextField fullWidth variant="outlined" />
        </Grid>
      </Grid>
    </Box>
        </form>
      </Box>
    </div>
  );
};

export default Profile; 