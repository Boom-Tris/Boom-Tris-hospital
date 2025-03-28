import { useEffect, useState } from "react";
import axios from "axios";
import "../components/LoginPage.css";
import {
  Typography,
  Box,
  Avatar,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar, 
  Alert
} from "@mui/material";

const Profile = () => {
  const [profile, setProfile] = useState({
    medicalpersonnel_id: "",
    username: "",
    email: "",
    name: "",
    nickname: "",
    position: "",
    expertise: "",
    affiliation: "",
  });
  
  const [error, setError] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  // ตรวจสอบว่าอีเมลถูกต้องหรือไม่
  const isEmailValid = profile.email && /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/.test(profile.email);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // ✅ ดึงข้อมูล user จาก LocalStorage
        const userRaw = localStorage.getItem("user");
        if (!userRaw) {
          setError("User data not found in LocalStorage");
          return;
        }
        
        const user = JSON.parse(userRaw);
        const userId = user?.medicalpersonnel_id;

        if (!userId) {
          setError("User ID not found");
          return;
        }
        
        // ✅ เรียก API เพื่อดึงข้อมูลโปรไฟล์
        const response = await axios.get(`http://localhost:3001/getProfiled/${userId}`);
        console.log("📌 API Response Data:", response.data);

        if (response.data && response.data.medicalpersonnel_id) {
          // ✅ ใช้ข้อมูลที่ได้จาก API อัปเดต state
          setProfile({
            medicalpersonnel_id: response.data.medicalpersonnel_id ?? "N/A",
            username: response.data.username ?? "N/A",
            email: response.data.email ?? "N/A",
            name: response.data.name ?? "N/A",
            nickname: response.data.nickname ?? "N/A",
            position: response.data.position ?? "N/A",
            expertise: response.data.expertise ?? "N/A",
            affiliation: response.data.affiliation ?? "N/A",
          });
        } else {
          setError("Profile not found for this user.");
        }
      } catch (error) {
        console.error("❌ API Error:", error);
        setError("Error fetching profile. Please try again.");
      }
      
    };

    fetchProfile();
  }, []);
  
  useEffect(() => {
    console.log("📌 Updated Profile Data:", profile);
  }, [profile]);

  // ✅ Handle Save Profile Updates
  const handleSaveProfile = async () => {
    try {
      console.log("✅ Saving Profile:", profile);
  
      // ใช้ userId จาก profile
      console.log("📌 Sending userId:", profile.medicalpersonnel_id);
      const response = await axios.put(`http://localhost:3001/setProfiled/${profile.medicalpersonnel_id}`, {
        username: profile.username,  // ✅ ส่ง username
        email: profile.email,        // ✅ ส่ง email
        name: profile.name,
        nickname: profile.nickname,
      });
  
      if (response.data.message === "Medical personnel data updated successfully") {
        setSnackbarMessage("Edit profile successfully"); // ✅ ตั้งค่าข้อความ
        setSnackbarSeverity("success");
        
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      setSnackbarMessage("Error updating profile");
      setSnackbarSeverity("error");
    }
    setOpenSnackbar(true); // ✅ เปิด Snackbar
  };
  return (
    <div>
      <Typography variant="h3" gutterBottom>
        Profile
      </Typography>
      <Box sx={{ borderBottom: "2px solid #000", marginBottom: 3 }}></Box>
      <Typography variant="body1" gutterBottom>
        โปรไฟล์ของคุณ
      </Typography>

      <Box className="Form-box-profile Profile-background">
        <Box sx={{ p: 3, maxWidth: "900px", background: "#fff", borderRadius: "10px" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Avatar src={profile.avatarUrl || "/default-avatar.png"} sx={{ width: 100, height: 100, mr: 3 }} />
            <Box>
              <Typography variant="h6">{profile.username || "ชื่อผู้ใช้"}</Typography>
              <Typography variant="subtitle1" sx={{ color: "gray" }}>
                {profile.email || "อีเมล์ผู้ใช้"}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              sx={{ marginLeft: "auto", height: "40px", textTransform: "capitalize" }}
              onClick={() => setOpenEditDialog(true)}
            >
              Edit
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle1">Full Name: {profile.name || "N/A"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle1">Nick Name: {profile.nickname || "N/A"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle1">ID: {profile.medicalpersonnel_id || "N/A"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle1">Position: {profile.position || "N/A"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle1">Expertise: {profile.expertise || "N/A"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle1">Affiliation: {profile.affiliation || "N/A"}</Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* ✅ Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
  <DialogTitle>แก้ไขข้อมูลโปรไฟล์</DialogTitle>
  <DialogContent>
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, paddingTop: 2 }}>
      <TextField
        label="Username"
        value={profile.username || ""}
        onChange={(e) => setProfile({ ...profile, username: e.target.value })} // ✅ เพิ่ม onChange
        variant="outlined"
        fullWidth
      />
      
      <TextField
        label="Email"
        value={profile.email || ""}
        onChange={(e) => setProfile({ ...profile, email: e.target.value })} // ✅ เพิ่ม onChange
        variant="outlined"
        error={profile.email && !/^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/.test(profile.email)}
        helperText={
          profile.email &&
          !/^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/.test(profile.email) ? (
            <>
              ต้องลงท้ายด้วย @gmail.com <br /> หรือ @hotmail.com
            </>
          ) : ""
        }
        fullWidth 
        />
        
      <TextField
        label="Full Name"
        value={profile.name || ""}
        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        variant="outlined"
        fullWidth
      />
      <TextField
        label="Nick Name"
        value={profile.nickname || ""}
        onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
        variant="outlined"
        fullWidth
      />
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenEditDialog(false)} color="secondary">
      Cancel
    </Button>
    <Button
      onClick={handleSaveProfile}
      color="primary"
      variant="contained"
      disabled={!isEmailValid} // 🔥 ปิดปุ่มถ้าอีเมลไม่ถูกต้อง
    >
      Save
    </Button>
  </DialogActions>
</Dialog>
{/* Snackbar สำหรับแจ้งเตือน */}
      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Profile;
