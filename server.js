require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();


app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI,{
  dbName: "verifier"
});
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};


const startServer = async () => {
  await connectDB();

  
  app.use("/api/admin", require("./routes/adminAuth.routes"));
  app.use("/api/user", require("./routes/user"));
  app.use("/api/users", require("./api/users/login.js"));
  app.use("/api/users", require("./api/users/register.js"));
  app.use("/api/institutions", require("./api/institutions/getApprovedInstitutions"));
  app.use("/api/posts", require("./api/posts/getVerifierPosts"));
  app.use("/api/posts/verifier", require("./api/posts/verifier"));
  app.use("/api/institution", require("./routes/institutionRoutes"));

 
  app.get("/", (req, res) => {
    res.send("Server is working!");
  });

  const PORT = 5000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};


startServer();