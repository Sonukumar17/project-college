const crypto = require("crypto");
const express = require("express");
const AcademyRegistration = require("../models/AcademyRegistration");
const ScoutingRequest = require("../models/ScoutingRequest");

const router = express.Router();
const sessions = new Map();
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

function credentialsMatch(expected, actual) {
  if (!expected || !actual) return false;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return expectedBuffer.length === actualBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function requireAdmin(req, res, next) {
  const token = req.get("Authorization")?.replace(/^Bearer\s+/i, "");
  const expiresAt = token ? sessions.get(token) : undefined;

  if (!expiresAt || expiresAt <= Date.now()) {
    if (token) sessions.delete(token);
    return res.status(401).json({ success: false, message: "Admin authentication required." });
  }

  return next();
}

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Admin login attempt:", { username, password: password ? "****" : undefined });
  
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    console.error("ADMIN_USERNAME and ADMIN_PASSWORD must be configured in server/.env.");
    return res.status(503).json({ success: false, message: "Admin login is not configured." });
  }

  if (!credentialsMatch(process.env.ADMIN_USERNAME, username)
    || !credentialsMatch(process.env.ADMIN_PASSWORD, password)) {
    return res.status(401).json({ success: false, message: "Invalid admin credentials." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_DURATION_MS);
  return res.json({
    success: true,
    message: "Admin login successful.",
    token,
    expiresIn: SESSION_DURATION_MS,
  });
});

router.post("/logout", requireAdmin, (req, res) => {
  const token = req.get("Authorization")?.replace(/^Bearer\s+/i, "");
  sessions.delete(token);
  return res.json({ success: true, message: "Logged out successfully." });
});

router.get("/data", requireAdmin, async (req, res) => {
  try {
    const [academyRegistrations, scoutingRequests] = await Promise.all([
      AcademyRegistration.find().select("-password").sort({ createdAt: -1 }).lean(),
      ScoutingRequest.find().sort({ createdAt: -1 }).lean(),
    ]);

    return res.json({
      success: true,
      data: {
        academyRegistrations,
        scoutingRequests,
      },
    });
  } catch (error) {
    console.error("Admin data query error:", error);
    return res.status(500).json({ success: false, message: "Could not load admin data." });
  }
});

module.exports = router;
