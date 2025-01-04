import React, { useState } from 'react';
import { Grid, Box, Typography, Button } from '@mui/material';
import '../components/OtpPage.css';

const OtpPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '']); 

  const handleChange = (e, index) => {
    const newOtp = [...otp];
    const value = e.target.value;

    // ตรวจสอบว่าเป็นตัวเลข
    if (/[^0-9]/.test(value)) {
      return; //  จะไม่ทำการอัปเดต
    }

    newOtp[index] = value;

    // กรอกครบแล้วให้ไปช่องถัดไป
    if (value.length === 1 && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus(); // ไปช่องถัดไปอัตโนมัติ
    }

    // หากผู้ใช้ลบตัวเลข ให้ย้ายโฟกัสกลับไปยังช่องก่อนหน้า
    if (value === '' && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus(); // ไปช่องก่อนหน้า
    }

    setOtp(newOtp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('OTP submitted:', otp.join(''));
  };

  return (
    <Grid container className="container" justifyContent="center">
      <Grid item xs={12} md={5} className="left-section">
        <Box>
          <img
            src="https://via.placeholder.com/300x400"
            alt="OTP Illustration"
            className="illustration"
          />
        </Box>
      </Grid>

      <Grid item xs={12} md={7} className="right-section">
        <Typography variant="h1"  id="otp-title" >
        Continue with email
        </Typography>

        {/* OTP Form */}
        <Box className="form-box with-background">
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} justifyContent="center">
              {otp.map((digit, index) => (
                <Grid item key={index}>
                  <OtpInput
                    id={`otp-${index}`}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    separator={index < otp.length - 1 ? '-' : ''}
                  />
                </Grid>
              ))}
            </Grid>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              className="submit-button"
              type="submit"
            >
              VERIFY OTP
            </Button>
          </form>
        </Box>
      </Grid>
    </Grid>
  );
};

// Custom OTP input component
const OtpInput = ({ value, onChange, separator, id }) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <input
        id={id}
        value={value}
        onChange={onChange}
        className="otp-input"
        maxLength={1}
        style={{ textAlign: 'center', fontSize: '20px' }}
      />
      {separator && <span>{separator}</span>}
    </Box>
  );
};

export default OtpPage;
