import React from "react";
import { Typography, Box } from "@mui/material";

const Message = () => {
  return (
    <div>
      <Typography variant="h3" gutterBottom>
        Message
      </Typography>
      <Box
        sx={{
          borderBottom: "2px solid #000",
          marginBottom: 2,
        }}
      ></Box>
      <Typography variant="body1" gutterBottom>
        ข้อความของคุณ
      </Typography>
    </div>
  );
};

export default Message;
