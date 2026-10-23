
const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

// Register a student
router.post("/", async (req, res) => {
  try {
    const { name, rollNumber, className, rfidUid } = req.body;

    if (
      !name?.trim() ||
      !rollNumber?.trim() ||
      !className?.trim()
    ) {
      return res.status(400).json({
        message: "Name, roll number and class are required",
      });
    }

    const student = await Student.create({
      name,
      rollNumber,
      className,
      ...(rfidUid?.trim() && {
        rfidUid: rfidUid.trim().toUpperCase(),
      }),
    });

    res.status(201).json({
      message: "Student registered successfully",
      student,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Roll number or RFID UID already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(error);
    res.status(500).json({
      message: "Failed to register student",
    });
  }
});

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    res.json({
      count: students.length,
      students,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch students",
    });
  }
});

module.exports = router;
