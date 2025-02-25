require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
const axios = require("axios");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 3001;

const bcrypt = require('bcrypt');
const saltRounds = 10;

// เชื่อมต่อกับ Supabase
const supabaseUrl = "https://wxsaarugacjbneliilek.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;

app.use(cors());
app.use(express.json());

const userInputStatus = {};

// ✅ ทดสอบเชื่อมต่อ Supabaseึ
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

    if (error)
      return res.status(500).json({ message: "Error fetching profile" });

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
    return res
      .status(400)
      .json({ message: "Please provide both username and password." });
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
        return res
          .status(401)
          .json({ message: "Invalid password for medical personnel" });
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
    const {
      username,
      password,
      name,
      nickname,
      position,
      expertise,
      affiliation,
      email,
    } = req.body;
    console.log("📩 Request body:", req.body);

    // ตรวจสอบว่ามีข้อมูลครบหรือไม่
    if (
      !username ||
      !password ||
      !name ||
      !position ||
      !expertise ||
      !affiliation ||
      !email
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
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
      return res
        .status(500)
        .json({ message: "Error adding personnel", error: error.message });
    }

    return res.status(201).json({ message: "Personnel added successfully", data });
  } catch (err) {
    console.error("❌ Server Error:", err);
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
    console.error("❌ Error sending message:", error);
  }
}

async function insertPatientData(lineUserId, data) {
  try {
    const { error } = await supabase.from("patient").insert([{ lineid: lineUserId, ...data }]);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error inserting patient data:", error);
    return false;
  }
}

// ✅ ดึงข้อมูลผู้ใช้จาก LINE Webhook
app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  if (!events || events.length === 0) {
    return res.status(400).send("No events received");
  }

  console.log("Received events:", JSON.stringify(events, null, 2));

  for (const event of events) {
    const lineUserId = event.source.userId;

    // ✅ เช็คว่าเป็นข้อความหรือไม่
    if (!event.message || event.message.type !== "text") {
      console.log("🚨 Received a non-text message, ignoring.");
      return res.status(200).send("OK");
    }

    const messageText = event.message.text.trim();

    // ✅ ถ้าผู้ใช้พิมพ์ "สวัสดี" ให้เริ่มต้นการกรอกข้อมูลใหม่
    if (messageText === "สวัสดี") {
      userInputStatus[lineUserId] = { step: "name", data: {} };
      await sendLineMessage(event.replyToken, "กรุณากรอกชื่อของคุณ");
      return res.status(200).send("OK");
    }

    // ✅ ตรวจสอบว่าผู้ใช้มีสถานะการกรอกข้อมูลอยู่หรือไม่
    if (userInputStatus[lineUserId]) {
      const currentStep = userInputStatus[lineUserId].step;
      const userData = userInputStatus[lineUserId].data;

      if (currentStep === "name") {
        userData.name = messageText;
        userInputStatus[lineUserId].step = "email";
        await sendLineMessage(event.replyToken, "กรุณากรอกอีเมลของคุณ");
      } else if (currentStep === "email") {
        // ✅ เช็คว่าเป็นรูปแบบอีเมลหรือไม่
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(messageText)) {
          await sendLineMessage(event.replyToken, "กรุณากรอกอีเมลให้ถูกต้อง");
          return res.status(200).send("OK");
        }
        userData.email = messageText;
        userInputStatus[lineUserId].step = "phone";
        await sendLineMessage(event.replyToken, "กรุณากรอกเบอร์โทรศัพท์ของคุณ");
      } else if (currentStep === "phone") {
        // ✅ เช็คว่าเป็นตัวเลขหรือไม่
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
        // ✅ เช็คว่าเป็นตัวเลขหรือไม่
        if (isNaN(messageText)) {
          await sendLineMessage(event.replyToken, "กรุณากรอกอายุเป็นตัวเลข");
          return res.status(200).send("OK");
        }
        userData.age = messageText;
        userInputStatus[lineUserId].step = "allergic";
        await sendLineMessage(event.replyToken, "กรุณากรอกข้อมูลอาการแพ้ (ถ้ามี)");
      } else if (currentStep === "allergic") {
        userData.allergic = messageText;
        
        // ✅ ตรวจสอบว่าข้อมูลครบก่อนบันทึก
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
          delete userInputStatus[lineUserId]; // 🔹 ลบสถานะออกจากหน่วยความจำ
        } else {
          await sendLineMessage(event.replyToken, "เกิดข้อผิดพลาด กรุณาลองใหม่");
        }
      }
    } else {
      // 🔹 กรณีที่ผู้ใช้ส่งข้อความที่ไม่เกี่ยวข้อง
      await sendLineMessage(event.replyToken, "พิมพ์ 'สวัสดี' เพื่อเริ่มกรอกข้อมูลใหม่ครับ");
    }
  }

  res.status(200).send("OK");
});





// ✅ เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

