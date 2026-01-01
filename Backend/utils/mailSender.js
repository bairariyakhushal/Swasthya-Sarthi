const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email, title, body) => {
    try {
        // Brevo SMTP Configuration (more reliable than Gmail)
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST, // smtp-relay.brevo.com
            port: 587,
            secure: false, // Use TLS
            auth: {
                user: process.env.MAIL_USER, // Your Brevo login email
                pass: process.env.MAIL_PASS  // Your Brevo SMTP key
            },
            // Optimized timeout settings for Brevo
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 5000,    // 5 seconds
            socketTimeout: 10000,     // 10 seconds
            // Pool configuration for better performance
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 1000,  // 1 second between messages
            rateLimit: 5      // max 5 messages per rateDelta
        });

        // Verify transporter configuration
        await transporter.verify();
        console.log("📧 SMTP connection verified successfully");

        let info = await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME || 'Swasthya Sarthi'}" <${process.env.MAIL_FROM_EMAIL || process.env.MAIL_USER}>`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        });

        console.log("✅ Email sent successfully to:", email);
        console.log("📬 Message ID:", info.messageId);
        return info;

    } catch (err) {
        console.error("❌ Failed to send email to:", email);
        console.error("🔍 Error details:", err.message);
        
        // Better error handling
        if (err.code === 'ECONNECTION') {
            throw new Error("Unable to connect to email server. Please check your network connection.");
        } else if (err.code === 'EAUTH') {
            throw new Error("Email authentication failed. Please check your SMTP credentials.");
        } else if (err.responseCode === 550) {
            throw new Error("Email address not verified or invalid.");
        } else {
            throw new Error("Email delivery failed. Please try again later.");
        }
    }
}

module.exports = mailSender;