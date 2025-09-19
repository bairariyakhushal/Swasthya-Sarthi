const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");

const User = require("../models/user");
const Vendor = require("../models/vendor");
const Volunteer = require("../models/volunteer");
const Admin = require("../models/admin");
const OTP = require("../models/otp");
const mailSender = require("../utils/mailSender");

require("dotenv").config();

// Send OTP For Email Verification
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user is already present
        const checkUserPresent = await User.findOne({ email });

        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: `User is Already Registered`,
            });
        }

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });


        console.log("OTP Generated: ", otp);

        // Store OTP in database
        await OTP.create({ email, otp });

        // Send OTP via email
        const otpBody = `Your OTP for registration is: ${otp}`;
        await mailSender(email, "OTP for Registration", otpBody);

        res.status(200).json({
            success: true,
            message: `OTP Sent Successfully`,
            otp: otp
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Signup Controller for Registering Users
exports.signup = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
            // Vendor specific fields
            GSTIN,
            licenseNumber,
            // Volunteer specific fields
            drivingLicense,
            age,
            vehicle,
            vehicleNumber,
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !otp) {
            return res.status(403).send({
                success: false,
                message: "All Fields are required",
            });
        }

        // Verify OTP
        const validOTP = await OTP.findOne({ email, otp }).sort({ createdAt: -1 });
        if (!validOTP) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP",
            });
        }

        // Check if password and confirm password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match. Please try again.",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
        });

        // Create role-specific documents
        if (accountType === "Vendor") {
            if (!GSTIN || !licenseNumber) {
                return res.status(400).json({
                    success: false,
                    message: "GSTIN and License Number are required for Vendor registration",
                });
            }
            await Vendor.create({
                user: user._id,
                GSTIN,
                licenseNumber,
            });
        } else if (accountType === "Volunteer") {
            if (!drivingLicense || !age || !vehicle || !vehicleNumber || age < 18) {
                return res.status(400).json({
                    success: false,
                    message: "All volunteer details required and age must be 18+",
                });
            }
            await Volunteer.create({
                user: user._id,
                drivingLicense,
                age,
                vehicle,
                vehicleNumber,
            });
        } else if (accountType === "Admin") {
            await Admin.create({
                user: user._id,
            });
        }

        return res.status(200).json({
            success: true,
            user,
            message: "User registered successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Login controller for authenticating users
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: `Please Fill up All the Required Fields`,
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: `User is not Registered with Us Please SignUp to Continue`,
            });
        }

        // Generate JWT token and Compare Password
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { email: user.email, id: user._id, accountType: user.accountType },
                process.env.JWT_SECRET,
                {
                    expiresIn: "24h",
                }
            );

            // Save token to user document in database
            user.token = token;
            user.password = undefined;
            
            // Set cookie for token and return success response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: `User Login Success`,
            });
        } else {
            return res.status(401).json({
                success: false,
                message: `Password is incorrect`,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: `Login Failure Please Try Again`,
        });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const userDetails = await User.findById(req.user.id);
        const { oldPassword, newPassword } = req.body;

        const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "The password is incorrect" 
            });
        }

        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.user.id, { password: encryptedPassword }, { new: true });

        // Send notification email
        try {
            const emailResponse = await mailSender(
                userDetails.email,
                "Password Changed",
                `Password updated successfully for ${userDetails.firstName} ${userDetails.lastName}`
            );
            console.log("Email sent successfully:", emailResponse.response);
        } catch (error) {
            console.error("Error occurred while sending email:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Password updated successfully" 
        });
    } catch (error) {
        console.error("Error occurred while updating password:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        });
    }
};