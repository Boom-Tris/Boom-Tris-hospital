require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;

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

    const { data, error } = await supabase.from("medicalpersonnel").select("*").single();

    if (error) return res.status(500).json({ message: "Error fetching profile" });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/login", async (req, res) => {
  console.log("📩 การร้องขอการเข้าสู่ระบบ:", req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please provide both username and password." });
  }

  try {
    // ตรวจสอบตาราง admins
    let { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();
    
    console.log("🔍 ผลลัพธ์จากตาราง admins:", admins); // ดูข้อมูลที่ได้จาก Supabase

    if (adminError) {
      console.error("❌ ไม่พบผู้ใช้ในตาราง admins:", adminError);

      // หากไม่พบในตาราง admins, ตรวจสอบในตาราง medicalPersonnel
      let { data: medicalResults, error: medicalError } = await supabase
        .from('medicalpersonnel')
        .select('*')
        .eq('username', username)
        .single();

      console.log("🔍 ผลลัพธ์จากตาราง medicalPersonnel:", medicalResults); // ดูข้อมูลที่ได้จาก Supabase

      if (medicalError) {
        console.error("❌ ไม่พบผู้ใช้ในตาราง medicalPersonnel:", medicalError);
        return res.status(404).json({ message: "User not found" });
      }

      // เปรียบเทียบรหัสผ่านสำหรับ medical personnel
      if (medicalResults.password === password) {
        return res.json({
          message: "Login Success",
          user: medicalResults,
          role: "medicalPersonnel"
        });
      } else {
        return res.status(401).json({ message: "Invalid password for medical personnel" });
      }
    }

    // เปรียบเทียบรหัสผ่านสำหรับ admin
    if (admins.password === password) {
      console.log("🔑 Login Success for Admin:", admins); // เพิ่มการพิมพ์ข้อมูลผู้ใช้ที่เข้าสู่ระบบสำเร็จ
      return res.json({
        message: "Login Success",
        user: admins,
        role: "admin"
      });
    } else {
      return res.status(401).json({ message: "Invalid password for admin" });
    }
  } catch (err) {
    console.error("❌ เกิดข้อผิดพลาดระหว่างการล็อกอิน:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});
// ✅ เพิ่ม personnel ใหม่
app.post("/medical-personnel", async (req, res) => {
  try {
    const { username, password, name, nickname, position, expertise, affiliation, email } = req.body;

    // ตรวจสอบว่ามีข้อมูลครบหรือไม่
    if (!username || !password || !name || !position || !expertise || !affiliation || !email) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // เพิ่มข้อมูลลงใน Supabase
    const { data, error } = await supabase
      .from("medicalpersonnel")
      .insert([
        {
          username,
          password,
          name,
          nickname,
          position,
          expertise,
          affiliation,
          email, // เพิ่มฟิลด์อีเมล
        },
      ]);

    console.log("Data:", data);
    console.log("Error:", error);

    if (error) {
      return res.status(500).json({ message: "Error adding personnel", error: error.message });
    }

    // ส่งข้อมูลกลับให้ frontend
    return res.status(201).json({ message: "Personnel added successfully", data });
  } catch (err) {
    console.error("❌ Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ✅ เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});