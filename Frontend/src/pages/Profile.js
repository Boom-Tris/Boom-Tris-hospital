import React from 'react';
import { Select, MenuItem, InputLabel, FormControl , Grid, Box, Typography,
   TextField, Button, Checkbox, FormControlLabel,Avatar } from '@mui/material';
import'../components/pages.css';
const Profile = () => {
  return (
    <div>
      {/*Header Upper box */}
      <Typography variant="h3" gutterBottom>
              Profile
            </Typography>
            <Box
              sx={{
                borderBottom: "2px solid #000",
                marginBottom: 3,
              }}
            ></Box>
            <Typography variant="body1" gutterBottom>
              โปรไฟล์ของคุณ
            </Typography>

      {/*Box */}
      <Box className="Form-box-profile Profile-background"> 
        <form className="form-container">
        <Box
      sx={{
        p: 3,
        maxWidth: "900px",
        background: "#fff",
        borderRadius: "10px",
        
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