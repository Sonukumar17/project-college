const express = require("express");
const bcrypt = require("bcryptjs");
const AcademyRegistration = require("../models/AcademyRegistration");
const ScoutingRequest = require("../models/ScoutingRequest");

const router = express.Router();

function firstValidationMessage(error) {
  return Object.values(error.errors)[0]?.message || "Invalid form data.";
}

router.post("/academy", async (req, res) => {
  try {
    console.log("Received academy registration:", req.body);
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and mobile number are required.",
      });
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and contain letters and numbers.",
      });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must contain exactly 10 digits.",
      });
    }

    const registration = await AcademyRegistration.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      mobile,
    });

    return res.status(201).json({
      success: true,
      message: "Registration saved. Welcome to the academy trial list!",
      registration: {
        id: registration._id,
        name: registration.name,
        email: registration.email,
        mobile: registration.mobile,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: firstValidationMessage(error) });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "That email is already registered for academy trials.",
      });
    }
    console.error("Academy registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not save the academy registration.",
    });
  }
});

router.post("/scouting", async (req, res) => {
  try {
    const { name, opponentClub, notes = "" } = req.body;
    console.log("Received scouting request:", req.body);
    if (!name || !opponentClub) {
      return res.status(400).json({
        success: false,
        message: "Your name and opponent club are required.",
      });
    }

    const request = await ScoutingRequest.create({ name, opponentClub, notes });
    return res.status(201).json({
      success: true,
      message: "Request sent to the scouting team.",
      request: {
        id: request._id,
        name: request.name,
        opponentClub: request.opponentClub,
        notes: request.notes,
        status: request.status,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: firstValidationMessage(error) });
    }
    console.error("Scouting request error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not save the scouting request.",
    });
  }
});

module.exports = router;
