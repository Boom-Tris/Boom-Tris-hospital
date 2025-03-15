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
const dayjs = require("dayjs");

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
app.use(express.urlencoded({ extended: true }));

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

app.get("/all-patients-count", async (req, res) => {
  try {
    // นับจำนวนผู้ป่วยทั้งหมด
    const { count: totalPatients, error: patientError } = await supabase
      .from("patient")
      .select("*", { count: "exact", head: true });
     
      const { count: totalDoctors, error: doctorError } = await supabase
      .from("medicalpersonnel")
      .select("medicalpersonnel_id", { count: "exact", head: true });

      const { count: totalAppointments, error: appointmentError } = await supabase
      .from("patient")
      .select("appointment_date", { count: "exact", head: true })
      .not("appointment_date", "is", null);  // กรองแถวที่ appointment_date ไม่เป็น NULL

    // ตรวจสอบข้อผิดพลาด
    if (patientError) {
      return res.status(500).send(patientError.message); // ใช้ patientError แทน error
    }
    if (doctorError) {
      return res.status(500).send(doctorError.message);
    }
    if (appointmentError) {
      return res.status(500).send(appointmentError.message); // ใช้ appointmentError แทน error
    }
   
    res.status(200).json({ totalPatients: totalPatients,
      totalDoctors: totalDoctors,  totalAppointments: totalAppointments,
     });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// API สำหรับอัปเดตข้อมูลผู้ป่วย
app.put("/update-patient", async (req, res) => {
  try {
    // เพิ่ม console.log เพื่อดูข้อมูลที่ได้รับ
    console.log("ข้อมูลที่ได้รับจาก frontend:", req.body);
    
    const { 
      lineUserId, 
      name, 
      email, 
      tel, 
      address, 
      sickness, 
      age, 
      allergic, 
      appointment_date  // เพิ่มตัวนี้
    } = req.body;

    if (!lineUserId) {
      return res.status(400).json({ message: "Missing lineUserId" });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (tel) updates.tel = tel;
    if (address) updates.address = address;
    if (sickness) updates.sickness = sickness;
    if (age) updates.age = age;
    if (allergic) updates.allergic = allergic;
    // เพิ่มเงื่อนไขเพื่อเช็คว่า appointment_date มีค่าหรือไม่
    if (appointment_date !== undefined) updates.appointment_date = appointment_date;
    
    console.log("ข้อมูลที่จะอัปเดท:", updates);

    // อัปเดตข้อมูลใน Supabase
    const { data, error } = await supabase
      .from("patient")
      .update(updates)
      .eq("lineid", lineUserId);

    if (error) {
      console.error("Supabase error:", error);
      return res
        .status(500)
        .json({ message: "Error updating patient data", error: error.message });
    }

    return res
      .status(200)
      .json({ message: "Patient data updated successfully", data });
  } catch (err) {
    console.error("Server error:", err);
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
  // Use :id to capture the patient ID
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("patient")
      .delete()
      .eq("patient_id", id);

    if (error) {
      return res
        .status(500)
        .json({ message: "Error deleting patient", error: error.message });
    }

    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

// Use cors once

app.post("/upload-file", upload.array("files"), async (req, res) => {
  try {
    const files = req.files;
    const { patient_id } = req.body; // รับค่าจาก FormData
    console.log("Received patient_id:", req.body.patient_id); // ✅ Log ตรวจสอบค่าที่รับมา
    console.log("Received patient_id:", patient_id); // ✅ Log ตรวจสอบค่าที่รับมา

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const uploadLogs = [];

    for (const file of files) {
      const filePath = `bucket888/${Date.now()}_${file.originalname}`;

      const { data, error } = await supabase.storage
        .from("bucket888")
        .upload(filePath, file.buffer, { contentType: file.mimetype });

      if (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        uploadLogs.push({
          file_name: file.originalname,
          file_path: null,
          uploaded_at: new Date().toISOString(),
          status: "failed",
          error_message: error.message,
          patient_id: patient_id || null,
        });
        continue;
      }

      console.log(`File uploaded successfully:`, data);

      // ✅ บันทึก `patient_id` ลง `upload_logs` // step2
      const { error: dbError } = await supabase.from("upload_logs").insert([
        {
          file_name: file.originalname,
          file_path: filePath,
          uploaded_at: new Date().toISOString(),
          status: "success",
          error_message: null,
          patient_id: patient_id ? parseInt(patient_id) : null, // **แปลงให้เป็น int**
        },
      ]);

      if (dbError) {
        console.error(
          `Error logging upload for ${file.originalname}:`,
          dbError
        );
      }

      uploadLogs.push({
        file_name: file.originalname,
        file_path: filePath,
        uploaded_at: new Date().toISOString(),
        status: dbError ? "failed" : "success",
        error_message: dbError ? dbError.message : null,
        patient_id: patient_id || null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Files uploaded successfully!",
      logs: uploadLogs,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ success: false, message: "Error uploading files" });
  }
});

// API เพื่อดึงข้อมูลไฟล์จากตาราง upload_logs โดยใช้ patient_id
app.get("/api/files/:patientId", async (req, res) => {
  const patientId = req.params.patientId;

  const { data, error } = await supabase
    .from("upload_logs")
    .select("*")
    .eq("patient_id", patientId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.delete("/api/files/:fileId", async (req, res) => {
  const fileId = req.params.fileId;

  try {
    // ดึง file_path จาก upload_logs
    const { data: fileData, error: fileError } = await supabase
      .from("upload_logs")
      .select("file_path")
      .eq("id", fileId)
      .single();

    if (fileError || !fileData) {
      console.error("Error fetching file data:", fileError);
      return res.status(404).json({ error: "File not found" });
    }

    console.log("🔥 Final file path to delete:", fileData.file_path);

    // ลบไฟล์จาก Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("bucket888")
      .remove([fileData.file_path]);

    if (storageError) {
      console.error("Error deleting file from storage:", storageError);
      return res.status(500).json({
        error: "Failed to delete file from storage",
        details: storageError.message,
      });
    }

    // ลบ record ออกจาก upload_logs
    const { error: dbError } = await supabase
      .from("upload_logs")
      .delete()
      .eq("id", fileId);

    if (dbError) {
      console.error("Error deleting file record from upload_logs:", dbError);
      return res.status(500).json({
        error: "Failed to delete file record from upload_logs",
        details: dbError.message,
      });
    }

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({
      error: "An unexpected error occurred",
      details: error.message || "No additional error details available",
    });
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
    const {
      patient_id,
      appointment_senddate, // เพิ่มคอลัมน์นี้
      appointment_date,
      reminder_time,
      appointment_details,
      notification_date,
      notification_time,
      notification_details,
    } = req.body;

    console.log("Request Body:", req.body);

    if (!patient_id) {
      return res
        .status(400)
        .json({ success: false, message: "Patient ID is required" });
    }

    const updateFields = {};
    if (appointment_senddate)
      updateFields.appointment_senddate = appointment_senddate;
    if (appointment_date) updateFields.appointment_date = appointment_date;
    if (reminder_time) updateFields.reminder_time = reminder_time;
    if (appointment_details)
      updateFields.appointment_details = appointment_details;
    if (notification_date) updateFields.notification_date = notification_date;
    if (notification_time) updateFields.notification_time = notification_time;
    if (notification_details)
      updateFields.notification_details = notification_details;

    // หากไม่มีข้อมูลที่จะอัปเดต
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field must be provided",
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
    console.error("Server Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

async function sendLineAppointment(
  userId,
  message,
  fileUrls = [], // รับเป็นอาร์เรย์ของไฟล์
  fileTypes = [] // รับเป็นอาร์เรย์ของประเภทไฟล์
) {
  try {
    const messages = [{ type: "text", text: message }];

    // เพิ่มไฟล์ทั้งหมดเข้าไปใน messages
    fileUrls.forEach((fileUrl, index) => {
      const fileType = fileTypes[index];
      if (["jpg", "jpeg", "png"].includes(fileType)) {
        // ส่งไฟล์ภาพ
        messages.push({
          type: "image",
          originalContentUrl: fileUrl,
          previewImageUrl: fileUrl,
        });
      } else {
        // ส่งเป็นลิงก์สำหรับไฟล์เอกสาร
        messages.push({
          type: "text",
          text: `📎 ไฟล์แนบ: [กดที่นี่เพื่อเปิด](${fileUrl})`,
        });
      }
    });

    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      { to: userId, messages },
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

// ดึงข้อมูลนัดหมายของผู้ป่วยจาก Supabase
async function getPatientAppointment() {
  const { data, error } = await supabase
    .from("patient")
    .select(
      "patient_id, name, lineid, appointment_senddate, appointment_date, reminder_time, appointment_details"
    );

  if (error) {
    console.error("Error fetching patient data:", error);
    return [];
  }
  return data;
}

// ส่งการแจ้งเตือนวันที่กำหนดให้ผู้ป่วย
async function sendNotificationsSendDate() {
  const today = dayjs().format("YYYY-MM-DD");

  const patients = await getPatientAppointment();

  const patientsToNotify = patients.filter(
    (patient) =>
      patient.lineid &&
      patient.reminder_time &&
      patient.appointment_senddate &&
      patient.appointment_date &&
      patient.appointment_details &&
      patient.appointment_senddate === today
  );

  console.log("📌 ผู้ป่วยที่ต้องแจ้งเตือนวันนี้:", patientsToNotify);

  for (const patient of patientsToNotify) {
    const {
      patient_id,
      lineid,
      reminder_time,
      appointment_senddate,
      appointment_date,
      appointment_details,
    } = patient;

    const [hours, minutes, seconds] = reminder_time.split(":");
    const reminderDateTime = dayjs(
      `${appointment_senddate} ${hours}:${minutes}:${seconds}`
    );
    const delay = reminderDateTime.diff(dayjs());

    // ดึงไฟล์ทั้งหมดที่เกี่ยวข้องจาก upload_logs
    const { data: uploadData } = await supabase
      .from("upload_logs")
      .select("file_path, file_name")
      .eq("patient_id", patient_id)
      .order("uploaded_at", { ascending: false });

    console.log("🖼 ไฟล์ที่พบสำหรับ", patient.name, uploadData);

    let fileUrls = [];
    let fileTypes = [];

    if (uploadData?.length) {
      for (const file of uploadData) {
        let filePath = file.file_path;

        // ตรวจสอบว่า filePath มีรูปแบบถูกต้อง
        if (!filePath.startsWith("bucket888/")) {
          filePath = `bucket888/${filePath}`; // เพิ่ม bucket888/ หากไม่มี
        }

        // ดึง URL ของไฟล์จาก Supabase Storage
        const { data: publicUrlData } = supabase.storage
          .from("bucket888")
          .getPublicUrl(filePath);

        if (publicUrlData) {
          const fileUrl = publicUrlData.publicUrl; // กำหนด URL ของไฟล์
          const fileType = filePath.split(".").pop().toLowerCase(); // ดึงชนิดของไฟล์

          // ตรวจสอบว่าไฟล์สามารถเข้าถึงได้
          try {
            const response = await fetch(fileUrl, { method: "HEAD" });
            if (response.ok) {
              console.log("✅ ไฟล์สามารถเข้าถึงได้:", fileUrl);
              fileUrls.push(fileUrl);
              fileTypes.push(fileType);
            } else {
              console.log("❌ ไฟล์ไม่สามารถเข้าถึงได้:", fileUrl);
            }
          } catch (error) {
            console.error("❌ เกิดข้อผิดพลาดในการตรวจสอบไฟล์:", error.message);
          }
        } else {
          console.log(`❌ ไม่พบ publicURL สำหรับไฟล์: ${filePath}`);
        }
      }
    } else {
      console.log(`❌ ไม่พบไฟล์สำหรับ ${patient.name}`);
    }

    if (delay > 0) {
      console.log(
        `⏳ ตั้งเวลาส่งแจ้งเตือนให้ ${patient.name} ในเวลา ${reminder_time}`
      );

      setTimeout(async () => {
        const message = `แจ้งเตือน: คุณ ${patient.name} มีนัดหมายในวันที่ ${appointment_date}\nรายละเอียด:\n${appointment_details}`;
        await sendLineAppointment(lineid, message, fileUrls, fileTypes);
      }, delay);
    } else {
      console.log(`❌ เวลาที่ตั้งไว้ผ่านไปแล้วสำหรับ ${patient.name}`);
    }
  }
}

// ส่งการแจ้งเตือนนัดหมายให้ผู้ป่วย
async function sendNotificationsAppointment() {
  const today = dayjs().format("YYYY-MM-DD");
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");

  const patients = await getPatientAppointment();

  const patientsToNotify = patients.filter(
    (patient) =>
      patient.lineid &&
      patient.reminder_time &&
      patient.appointment_date &&
      patient.appointment_details &&
      (patient.appointment_date === today ||
        patient.appointment_date === tomorrow)
  );

  console.log("📌 ผู้ป่วยที่ต้องแจ้งเตือนวันนัด:", patientsToNotify);

  for (const patient of patientsToNotify) {
    const {
      patient_id,
      lineid,
      reminder_time,
      appointment_date,
      appointment_details,
    } = patient;

    const [hours, minutes, seconds] = reminder_time.split(":");
    const reminderDateTime = dayjs(
      `${appointment_date} ${hours}:${minutes}:${seconds}`
    );
    const delay = reminderDateTime.diff(dayjs());

    // ดึงไฟล์ทั้งหมดที่เกี่ยวข้องจาก upload_logs
    const { data: uploadData } = await supabase
      .from("upload_logs")
      .select("file_path, file_name")
      .eq("patient_id", patient_id)
      .order("uploaded_at", { ascending: false });

    console.log("🖼 ไฟล์ที่พบสำหรับ", patient.name, uploadData);

    let fileUrls = [];
    let fileTypes = [];

    if (uploadData?.length) {
      for (const file of uploadData) {
        let filePath = file.file_path;

        // ตรวจสอบว่า filePath มีรูปแบบถูกต้อง
        if (!filePath.startsWith("bucket888/")) {
          filePath = `bucket888/${filePath}`; // เพิ่ม bucket888/ หากไม่มี
        }

        // ดึง URL ของไฟล์จาก Supabase Storage
        const { data: publicUrlData } = supabase.storage
          .from("bucket888")
          .getPublicUrl(filePath);

        if (publicUrlData) {
          const fileUrl = publicUrlData.publicUrl; // กำหนด URL ของไฟล์
          const fileType = filePath.split(".").pop().toLowerCase(); // ดึงชนิดของไฟล์

          // ตรวจสอบว่าไฟล์สามารถเข้าถึงได้
          try {
            const response = await fetch(fileUrl, { method: "HEAD" });
            if (response.ok) {
              console.log("✅ ไฟล์สามารถเข้าถึงได้:", fileUrl);
              fileUrls.push(fileUrl);
              fileTypes.push(fileType);
            } else {
              console.log("❌ ไฟล์ไม่สามารถเข้าถึงได้:", fileUrl);
            }
          } catch (error) {
            console.error("❌ เกิดข้อผิดพลาดในการตรวจสอบไฟล์:", error.message);
          }
        } else {
          console.log(`❌ ไม่พบ publicURL สำหรับไฟล์: ${filePath}`);
        }
      }
    } else {
      console.log(`❌ ไม่พบไฟล์สำหรับ ${patient.name}`);
    }

    if (delay > 0) {
      console.log(
        `⏳ ตั้งเวลาส่งแจ้งเตือนให้ ${patient.name} ในเวลา ${reminder_time}`
      );

      setTimeout(async () => {
        const message = `แจ้งเตือน: คุณ ${patient.name} มีนัดหมายในวันที่ ${appointment_date}\nรายละเอียด:\n${appointment_details}`;
        await sendLineAppointment(lineid, message, fileUrls, fileTypes);
      }, delay);
    } else {
      console.log(`❌ เวลาที่ตั้งไว้ผ่านไปแล้วสำหรับ ${patient.name}`);
    }

    // เพิ่มโค้ดสำหรับการแจ้งเตือน 1 วันก่อนนัดหมาย
    if (appointment_date === tomorrow) {
      const reminderOneDayBefore = dayjs(`${appointment_date}`)
        .subtract(1, "day")
        .set("hour", hours)
        .set("minute", minutes)
        .set("second", seconds);

      const delayBeforeAppointment = reminderOneDayBefore.diff(dayjs());

      if (delayBeforeAppointment > 0) {
        console.log(
          `⏳ กำลังตั้งเวลาส่งแจ้งเตือน 1 วันก่อนนัดให้ ${patient.name} ในเวลา ${reminder_time}`
        );

        setTimeout(async () => {
          const message = `แจ้งเตือน: คุณ ${patient.name} มีนัดหมายในวันที่ ${appointment_date} วันพรุ่งนี้\nรายละเอียด:\n${appointment_details}`;
          await sendLineAppointment(lineid, message, fileUrls, fileTypes);
        }, delayBeforeAppointment);
      } else {
        console.log(
          `❌ เวลาที่ตั้งไว้สำหรับแจ้งเตือน 1 วันก่อนนัดผ่านไปแล้วสำหรับ ${patient.name}`
        );
      }
    }
  }
}

async function getPatientScheduled() {
  const { data, error } = await supabase
    .from("patient") // ชื่อตารางใน Supabase
    .select(
      "name, lineid, notification_date, notification_time, notification_details"
    ); // เลือกคอลัมน์ที่ต้องการ

  if (error) {
    console.error("Error fetching patient data:", error);
    return [];
  }
  return data; // คืนค่าข้อมูลผู้ป่วย
}

async function sendScheduledNotifications() {
  const today = dayjs().format("YYYY-MM-DD"); // วันที่ปัจจุบัน

  const patients = await getPatientScheduled(); // ดึงข้อมูลผู้ป่วยจาก Supabase

  const patientsToNotify = patients.filter(
    (patient) =>
      patient.lineid &&
      patient.notification_time &&
      patient.notification_date &&
      patient.notification_details &&
      dayjs(today).isBefore(dayjs(patient.notification_date).add(1, "day")) // ถ้าวันที่ปัจจุบันยังไม่เลย notification_date
  );

  console.log(
    "📌 ผู้ป่วยที่ต้องแจ้งเตือนตาม notification_date:",
    patientsToNotify
  );

  // ส่งแจ้งเตือนตามเวลา
  for (const patient of patientsToNotify) {
    const {
      lineid,
      notification_time,
      notification_date,
      notification_details,
    } = patient;
    const [hours, minutes, seconds] = notification_time.split(":");

    // คำนวณเวลาเริ่มต้นของการแจ้งเตือนในวันนี้ (ถ้าวันนี้ยังไม่ถึงเวลา)
    let reminderDateTime = dayjs(`${today} ${hours}:${minutes}:${seconds}`);

    // ถ้าผ่านเวลาของวันนี้แล้ว ให้ตั้งเวลาแจ้งเตือนในวันถัดไป
    if (reminderDateTime.isBefore(dayjs())) {
      reminderDateTime = reminderDateTime.add(1, "day");
    }

    // คำนวณระยะเวลาที่ต้องรอ (มิลลิวินาที)
    const delay = reminderDateTime.diff(dayjs());

    console.log(
      `⏳ กำลังตั้งเวลาส่งแจ้งเตือนให้ ${patient.name} ในเวลา ${notification_time}`
    );

    // ตั้งเวลาแจ้งเตือนทุกวัน
    setInterval(async () => {
      const message = `แจ้งเตือนตามระยะเวลาถึงคุณ ${patient.name}\nรายละเอียด:\n${notification_details}`;
      await sendLineAppointment(lineid, message); // ส่งข้อความไปยัง LINE
    }, 24 * 60 * 60 * 1000); // ตั้งเวลาให้ทำงานทุก 24 ชั่วโมง

    // เริ่มตั้งเวลาแจ้งเตือนครั้งแรก
    setTimeout(async () => {
      const message = `แจ้งเตือนตามระยะเวลาถึงคุณ ${patient.name}\nรายละเอียด:\n${notification_details}`;
      await sendLineAppointment(lineid, message); // ส่งข้อความไปยัง LINE
    }, delay);
  }
}

// ✅ เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  sendNotificationsSendDate();
  sendNotificationsAppointment();
  sendScheduledNotifications();
});
