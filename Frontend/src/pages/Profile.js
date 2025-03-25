import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, TextField, Button, Avatar } from '@mui/material';
import '../components/pages.css';

const Profile = () => {
  
  const [profile, setProfile] = useState({
    fullName: '',
    nickname: '',
    id: '',
    position: '',
    expertise: '',
    affiliation: '',
    username: '',
    avatarUrl: '',
  });

  useEffect(() => {
    // ดึงข้อมูลโปรไฟล์จาก localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setProfile({
        fullName: user.name || '',
        nickname: user.nickname || '',
        id: user.MedicalPersonnel_id || '',
        position: user.position || '',
        expertise: user.expertise || '',
        affiliation: user.affiliation || '',
        username: user.username || '',
     
      }); // กำหนดค่าที่ดึงมาให้กับ profile
    } else {
    //  console.error("❌ No user data found in localStorage.");
    }
  }, []);

  return (
    <div>
      {/*Header Upper box */}
      <Typography variant="h3" gutterBottom>
        Profile
      </Typography>
      <Box
        sx={{
          borderBottom: '2px solid #000',
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
              maxWidth: '900px',
              background: '#fff',
              borderRadius: '10px',
            }}
          >
            {/* Profile Section */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 4,
              }}
            >
              {/* Avatar */}
              <Avatar
                src={profile.avatarUrl}
                sx={{
                  width: 100,
                  height: 100,
                  mr: 3,
                }}
              />
              <Box>
                <Typography variant="h6">{profile.fullName || 'ชื่อผู้ใช้'}</Typography>
                <Typography variant="subtitle1" sx={{ color: 'gray' }}>
                  {profile.username || 'อีเมล์ผู้ใช้'}
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                sx={{
                  marginLeft: 'auto',
                  height: '40px',
                  textTransform: 'capitalize',
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
                <TextField
                  fullWidth
                  variant="outlined"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Nick Name
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={profile.nickname}
                  onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  ID
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={profile.id}
                  onChange={(e) => setProfile({ ...profile, id: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Position
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Expertise
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={profile.expertise}
                  onChange={(e) => setProfile({ ...profile, expertise: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Affiliation
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={profile.affiliation}
                  onChange={(e) => setProfile({ ...profile, affiliation: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </form>
      </Box>
    </div>
  );
};

export default Profile;