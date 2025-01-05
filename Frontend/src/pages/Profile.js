import React from "react";
import { Typography, Box } from "@mui/material";

const Profile = () => {
  return (
    <div>
      <Typography variant="h3" gutterBottom>
        Profile
      </Typography>
      <Box
        sx={{
          borderBottom: "2px solid #000",
          marginBottom: 2,
        }}
      ></Box>
      <Typography variant="body1" gutterBottom>
        โปรไฟล์ของคุณ
      </Typography>
    </div>
  );
};

export default Profile;
