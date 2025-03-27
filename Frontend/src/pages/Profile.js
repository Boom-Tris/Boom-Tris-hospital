import { useEffect, useState } from "react";
import axios from "axios";
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

        console.log("📌 User ID from LocalStorage:", userId);

        if (!userId) {
          setError("User ID not found");
          return;
        }

        // ✅ เรียก API โดยส่ง userId ใน URL
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
  const handleSaveProfile = () => {
    console.log("✅ Saving Profile:", profile);
    setOpenEditDialog(false);
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
            <TextField
              label="ID"
              value={profile.medicalpersonnel_id || ""}
              onChange={(e) => setProfile({ ...profile, medicalpersonnel_id: e.target.value })}
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Position"
              value={profile.position || ""}
              onChange={(e) => setProfile({ ...profile, position: e.target.value })}
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Expertise"
              value={profile.expertise || ""}
              onChange={(e) => setProfile({ ...profile, expertise: e.target.value })}
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Affiliation"
              value={profile.affiliation || ""}
              onChange={(e) => setProfile({ ...profile, affiliation: e.target.value })}
              variant="outlined"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveProfile} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Profile;
