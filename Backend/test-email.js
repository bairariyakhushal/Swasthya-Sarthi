const mailSender = require('./utils/mailSender');
require('dotenv').config();

console.log("==========================================");
console.log("🧪 Testing Email Functionality");
console.log("==========================================");
console.log("📧 Mail Host:", process.env.MAIL_HOST);
console.log("📧 Mail User:", process.env.MAIL_USER);
console.log("📧 Mail Pass:", process.env.MAIL_PASS ? "✅ SET" : "❌ NOT SET");
console.log("==========================================\n");

async function testEmail() {
    try {
        console.log("🚀 Sending test email...\n");
        
        const result = await mailSender(
            "bairariyakhushal@gmail.com", // Send to yourself for testing
            "Test Email - Swasthya Sarthi",
            "<h1>Test Email</h1><p>If you receive this, email is working! 🎉</p>"
        );
        
        console.log("\n==========================================");
        if (result) {
            console.log("✅ TEST PASSED - Email sent successfully!");
            console.log("📬 Message ID:", result.messageId);
        } else {
            console.log("❌ TEST FAILED - Email sending failed!");
        }
        console.log("==========================================");
        
    } catch (error) {
        console.log("\n==========================================");
        console.error("❌ TEST ERROR:", error.message);
        console.error("❌ Full error:", error);
        console.log("==========================================");
    }
}

testEmail();
