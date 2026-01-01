const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false,
            requireTLS: true,
            logger: true,
            debug: true,
            // Add timeout configurations
            connectionTimeout: 60000, // 60 seconds to establish connection
            greetingTimeout: 30000,   // 30 seconds to wait for greeting
            socketTimeout: 60000,     // 60 seconds of inactivity
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },
            // Add pool configuration for better performance
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
        });

        let info = await transporter.sendMail({
            from: 'Swasthy Sarthi',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        });

        console.log("✅ Email sent successfully to:", email);
        console.log("Message ID:", info.messageId);
        return info;

    } catch (err) {
        console.error("Failed to send email to:", email);
        console.error("Error details:", err.message);
        // Throw a user-friendly error
        throw new Error("Email delivery failed. Please try again later.");
    }
}

module.exports = mailSender;