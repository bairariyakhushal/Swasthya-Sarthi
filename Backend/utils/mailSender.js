const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email, title, body) => {
    console.log("📧 MailSender called for:", email, "| Subject:", title);
    try {
        console.log("📧 Creating email transporter...");
        
        // Use SendGrid for production (Render), Gmail for development
        const isProduction = process.env.NODE_ENV === 'production' || process.env.USE_SENDGRID === 'true';
        
        let transporter;
        if (isProduction && process.env.SENDGRID_API_KEY) {
            // SendGrid configuration (works on Render)
            console.log("📧 Using SendGrid transporter...");
            transporter = nodemailer.createTransport({
                host: 'smtp.sendgrid.net',
                port: 587,
                secure: false,
                auth: {
                    user: 'apikey',
                    pass: process.env.SENDGRID_API_KEY
                }
            });
        } else {
            // Gmail configuration (for local development)
            console.log("📧 Using Gmail transporter...");
            transporter = nodemailer.createTransport({
                host: process.env.MAIL_HOST || 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
        }
        console.log("📧 Transporter created, attempting to send...");

        // Send email with timeout
        const sendEmailWithTimeout = Promise.race([
            transporter.sendMail({
                from: process.env.MAIL_USER || 'noreply@swasthyasarthi.com',
                to: `${email}`,
                subject: `${title}`,
                html: `${body}`
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Email timeout after 20s')), 20000)
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