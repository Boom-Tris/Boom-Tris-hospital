import React from "react";
import { Typography, Box } from "@mui/material";

const Notification = () => {
  return (
    <div>
      <Typography variant="h3" gutterBottom>
        Notification
      </Typography>
      <Box
        sx={{
          borderBottom: "2px solid #000",
          marginBottom: 2,
        }}
      ></Box>
      <Typography variant="body1" gutterBottom>
        การแจ้งเตือน
      </Typography>
    </div>
  );
};

export default Notification;
