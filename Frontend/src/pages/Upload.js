import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import { Delete, CheckCircle, Error } from "@mui/icons-material";
import "../components/pages.css";

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({});
  const [email, setEmail] = useState("");
  const [customLink, setCustomLink] = useState("");

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files).map((file) => ({
      name: file.name,
      size: file.size,
    }));
    setFiles(uploadedFiles);

    uploadedFiles.forEach((file) => {
      setUploadStatus((prev) => ({
        ...prev,
        [file.name]: "loading",
      }));

      setTimeout(() => {
        setUploadStatus((prev) => ({
          ...prev,
          [file.name]: file.size > 3 * 1024 * 1024 ? "failed" : "complete",
        }));
      }, 2000);
    });
  };

  const removeFile = (fileName) => {
    setFiles(files.filter((file) => file.name !== fileName));
    setUploadStatus((prev) => {
      const updatedStatus = { ...prev };
      delete updatedStatus[fileName];
      return updatedStatus;
    });
  };

  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Upload
      </Typography>
      <Box
        sx={{
          borderBottom: "2px solid #000",
          marginBottom: 3,
        }}
      ></Box>
      <Typography variant="body1" gutterBottom>
        พื้นที่สำหรับอัพโหลดไฟล์
      </Typography>

      <Box
        sx={{
          maxWidth: "90%",
          margin: "auto",
          padding: 3,
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full name"
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email address"
              variant="outlined"
              margin="normal"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              label="Customized link"
              variant="outlined"
              margin="normal"
              value={customLink}
              onChange={(e) => setCustomLink(e.target.value)}
            />
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography mb={1} sx={{textAlign: "center"}}>Link or drag and drop</Typography>
              <Button
                variant="outlined"
                component="label"
                sx={{
                  border: "2px dashed #ddd",
                  padding: "20px",
                  width: "100%",
                  textTransform: "none",
                }}
              >
                Select Files
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>

            <List sx={{ mt: 2, maxHeight: 200, overflowY: "auto" }}>
              {files.map((file) => (
                <ListItem
                  key={file.name}
                  sx={{
                    borderBottom: "1px solid #ddd",
                    paddingBottom: "10px",
                  }}
                >
                  <ListItemText
                    primary={file.name}
                    secondary={`Size: ${(file.size / 1024).toFixed(2)} KB`}
                  />
                  <ListItemSecondaryAction>
                    {uploadStatus[file.name] === "loading" && (
                      <CircularProgress size={24} />
                    )}
                    {uploadStatus[file.name] === "complete" && (
                      <CheckCircle color="success" />
                    )}
                    {uploadStatus[file.name] === "failed" && (
                      <Typography color="error" variant="caption">
                        Upload failed
                      </Typography>
                    )}
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => removeFile(file.name)}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "30px",
            marginBottom: "10px",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            sx={{ padding: "10px 16px", width: "300px", borderRadius: "8px" }}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Upload;
