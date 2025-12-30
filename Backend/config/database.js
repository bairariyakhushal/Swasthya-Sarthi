const mongoose = require('mongoose');
require('dotenv').config();

exports.connect = () => {
    mongoose.connect(process.env.DB_URL)
    .then(() => {
      console.log("✅ Database connected successfully");
      console.log("📊 MongoDB connection established");
    })
    .catch((err) => {
        console.error("❌ Database connection failed");
        console.error("🔍 Error details:", err.message);
        process.exit(1); // Exit process if database connection fails
    });
};
