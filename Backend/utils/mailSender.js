const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email, title, body) => {
    try {
        // Brevo SMTP Configuration
        // Using port 2525 - specifically for cloud platforms like Render
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST, // smtp-relay.brevo.com
            port: 2525,
            secure: false, // STARTTLS on port 2525
            auth: {
                user: process.env.MAIL_USER, // Your Brevo login email
                pass: process.env.MAIL_PASS  // Your Brevo SMTP key
            },
            // Very high timeout settings for production
            connectionTimeout: 60000, // 60 seconds
            greetingTimeout: 30000,   // 30 seconds
            socketTimeout: 60000,     // 60 seconds
            // Disable pooling for more reliability
            pool: false,
            // Additional settings for production stability
            logger: false,
            debug: false,
            // Important: Force new connection
            maxConnections: 1,
            tls: {
                rejectUnauthorized: false // Accept self-signed certificates
            }
        });

        // Skip verification - it causes timeout in some hosting environments
        // await transporter.verify();
        console.log("📧 Sending email via Brevo SMTP...");

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
        console.error("🔍 Error code:", err.code);
        
        // Better error handling
        if (err.code === 'ECONNECTION' || err.code === 'ETIMEDOUT') {
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