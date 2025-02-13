require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ตั้งค่าการเชื่อมต่อ MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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
app.post("/login", (req, res) => {
  console.log("📩 Login Request:", req.body);  // ✅ Log ค่าที่รับเข้ามา
  const { email, password } = req.body;

  const sql = "SELECT * FROM doctors WHERE LOWER(email) = LOWER(?) AND password = ? ";
  db.query(sql, [email, password], (err, data) => { 
    if (err) {
        console.error("❌ SQL Error:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err });
    }

    console.log("🧐 Query Result:", data);  // ✅ Log ผลลัพธ์ที่ดึงจากฐานข้อมูล

    if (data.length > 0) {
        return res.json({ message: "Login Success", user: data[0] }); 
    } else {
        return res.status(401).json({ message: "No Record Found" }); // ❌ Backend ส่ง 401
    }
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
