const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email, title, body) => {
    console.log("📧 MailSender called for:", email, "| Subject:", title);
    try {
        console.log("📧 Creating email transporter...");
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 5000, // 5 second timeout
            greetingTimeout: 5000
        });
        console.log("📧 Transporter created, attempting to send...");

        // Set timeout for email sending
        const sendEmailWithTimeout = Promise.race([
            transporter.sendMail({
                from: 'Swasthy Sarthi',
                to: `${email}`,
                subject: `${title}`,
                html: `${body}`
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Email timeout')), 10000)
            )
        ]);

        let info = await sendEmailWithTimeout;

        console.log("✅ Email sent successfully to:", email);
        console.log("✅ Message ID:", info.messageId);
        return info;

    } catch (err) {
        console.error("❌ Failed to send email to:", email);
        console.error("❌ Error details:", err.message);
        console.error("❌ Full error:", err);
        // Don't throw error, just log it
        return null;
    }
}

module.exports = mailSender;