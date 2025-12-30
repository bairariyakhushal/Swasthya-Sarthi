const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        let info = await transporter.sendMail({
            from: 'Swasthy Sarthi',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        });

        console.log("Email sent successfully to:", email);
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