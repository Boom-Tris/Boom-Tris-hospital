import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  ListItemSecondaryAction,
} from '@mui/material';
import { Delete, CheckCircle, Error } from '@mui/icons-material'; 
 import '../components/pages.css';

const Upload = () => {
 const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({});

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files).map((file) => ({
      name: file.name,
      size: file.size,
    }));
    setFiles(uploadedFiles);

    // Simulating file upload
    uploadedFiles.forEach((file) => {
      setUploadStatus((prev) => ({
        ...prev,
        [file.name]: 'loading',
      }));

      setTimeout(() => {
        setUploadStatus((prev) => ({
          ...prev,
          [file.name]: file.size > 3 * 1024 * 1024 ? 'failed' : 'complete',
        }));
      }, 2000); // Simulate upload delay
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
    <div>
       <Typography variant="h4" gutterBottom> Upload </Typography>
      <Typography variant="body1">พื้นที่สำหรับอัพโหลดไฟล์</Typography>
       <Box   className="custom-Upload"
            /* sx={{
              maxWidth: '90%',
              margin: 'auto',
              padding: 3,
            
              border: '1px solid #ddd',
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            }} */
          > 
            
      
            <Grid container spacing={10}>
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
                />
                <TextField
                  fullWidth
                  label="Customized link"
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
      
              {/*Column */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography mb={1}>Upload files (max 3MB each):</Typography>
                  <Button variant="contained" component="label">
                    Link or drag and drop
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleFileUpload}
                    />
                  </Button>
                </Box>
      
                <List sx={{ mt: 2, maxHeight: 200, overflowY: 'auto' }}>
                  {files.map((file) => (
                    <ListItem key={file.name}>
                      <ListItemText
                        primary={file.name}
                        secondary={`Size: ${(file.size / 1024).toFixed(2)} KB`}
                      />
                      <ListItemSecondaryAction>
                      {uploadStatus[file.name] === 'loading' && <CircularProgress size={24} />}
                        {uploadStatus[file.name] === 'complete' && (
                          <CheckCircle color="success" />
                        )}
                        {uploadStatus[file.name] === 'failed' && (
                          <Typography color="error" variant="caption">
                            Upload failed (File too large)
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
      
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Submit
            </Button>
          </Box>
    </div>
  )
  
};

export default Upload;
