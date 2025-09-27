const express = require("express");
const app = express();

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

// Setting up port number
const PORT = process.env.PORT || 5000;

// Loading environment variables from .env file
dotenv.config();

// Connecting to database
database.connect();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: "*",
		credentials: true,
	})
);
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: "/tmp/",
	})
);

// Connecting to cloudinary
cloudinaryConnect();

// Import routes
const authRoutes = require("./routes/auth");
const pharmacyRoutes = require("./routes/pharmacy");
const orderRoutes = require("./routes/order");
const adminRoutes = require("./routes/admin");
const volunteerRoutes = require("./routes/volunteer");
const vendorAnalyticsRoutes = require("./routes/vendorAnalytics");
const aiRoutes = require("./routes/ai");

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/pharmacy", pharmacyRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/volunteer", volunteerRoutes);
app.use("/api/v1/vendor", vendorAnalyticsRoutes);
app.use("/api/v1/ai", aiRoutes);

// Testing the server
app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: "Your server is up and running ...",
	});
});

// Listening to the server
app.listen(PORT, () => {
	console.log(`App is listening at ${PORT}`);
});