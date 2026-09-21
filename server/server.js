require("dotenv").config({ path: __dirname + "/.env" });

const dns = require("dns");
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const submissionRoutes = require("./routes/submissions");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "public")));

// app.use("/api/auth", authRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  return res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    api: "online",
    database: databaseReady ? "connected" : "disconnected",
  });
});

app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found." });
});

if (!MONGO_URI) {
  console.error("MONGO_URI is missing. Add it to server/.env.");
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
      console.error("The API is running, but database submissions will fail until MongoDB is available.");
    });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB runtime error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});
