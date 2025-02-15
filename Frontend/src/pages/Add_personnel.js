import React, { useState } from "react";
import { Grid, Box, Typography, TextField, Button, Snackbar, Alert } from "@mui/material";
import "../components/LoginPage.css";

const Add_personnel = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    nickname: "",
    position: "",
    expertise: "",
    affiliation: "",
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // ✅ ฟังก์ชันจัดการค่าฟอร์ม
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ ฟังก์ชันบันทึกข้อมูลลง API
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบว่ารหัสผ่านตรงกัน
    if (formData.password !== formData.confirmPassword) {
      setSnackbarMessage("❌ Passwords do not match");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/medical-personnel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          nickname: formData.nickname,
          position: formData.position,
          expertise: formData.expertise,
          affiliation: formData.affiliation,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setSnackbarMessage("✅ Personnel added successfully");
        setSnackbarSeverity("success");
        setFormData({ username: "", password: "", confirmPassword: "", name: "", nickname: "", position: "", expertise: "", affiliation: "" });
      } else {
        setSnackbarMessage(`❌ Error: ${result.error}`);
        setSnackbarSeverity("error");
      }
    } catch (error) {
      setSnackbarMessage("❌ Failed to connect to the server");
      setSnackbarSeverity("error");
    }

    setOpenSnackbar(true);
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
          Add Personnel
          <Box sx={{ borderBottom: "2px solid #000", marginTop: 3 }}></Box>
        </Typography>

        {/* Form */}
        <Box className="form-boxAdd_personnel Login-with-background">
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Full name" name="name" value={formData.name} onChange={handleChange} variant="outlined" required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Nickname" name="nickname" value={formData.nickname} onChange={handleChange} variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Username" name="username" value={formData.username} onChange={handleChange} variant="outlined" required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Position" name="position" value={formData.position} onChange={handleChange} variant="outlined" required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Expertise" name="expertise" value={formData.expertise} onChange={handleChange} variant="outlined" required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Affiliation" name="affiliation" value={formData.affiliation} onChange={handleChange} variant="outlined" required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Password" type="password" name="password" value={formData.password} onChange={handleChange} variant="outlined" required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} variant="outlined" required />
              </Grid>

              {/* ปุ่ม Cancel และ Confirm */}
              <Grid item xs={12} sm={6}>
                <Button fullWidth variant="contained" color="secondary" onClick={() => setFormData({ username: "", password: "", confirmPassword: "", name: "", nickname: "", position: "", expertise: "", affiliation: "" })}>
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button fullWidth variant="contained" color="primary" type="submit">
                  Confirm
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Grid>

      {/* Snackbar สำหรับแจ้งเตือน */}
      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default Add_personnel;
