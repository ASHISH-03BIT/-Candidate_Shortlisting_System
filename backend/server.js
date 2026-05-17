require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const candidateRoutes = require("./routes/candidates");
const matchRoutes = require("./routes/match");
const aiRoutes = require("./routes/ai");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/shortlist_db";

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/candidates", candidateRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/ai", aiRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });

mongoose.connection.on("error", (error) => {
  console.error("MongoDB runtime error:", error.message);
});

module.exports = app;
