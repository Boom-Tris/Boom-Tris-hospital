require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const winston = require("winston");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const dayjs = require("dayjs");
const isBetween = require("dayjs/plugin/isBetween");
dayjs.extend(isBetween);
const moment = require("moment");

const app = express();
const PORT = process.env.PORT || 3001;
const saltRounds = 10;
const userInputStatus = {};

if (
  !process.env.SUPABASE_KEY ||
  !process.env.LINE_ACCESS_TOKEN ||
  !process.env.JWT_SECRET
) {
  console.error("❌ Missing required environment variables!");
  process.exit(1);
}
// เชื่อมต่อกับ Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

app.use(helmet());
app.set("trust proxy", 1); // เปิดใช้งาน trust proxy



// ใช้ middleware สำหรับ parsing JSON และ URL-encoded data
app.use(express.json()); // ใช้สำหรับ parsing JSON body
app.use(express.urlencoded({ extended: true })); // ใช้สำหรับ parsing x-www-form-urlencoded body

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
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true,
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
    if (!decoded.username)
      return res.status(403).json({ message: "Invalid token" });

    // sanitize input
    const username = sanitizeInput(req.query.username);

    // ตรวจสอบและดึงข้อมูลจาก Supabase
    const { data, error } = await supabase
      .from("medicalpersonnel")
      .select("*")
      .eq("username", username) // ใช้ username ที่ sanitize แล้ว
      .single();

    if (error)
      return res.status(500).json({ message: "Error fetching profile" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login สำหรับ Admin และ Medical Personnel
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Missing username or password." });

  try {
    const cleanUsername = sanitizeInput(username);
    const tables = ["admins", "medicalpersonnel"];

    for (const table of tables) {
      let { data: user, error } = await supabase
        .from(table)
        .select("*")
        .eq("username", cleanUsername)
        .single();
      if (!error && user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          // สร้าง JWT Token
          const token = jwt.sign(
            { username: user.username, role: table },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
          );

          // ตั้งค่า cookie เป็น HTTP-only
          res.cookie("token", token, {
            httpOnly: true, // ป้องกันการเข้าถึงจาก JavaScript
            secure: process.env.NODE_ENV === "production", // ใช้ HTTPS ใน production
            maxAge: 2 * 60 * 60 * 1000, // ใช้เวลา 2 ชั่วโมง
          });

          return res.json({
            message: "Login Success",
            user: { username: user.username, role: table },
          });
        } else {
          return res.status(401).json({ message: "Invalid password" });
        }
      }
    }
    return res.status(404).json({ message: "User not found" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

// ✅ เพิ่ม personnel ใหม่
app.post("/medical-personnel", async (req, res) => {
  try {
    const {
      username,
      password,
      name,
      position,
      expertise,
      affiliation,
      email,
    } = req.body;
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
    const { data, error } = await supabase.from("medicalpersonnel").insert([
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

    if (error)
      return res
        .status(500)
        .json({ message: "Error adding personnel", error: error.message });

    return res
      .status(201)
      .json({ message: "Personnel added successfully", data });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
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

const handleUserMessage = async (event, messageText) => {
  const lineUserId = event.source.userId;

  if (messageText === "สวัสดี") {
    userInputStatus[lineUserId] = { step: "name", data: {} };
    await sendLineMessage(event.replyToken, "กรุณากรอกชื่อของคุณ");
    return;
  }

  if (userInputStatus[lineUserId]) {
    const currentStep = userInputStatus[lineUserId].step;
    const userData = userInputStatus[lineUserId].data;

    switch (currentStep) {
      case "name":
        userData.name = messageText;
        userInputStatus[lineUserId].step = "email";
        await sendLineMessage(event.replyToken, "กรุณากรอกอีเมลของคุณ");
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(messageText)) {
          await sendLineMessage(event.replyToken, "กรุณากรอกอีเมลให้ถูกต้อง");
          return;
        }
        userData.email = messageText;
        userInputStatus[lineUserId].step = "phone";
        await sendLineMessage(event.replyToken, "กรุณากรอกเบอร์โทรศัพท์ของคุณ");
        break;
      case "phone":
        if (isNaN(messageText)) {
          await sendLineMessage(
            event.replyToken,
            "กรุณากรอกเฉพาะตัวเลขสำหรับเบอร์โทรศัพท์"
          );
          return;
        }
        userData.tel = messageText;
        userInputStatus[lineUserId].step = "address";
        await sendLineMessage(event.replyToken, "กรุณากรอกที่อยู่ของคุณ");
        break;
      case "address":
        userData.address = messageText;
        userInputStatus[lineUserId].step = "sickness";
        await sendLineMessage(event.replyToken, "กรุณากรอกโรคที่คุณเป็นอยู่");
        break;
      case "sickness":
        userData.sickness = messageText;
        userInputStatus[lineUserId].step = "age";
        await sendLineMessage(event.replyToken, "กรุณากรอกอายุของคุณ");
        break;
      case "age":
        if (isNaN(messageText)) {
          await sendLineMessage(event.replyToken, "กรุณากรอกอายุเป็นตัวเลข");
          return;
        }
        userData.age = messageText;
        userInputStatus[lineUserId].step = "allergic";
        await sendLineMessage(
          event.replyToken,
          "กรุณากรอกข้อมูลอาการแพ้ (ถ้ามี)"
        );
        break;
      case "allergic":
        userData.allergic = messageText;
        if (Object.values(userData).some((field) => !field)) {
          await sendLineMessage(
            event.replyToken,
            "ข้อมูลไม่ครบ กรุณาเริ่มใหม่โดยพิมพ์ 'สวัสดี'"
          );
          return;
        }

        if (await insertPatientData(lineUserId, userData)) {
          await sendLineMessage(
            event.replyToken,
            "ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว"
          );
          delete userInputStatus[lineUserId];
        } else {
          await sendLineMessage(
            event.replyToken,
            "เกิดข้อผิดพลาด กรุณาลองใหม่"
          );
        }
        break;
      default:
        await sendLineMessage(
          event.replyToken,
          "พิมพ์ 'สวัสดี' เพื่อเริ่มกรอกข้อมูลใหม่ครับ"
        );
    }
  } else {
    await sendLineMessage(
      event.replyToken,
      "พิมพ์ 'สวัสดี' เพื่อเริ่มกรอกข้อมูลใหม่ครับ"
    );
  }
};

const verifySignature = (req) => {
  const signature = req.headers["x-line-signature"];
  if (!signature) throw new Error("Forbidden");
};

// ✅ ดึงข้อมูลผู้ใช้จาก LINE Webhook
app.post("/webhook", async (req, res) => {
  try {
    console.log("📩 Received Webhook:", JSON.stringify(req.body, null, 2));

    // ✅ ตรวจสอบความปลอดภัย
    verifySignature(req);

    // ✅ รับข้อมูล events จาก body
    const events = req.body.events;
    if (!events || events.length === 0) {
      console.log("⚠️ No events received");
      return res.status(400).send("No events received");
    }

    for (const event of events) {
      console.log("🔍 Processing event:", event);
      const messageText = event.message?.text?.trim();

      if (messageText && event.message.type === "text") {
        await handleUserMessage(event, messageText);
      } else {
        console.log("✅ Non-text message received");
        return res.status(200).send("OK");
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Server error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

// API สำหรับค้นหาผู้ป่วย
app.get("/search-patient", async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).send("Name parameter is required");
  }

  try {
    const { data, error } = await supabase
      .from("patient")
      .select("*")
      .ilike("name", `%${name}%`); // ค้นหาชื่อผู้ป่วยแบบไม่คำนึงถึงตัวพิมพ์ใหญ่

    if (error) {
      return res.status(500).send(error.message);
    }

    res.status(200).json(data); // ส่งข้อมูลผู้ป่วยที่ค้นหา
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API สำหรับตั้งค่าการนัดหมาย
app.post("/set-appointment", async (req, res) => {
  try {
    const { patient_id, appointment_date, reminder_time } = req.body;

    // พิมพ์ค่าที่ได้รับจาก body เพื่อตรวจสอบ
    console.log("Request Body:", req.body);

    if (!patient_id) {
      return res
        .status(400)
        .json({ success: false, message: "Patient ID is required" });
    }

    const updateFields = {};
    if (appointment_date) updateFields.appointment_date = appointment_date;
    if (reminder_time) updateFields.reminder_time = reminder_time;

    // หากไม่มีข้อมูลที่จะอัปเดต
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "At least one of appointment_date or reminder_time must be provided",
      });
    }

    // อัปเดตข้อมูลในฐานข้อมูล
    const { data, error } = await supabase
      .from("patient")
      .update(updateFields)
      .eq("patient_id", patient_id)
      .select();

    // หากมีข้อผิดพลาดจาก Supabase
    if (error) {
      console.error("Supabase Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Database error", error });
    }

    // หากไม่พบข้อมูลที่อัปเดต
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found or no changes made",
      });
    }

    return res.json({
      success: true,
      message: "Appointment updated successfully",
      data,
    });
  } catch (err) {
    // แสดงข้อความ error เพื่อช่วยในการดีบั๊ก
    console.error("Server Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

app.get("/all-patients", async (req, res) => {
  try {
    // ดึงข้อมูลผู้ป่วยทั้งหมดจากตาราง patient
    const { data, error } = await supabase.from("patient").select("*");

    if (error) {
      return res.status(500).send(error.message);
    }

    // ส่งข้อมูลผู้ป่วยทั้งหมดกลับไป
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API สำหรับอัปเดตข้อมูลผู้ป่วย
app.put("/update-patient", async (req, res) => {
  try {
    // รับข้อมูลที่ต้องการอัปเดตจากคำขอ
    const { lineUserId, name, email, tel, address, sickness, age, allergic } =
      req.body;

    if (!lineUserId) {
      return res.status(400).json({ message: "Missing lineUserId" });
    }

    // ตรวจสอบว่ามีข้อมูลที่จะอัปเดตหรือไม่
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (tel) updates.tel = tel;
    if (address) updates.address = address;
    if (sickness) updates.sickness = sickness;
    if (age) updates.age = age;
    if (allergic) updates.allergic = allergic;

    // อัปเดตข้อมูลใน Supabase
    const { data, error } = await supabase
      .from("patient")
      .update(updates)
      .eq("lineid", lineUserId); // ใช้ lineUserId เป็นตัวระบุผู้ป่วย

    if (error) {
      return res
        .status(500)
        .json({ message: "Error updating patient data", error: error.message });
    }

    return res
      .status(200)
      .json({ message: "Patient data updated successfully", data });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

app.post("/add-patient", async (req, res) => {
  try {
    const {
      name,
      age,
      lineid,
      allergic,
      sickness,
      address,
      tel,
      email,
      appointment_date,
    } = req.body;

    const { data, error } = await supabase
      .from("patient")
      .insert([
        {
          name,
          age,
          lineid,
          allergic,
          sickness,
          address,
          tel,
          email,
          appointment_date,
        },
      ])
      .select();

    if (error) {
      return res
        .status(500)
        .json({ message: "Error adding patient", error: error.message });
    }

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// API สำหรับลบผู้ป่วย
app.delete("/delete-patient/:id", async (req, res) => {
  const { id } = req.params;
  try {
      const { error } = await supabase
          .from("patient")
          .delete()
          .eq("patient_id", id);

      if (error) {
          return res.status(500).json({ message: "Error deleting patient", error: error.message });
      }

      res.status(200).json({ message: "Patient deleted successfully" });
  } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
  }
});
app.delete("/delete-patients", async (req, res) => {
  try {
      const { patientIds } = req.body;
      if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
          return res.status(400).json({ message: "Invalid patient IDs" });
      }

      const { error } = await supabase
          .from("patient")
          .delete()
          .in("patient_id", patientIds);

      if (error) {
          return res.status(500).json({ message: "Error deleting patients", error: error.message });
      }

      res.status(200).json({ message: "Patients deleted successfully" });
  } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
  }
});



const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload-file", upload.array("files"), async (req, res) => {
  try {
    const { patient_id } = req.body; // รับเฉพาะ patient_id
    const files = req.files; // รับไฟล์ที่อัปโหลด

    // ตรวจสอบว่า patient_id มีค่าหรือไม่
    if (!patient_id) {
      return res.status(400).json({ success: false, message: "Missing patient_id" });
    }

    // ตรวจสอบว่าไฟล์ถูกส่งมาหรือไม่
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    console.log(`patient_id: ${patient_id}`);

    // ตรวจสอบว่า patient_id มีอยู่ในฐานข้อมูลหรือไม่
    const { data: patient, error: patientError } = await supabase
      .from("patient")
      .select("id")
      .eq("id", patient_id)
      .single();

    if (patientError || !patient) {
      return res.status(400).json({ success: false, message: "Invalid patient_id" });
    }

    // อัปโหลดไฟล์ (ถ้าต้องการ)
    for (const file of files) {
      const filePath = `bucket888/${file.originalname}`;
      const { data, error } = await supabase.storage
        .from("bucket888")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        // บันทึกข้อผิดพลาดลงในตาราง upload_logs
        await supabase.from("upload_logs").insert([{
          file_name: file.originalname,
          file_path: filePath,
          status: "failed",
          error_message: error.message,
          patient_id: patient_id,
        }]);

        throw new Error(`Error uploading file ${file.originalname}: ${error.message}`);
      }

      // บันทึกข้อมูลลงในตาราง upload_logs
      await supabase.from("upload_logs").insert([{
        file_name: file.originalname,
        file_path: filePath,
        status: "success",
        patient_id: patient_id,
      }]);
    }

    res.status(200).json({ success: true, message: "Files uploaded and log recorded successfully!" });
  } catch (error) {
    console.error("Error uploading files or recording log:", error);

    // บันทึกข้อผิดพลาดลงในตาราง upload_logs
    if (req.body.patient_id) {
      await supabase.from("upload_logs").insert([{
        patient_id: req.body.patient_id,
        status: "failed",
        error_message: error.message,
      }]);
    }

    res.status(500).json({ success: false, message: "Error uploading files or recording log" });
  }
});
app.delete("/delete/:fileId", async (req, res) => {
  const fileId = req.params.fileId;

  try {
    // ดึงข้อมูลไฟล์จากตาราง patient_files
    const { data: fileData, error: fileError } = await supabase
      .from("patient_files")
      .select("file_path")
      .eq("file_id", fileId)
      .single();

    if (fileError) {
      throw new Error(`Failed to fetch file info: ${fileError.message}`);
    }

    // ลบไฟล์จาก Supabase Storage
    const { data: deleteStorageData, error: deleteStorageError } =
      await supabase.storage.from("bucket888").remove([fileData.file_path]);

    if (deleteStorageError) {
      throw new Error(
        `Failed to delete file from storage: ${deleteStorageError.message}`
      );
    }

    // ลบข้อมูลไฟล์จากตาราง patient_files
    const { data: deleteData, error: deleteError } = await supabase
      .from("patient_files")
      .delete()
      .eq("file_id", fileId);

    if (deleteError) {
      throw new Error(`Failed to delete file info: ${deleteError.message}`);
    }

    res
      .status(200)
      .json({ success: true, message: "File deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

async function sendLineAppointment(userId, message) {
  try {
    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: userId,
        messages: [{ type: "text", text: message }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
        },
      }
    );
    console.log(`✅ ส่งแจ้งเตือนสำเร็จถึง ${userId}`);
  } catch (error) {
    console.error(
      `❌ ส่งแจ้งเตือนล้มเหลวถึง ${userId}:`,
      error.response?.data || error.message
    );
  }
}

async function getPatientData() {
  const { data, error } = await supabase
    .from("patient") // ชื่อตารางใน Supabase
    .select("name, lineid, reminder_time, appointment_date"); // เลือกคอลัมน์ที่ต้องการ

  if (error) {
    console.error("Error fetching patient data:", error);
    return [];
  }

  return data; // คืนค่าข้อมูลผู้ป่วย
}

// ฟังก์ชันการคำนวณและส่งแจ้งเตือน
async function sendNotifications() {
  const today = dayjs().format("YYYY-MM-DD");
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");

  const patients = await getPatientData(); // ดึงข้อมูลผู้ป่วยจาก Supabase

  const patientsToNotify = patients.filter(
    (patient) =>
      patient.lineid &&
      patient.reminder_time &&
      patient.appointment_date &&
      (patient.appointment_date === today ||
        patient.appointment_date === tomorrow)
  );

  console.log("📌 ผู้ป่วยที่ต้องแจ้งเตือน:", patientsToNotify);

  // ส่งแจ้งเตือนตามเวลา
  for (const patient of patientsToNotify) {
    const { lineid, reminder_time, appointment_date } = patient;
    const [hours, minutes, seconds] = reminder_time.split(":");
    const reminderDateTime = dayjs(
      `${appointment_date} ${hours}:${minutes}:${seconds}`
    );

    // คำนวณระยะเวลาที่ต้องรอ (มิลลิวินาที)
    const delay = reminderDateTime.diff(dayjs());

    if (delay > 0) {
      console.log(
        `⏳ กำลังตั้งเวลาส่งแจ้งเตือนให้ ${patient.name} ในเวลา ${reminder_time}`
      );

      setTimeout(async () => {
        const message = `แจ้งเตือน: คุณมีนัดหมายในวันที่ ${appointment_date} เวลา ${reminder_time}`;
        await sendLineAppointment(lineid, message); // ส่งข้อความไปยัง LINE
      }, delay);
    } else {
      console.log(`❌ เวลาที่ตั้งไว้ผ่านไปแล้วสำหรับ ${patient.name}`);
    }
  }
}

// เรียกใช้ฟังก์ชัน
sendNotifications();

// ✅ เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});