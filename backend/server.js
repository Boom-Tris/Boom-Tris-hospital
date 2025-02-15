require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require('bcrypt'); 
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ตั้งค่าการเชื่อมต่อ MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed: " + err.stack);
    return;
  }
  console.log("✅ Connected to MySQL");
});

// ทดสอบเซิร์ฟเวอร์
app.get("/", (req, res) => {
  res.json({ message: "Server is online" });
});

// Login
app.post("/login", async (req, res) => {
  console.log("📩 Login Request:", req.body); // Log ค่าที่รับเข้ามา
  const { username, password } = req.body; // ใช้ username แทน email

  // ตรวจสอบข้อมูลจากตาราง admins
  let sql = "SELECT * FROM admins WHERE LOWER(username) = LOWER(?)";
  db.query(sql, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error", error: err });
    }

    if (results.length > 0) {
      // พบแอดมิน, ตรวจสอบรหัสผ่านโดยไม่ใช้ bcrypt
      if (results[0].password === password) { // เปลี่ยนการตรวจสอบให้ตรงๆ
        return res.json({ message: "Login Success", user: results[0], role: "admin" });
      } else {
        return res.status(401).json({ message: "Invalid password for admin" });
      }
    }

    // หากไม่พบในตาราง admins ตรวจสอบใน MedicalPersonnel
    sql = "SELECT * FROM MedicalPersonnel WHERE LOWER(username) = LOWER(?)";
    db.query(sql, [username], (err, medicalResults) => {
      if (err) {
        return res.status(500).json({ message: "Internal Server Error", error: err });
      }

      if (medicalResults.length > 0) {
        // พบบุคลากรทางการแพทย์, ตรวจสอบรหัสผ่านโดยไม่ใช้ bcrypt
        if (medicalResults[0].password === password) { // เปลี่ยนการตรวจสอบให้ตรงๆ
          return res.json({ message: "Login Success", user: medicalResults[0], role: "medicalPersonnel" });
        } else {
          return res.status(401).json({ message: "Invalid password for medical personnel" });
        }
      }

      // หากไม่พบผู้ใช้ในทั้งสองตาราง
      return res.status(404).json({ message: "User not found" });
    });
  });
});


// 🔹 Webhook รับข้อมูลจาก LINE OA
app.post("/webhook", (req, res) => {
  const events = req.body.events;

  events.forEach((event) => {
    if (event.type === "message" && event.message.type === "text") {
      const text = event.message.text.trim();
      const userId = event.source.userId;
      const [firstname, lastname] = text.split(" "); // แยกชื่อ-นามสกุล

      if (firstname && lastname) {
        // 🔹 ถามอายุและข้อมูลที่จำเป็นอื่น ๆ
        // ตอนนี้สมมุติว่าอายุ และข้อมูลอื่นๆ จะมาในลำดับต่อไป เช่นถาม "อายุ"
        // หากมีการรับข้อมูลเพิ่มเติมจากผู้ใช้สามารถปรับโค้ดนี้ได้

        // 🔹 บันทึกข้อมูลในตาราง patients
        db.query(
          "INSERT INTO patients (name, line_id, status) VALUES (?, ?, ?)",
          [`${firstname} ${lastname}`, userId, "Scheduled"],
          (err, result) => {
            if (err) console.error(err);
          }
        );

        // 🔹 ตอบกลับ LINE
        replyMessage(event.replyToken, `บันทึกชื่อ ${firstname} ${lastname} แล้ว`);
      }
    }
  });

  res.sendStatus(200);
});

//API  สำหรับ MedicalPersonnel ดึงข้อมูลบุคลากรทางการแพทย์ทั้งหมด
app.get("/medical-personnel", async (req, res) => {
  try {
    const [data] = await db.promise().query("SELECT * FROM MedicalPersonnel");
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching MedicalPersonnel:", err);
    res.status(500).json({ error: err.message });
  }
});


// API เพิ่มบุคลากรทางการแพทย์
app.post("/medical-personnel", async (req, res) => {
  try {
    const { username, password, name, nickname, position, expertise, affiliation } = req.body;
    const sql = "INSERT INTO MedicalPersonnel (username, password, name, nickname, position, expertise, affiliation) VALUES (?, ?, ?, ?, ?, ?, ?)";
    await db.promise().query(sql, [username, password, name, nickname, position, expertise, affiliation]);
    res.json({ message: "✅ Medical Personnel added successfully" });
  } catch (err) {
    console.error("❌ Error adding MedicalPersonnel:", err);
    res.status(500).json({ error: err.message });
  }
});

//API ลบบุคลากรทางการแพทย์
app.delete("/medical-personnel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.promise().query("DELETE FROM MedicalPersonnel WHERE MedicalPersonnel_id = ?", [id]);
    res.json({ message: "✅ Medical Personnel deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting MedicalPersonnel:", err);
    res.status(500).json({ error: err.message });
  }
});

// API reginster
app.post("/register", async (req, res) => {
  try {
    const { MedicalPersonnel_id, register_date } = req.body;
    const sql = "INSERT INTO Register (MedicalPersonnel_id, register_date) VALUES (?, ?)";
    await db.promise().query(sql, [MedicalPersonnel_id, register_date]);
    res.json({ message: "✅ Register record added successfully" });
  } catch (err) {
    console.error("❌ Error adding register:", err);
    res.status(500).json({ error: err.message });
  }
});

// ดึงข้อมูลการลงทะเบียนทั้งหมด

app.get("/registers", async (req, res) => {
  try {
    const [data] = await db.promise().query("SELECT * FROM Register");
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching registers:", err);
    res.status(500).json({ error: err.message });
  }
});


// api ดึงข้อมูล ผู้ป่วย
app.get("/patients", async (req, res) => {
  try {
    const [data] = await db.promise().query("SELECT * FROM Patient");
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching patients:", err);
    res.status(500).json({ error: err.message });
  }
});

// api ลบ ผู้ป่วย
app.delete("/patients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.promise().query("DELETE FROM Patient WHERE patient_id = ?", [id]);
    res.json({ message: "✅ Patient deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting patient:", err);
    res.status(500).json({ error: err.message });
  }
});


// api แจ้งเตือน
app.post("/notifications", async (req, res) => {
  try {
    const { MedicalPersonnel_id, patient_id, notification_type, notification_info, countdown_notification, status } = req.body;
    const sql = "INSERT INTO Notification (MedicalPersonnel_id, patient_id, notification_type, notification_info, countdown_notification, status) VALUES (?, ?, ?, ?, ?, ?)";
    await db.promise().query(sql, [MedicalPersonnel_id, patient_id, notification_type, notification_info, countdown_notification, status]);
    res.json({ message: "✅ Notification added successfully" });
  } catch (err) {
    console.error("❌ Error adding notification:", err);
    res.status(500).json({ error: err.message });
  }
})

//api ดึงข้อมูลการแจ้งเตือนทั้งหมด
app.get("/notifications", async (req, res) => {
  try {
    const [data] = await db.promise().query("SELECT * FROM Notification");
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ error: err.message });
  }
});



// ฟังก์ชันส่งข้อความกลับไปที่ LINE
// ฟังก์ชันส่งข้อความกลับไปที่ LINE
function replyMessage(replyToken, text) {
  axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{ type: "text", text }]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  ).catch(err => {
    console.error("❌ LINE Reply Error:", err.response ? err.response.data : err);
  });
}

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
