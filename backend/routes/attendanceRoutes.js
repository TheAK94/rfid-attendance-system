
const express = require("express");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

const router = express.Router();

// Simulate an RFID card scan
router.post("/scan", async (req, res) => {
  try {
    const { rfidUid } = req.body;

    if (typeof rfidUid !== "string" || !rfidUid.trim()) {
      return res.status(400).json({
        message: "RFID UID is required",
      });
    }

    const uid = rfidUid.trim().toUpperCase();

    const student = await Student.findOne({
      rfidUid: uid,
      isActive: true,
    });

    if (!student) {
      return res.status(404).json({
        message: "Unregistered or inactive RFID card",
      });
    }

    // Use the configured local timezone for the attendance date.
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: process.env.TIME_ZONE || "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    try {
      const attendance = await Attendance.create({
        student: student._id,
        date,
      });

      return res.status(201).json({
        message: "Attendance marked successfully",
        result: "marked",
        student: {
          name: student.name,
          rollNumber: student.rollNumber,
        },
        attendance,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "Attendance already marked for today",
          result: "duplicate",
          student: {
            name: student.name,
            rollNumber: student.rollNumber,
          },
        });
      }

      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to record attendance",
    });
  }
});

// Get attendance records
router.get("/", async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("student", "name rollNumber className")
      .sort({ scannedAt: -1 });

    res.json({
      count: records.length,
      attendance: records,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch attendance",
    });
  }
});

module.exports = router;
