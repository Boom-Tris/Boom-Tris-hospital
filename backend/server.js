require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT ; // ใช้ค่าจาก .env ถ้ามี หรือค่าเริ่มต้นคือ 3000

app.use(cors());
app.use(express.json());

// ตั้งค่าการเชื่อมต่อ MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,  
  user: process.env.DB_USER ,
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
app.get('/', (req, res) => {
    res.json({ message: "Server is online" }); // ส่งข้อความที่ต้องการ
  });
  


// API ดึงข้อมูล users


// เริ่มต้นเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
