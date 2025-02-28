require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
const axios = require("axios");
const cron = require('node-cron');
const jwt = require("jsonwebtoken");
const app = express();
const PORT = process.env.PORT || 3001;
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const userInputStatus = {};  


if (!process.env.SUPABASE_KEY || !process.env.LINE_ACCESS_TOKEN || !process.env.JWT_SECRET) {
  console.error("❌ Missing required environment variables!");
  process.exit(1);
}
// เชื่อมต่อกับ Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;

app.use(helmet());
const winston = require("winston");
// ตั้งค่า winston logger
const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logfile.log" }),
  ],
});
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// 🌍 CORS Configuration (จำกัด origin)
const corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(",") || "*",
  methods: "GET,POST",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));
app.use(express.json());

// ป้องกัน SQL Injection และตรวจสอบข้อมูลก่อนใช้งาน
const sanitizeInput = (input) => {
  if (typeof input !== "string") return "";
  return input.replace(/[^\w\s@.-]/gi, ""); // ลบอักขระที่อันตราย
};




//ทดสอบเซิร์ฟเวอร์
app.get("/", (req, res) => {
  res.json({ message: "Server is online" });
});

//ดึงข้อมูลโปรไฟล์
app.get("/getProfile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    // ตรวจสอบ JWT Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.username) return res.status(403).json({ message: "Invalid token" });

    // sanitize input
    const username = sanitizeInput(req.query.username);
    
    // ตรวจสอบและดึงข้อมูลจาก Supabase
    const { data, error } = await supabase
      .from("medicalpersonnel")
      .select("*")
      .eq("username", username)  // ใช้ username ที่ sanitize แล้ว
      .single();

    if (error) return res.status(500).json({ message: "Error fetching profile" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



// Login สำหรับ Admin และ Medical Personnel
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ message: "Missing username or password." });

  try {
    const cleanUsername = sanitizeInput(username);
    const tables = ["admins", "medicalpersonnel"];

    for (const table of tables) {
      let { data: user, error } = await supabase.from(table).select("*").eq("username", cleanUsername).single();
      if (!error && user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          // สร้าง JWT Token
          const token = jwt.sign({ username: user.username, role: table }, process.env.JWT_SECRET, { expiresIn: "2h" });

          // ตั้งค่า cookie เป็น HTTP-only
          res.cookie("token", token, { 
            httpOnly: true,       // ป้องกันการเข้าถึงจาก JavaScript
            secure: process.env.NODE_ENV === 'production', // ใช้ HTTPS ใน production
            maxAge: 2 * 60 * 60 * 1000 // ใช้เวลา 2 ชั่วโมง
          });

          return res.json({ message: "Login Success", user: { username: user.username, role: table } });
        } else {
          return res.status(401).json({ message: "Invalid password" });
        }
      }
    }
    return res.status(404).json({ message: "User not found" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});



// ✅ เพิ่ม personnel ใหม่
app.post("/medical-personnel", async (req, res) => {
  try {
    const { username, password, name, position, expertise, affiliation, email } = req.body;
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

  

      if (error) return res.status(500).json({ message: "Error adding personnel", error: error.message });

      return res.status(201).json({ message: "Personnel added successfully", data });
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ✅ ฟังก์ชันช่วยส่งข้อความไปยัง LINE
async function sendLineMessage(replyToken, messageText) {
  try {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken: replyToken,
        messages: [{ type: "text", text: messageText }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
        },
      }
    );
  } catch (error) {
    console.error("Error sending message to LINE:", error);
    throw new Error("Unable to send message to LINE");
  }
}

async function insertPatientData(lineUserId, data) {
  try {
    const { data: insertedData, error } = await supabase
      .from("patient")
      .insert([{ lineid: lineUserId, ...data }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error inserting patient data:", error.message);
    return false;
  }
}

// ✅ ดึงข้อมูลผู้ใช้จาก LINE Webhook
app.post("/webhook", async (req, res) => {
  // ตรวจสอบความปลอดภัย: ตรวจสอบว่า header 'x-line-signature' มีหรือไม่
  const signature = req.headers["x-line-signature"];
  if (!signature) return res.status(403).send("Forbidden");

  try {
    // รับข้อมูล events จาก body ของ request
    const events = req.body.events;
    if (!events || events.length === 0) return res.status(400).send("No events received");

  

    for (const event of events) {
      const lineUserId = event.source.userId;

      // ✅ ตรวจสอบว่าเป็นข้อความประเภท 'text' หรือไม่
      if (!event.message || event.message.type !== "text") {
       
        return res.status(200).send("OK");
      }

      const messageText = event.message.text.trim();

      // ✅ ถ้าผู้ใช้พิมพ์ "สวัสดี" ให้เริ่มต้นการกรอกข้อมูลใหม่
      if (messageText === "สวัสดี") {
        userInputStatus[lineUserId] = { step: "name", data: {} };
        await sendLineMessage(event.replyToken, "กรุณากรอกชื่อของคุณ");
        return res.status(200).send("OK");
      }

      // ✅ ตรวจสอบสถานะการกรอกข้อมูลของผู้ใช้
      if (userInputStatus[lineUserId]) {
        const currentStep = userInputStatus[lineUserId].step;
        const userData = userInputStatus[lineUserId].data;

        if (currentStep === "name") {
          userData.name = messageText;
          userInputStatus[lineUserId].step = "email";
          await sendLineMessage(event.replyToken, "กรุณากรอกอีเมลของคุณ");
        } else if (currentStep === "email") {
          // ✅ ตรวจสอบว่าอีเมลที่กรอกถูกต้องหรือไม่
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(messageText)) {
            await sendLineMessage(event.replyToken, "กรุณากรอกอีเมลให้ถูกต้อง");
            return res.status(200).send("OK");
          }
          userData.email = messageText;
          userInputStatus[lineUserId].step = "phone";
          await sendLineMessage(event.replyToken, "กรุณากรอกเบอร์โทรศัพท์ของคุณ");
        } else if (currentStep === "phone") {
          // ✅ ตรวจสอบว่าเป็นตัวเลขหรือไม่สำหรับเบอร์โทรศัพท์
          if (isNaN(messageText)) {
            await sendLineMessage(event.replyToken, "กรุณากรอกเฉพาะตัวเลขสำหรับเบอร์โทรศัพท์");
            return res.status(200).send("OK");
          }
          userData.tel = messageText;
          userInputStatus[lineUserId].step = "address";
          await sendLineMessage(event.replyToken, "กรุณากรอกที่อยู่ของคุณ");
        } else if (currentStep === "address") {
          userData.address = messageText;
          userInputStatus[lineUserId].step = "sickness";
          await sendLineMessage(event.replyToken, "กรุณากรอกโรคที่คุณเป็นอยู่");
        } else if (currentStep === "sickness") {
          userData.sickness = messageText;
          userInputStatus[lineUserId].step = "age";
          await sendLineMessage(event.replyToken, "กรุณากรอกอายุของคุณ");
        } else if (currentStep === "age") {
          // ✅ ตรวจสอบว่าอายุที่กรอกเป็นตัวเลขหรือไม่
          if (isNaN(messageText)) {
            await sendLineMessage(event.replyToken, "กรุณากรอกอายุเป็นตัวเลข");
            return res.status(200).send("OK");
          }
          userData.age = messageText;
          userInputStatus[lineUserId].step = "allergic";
          await sendLineMessage(event.replyToken, "กรุณากรอกข้อมูลอาการแพ้ (ถ้ามี)");
        } else if (currentStep === "allergic") {
          userData.allergic = messageText;
          
          // ✅ ตรวจสอบว่าผู้ใช้กรอกข้อมูลครบถ้วนหรือไม่
          if (
            !userData.name ||
            !userData.email ||
            !userData.tel ||
            !userData.address ||
            !userData.sickness ||
            !userData.age ||
            !userData.allergic
          ) {
            await sendLineMessage(event.replyToken, "ข้อมูลไม่ครบ กรุณาเริ่มใหม่โดยพิมพ์ 'สวัสดี'");
            return res.status(200).send("OK");
          }

          // ✅ บันทึกข้อมูลลงในฐานข้อมูล
          if (await insertPatientData(lineUserId, userData)) {
            await sendLineMessage(event.replyToken, "ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว");
            delete userInputStatus[lineUserId]; // 🔹 ลบสถานะการกรอกข้อมูลจากหน่วยความจำ
          } else {
            await sendLineMessage(event.replyToken, "เกิดข้อผิดพลาด กรุณาลองใหม่");
          }
        }
      } else {
        // 🔹 หากข้อความที่ผู้ใช้ส่งไม่เกี่ยวข้อง ให้แนะนำให้พิมพ์ "สวัสดี" เพื่อเริ่มต้นใหม่
        await sendLineMessage(event.replyToken, "พิมพ์ 'สวัสดี' เพื่อเริ่มกรอกข้อมูลใหม่ครับ");
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    // หากเกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ จะตอบกลับด้วยสถานะ 500
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ฟังก์ชันส่งข้อความไปยัง LINE OA
async function sendScheduledMessage() {
  try {
    const messageText = "🔔 แจ้งเตือนอัตโนมัติ: นี่คือข้อความแจ้งเตือนทุกๆ 1 นาที!";
    
    // ดึงข้อมูล lineid ของผู้ใช้จากฐานข้อมูล
    const { data: users, error } = await supabase.from("patient").select("lineid");
    
    if (error) {
      console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log("❌ ไม่มีผู้ใช้ในฐานข้อมูล");
      return;
    }

    // ใช้ Set เพื่อกรอง lineid ที่ซ้ำกัน
    const uniqueLineIds = new Set(users.map(user => user.lineid));

    // ส่งข้อความแจ้งเตือนไปยังผู้ใช้แต่ละคน (ไม่ซ้ำ)
    for (const lineid of uniqueLineIds) {
      try {
        await axios.post(
          "https://api.line.me/v2/bot/message/push",
          {
            to: lineid,
            messages: [{ type: "text", text: messageText }],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
            },
          }
        );
        console.log(`✅ ส่งข้อความไปยัง: ${lineid}`);
      } catch (err) {
        console.error(`❌ ไม่สามารถส่งข้อความไปยัง ${lineid}:`, err.message);
      }
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการส่งข้อความ:", error.message);
  }
}

// ตั้งเวลาให้ส่งข้อความทุกๆ 1 นาที
cron.schedule("* * * * *", async () => {
  console.log("⏳ กำลังส่งข้อความแจ้งเตือนอัตโนมัติ...");
  await sendScheduledMessage();
});



// ✅ เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

