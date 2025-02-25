require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;

const bcrypt = require('bcrypt');
const saltRounds = 10;

// เชื่อมต่อกับ Supabase
const supabaseUrl = "https://wxsaarugacjbneliilek.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

// ✅ ทดสอบเชื่อมต่อ Supabase
async function testConnection() {
  try {
    const { data, error } = await supabase.from("admins").select("*");
    if (error) {
      console.error("❌ Error connecting to Supabase:", error);
    } else {
      console.log("✅ Connected to Supabase:", data);
    }
  } catch (err) {
    console.error("❌ Error:", err);
  }
}
testConnection();

// ✅ ทดสอบเซิร์ฟเวอร์
app.get("/", (req, res) => {
  res.json({ message: "Server is online" });
});

// ✅ ดึงข้อมูลโปรไฟล์
app.get("/getProfile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const { data, error } = await supabase
    .from("medicalpersonnel")
    .select("*")
    .eq("username", req.query.username)
    .single();
  

    if (error) return res.status(500).json({ message: "Error fetching profile" });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

//Login สำหรับ Admin และ Medical Personnel
app.post("/login", async (req, res) => {
  console.log("📩 Login request:", req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please provide both username and password." });
  }

  try {
    // 🔍 ตรวจสอบตาราง admins
    let { data: adminUser, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("username", username)
      .single();

    if (!adminError && adminUser) {
      // ✅ ตรวจสอบรหัสผ่านที่ถูก Hash
      const isMatch = await bcrypt.compare(password, adminUser.password);
      if (isMatch) {
        console.log("🔑 Login Success for Admin:", adminUser);
        return res.json({
          message: "Login Success",
          user: adminUser,
          role: "admin",
        });
      } else {
        return res.status(401).json({ message: "Invalid password for admin" });
      }
    }

    // 🔍 หากไม่พบในตาราง admins, ตรวจสอบในตาราง medicalPersonnel
    let { data: medicalUser, error: medicalError } = await supabase
      .from("medicalpersonnel")
      .select("*")
      .eq("username", username)
      .single();

    if (!medicalError && medicalUser) {
      // ✅ ตรวจสอบรหัสผ่านที่ถูก Hash
      const isMatch = await bcrypt.compare(password, medicalUser.password);
      if (isMatch) {
        console.log("🔑 Login Success for Medical Personnel:", medicalUser);
        return res.json({
          message: "Login Success",
          user: medicalUser,
          role: "medicalPersonnel",
        });
      } else {
        return res.status(401).json({ message: "Invalid password for medical personnel" });
      }
    }

    // ❌ ไม่พบผู้ใช้ในทั้งสองตาราง
    return res.status(404).json({ message: "User not found" });

  } catch (err) {
    console.error("❌ An error occurred during login:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});


// ✅ เพิ่ม personnel ใหม่
app.post("/medical-personnel", async (req, res) => {
  try {
    const { username, password, name, nickname, position, expertise, affiliation, email } = req.body;
    console.log("📩 Request body:", req.body);

    // ตรวจสอบว่ามีข้อมูลครบหรือไม่
    if (!username || !password || !name || !position || !expertise || !affiliation || !email) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // ✅ Hash รหัสผ่านก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // เพิ่มข้อมูลลงใน Supabase
    const { data, error } = await supabase
      .from("medicalpersonnel")
      .insert([
        {
          username,
          password: hashedPassword, // ใช้รหัสผ่านที่ถูก hash แล้ว
          name,
          nickname,
          position,
          expertise,
          affiliation,
          email,
        },
      ]);

    console.log("📦 Data:", data);
    console.log("❌ Error:", error);

    if (error) {
      return res.status(500).json({ message: "Error adding personnel", error: error.message });
    }

    return res.status(201).json({ message: "Personnel added successfully", data });
  } catch (err) {
    console.error("❌ Server Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ✅ เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});