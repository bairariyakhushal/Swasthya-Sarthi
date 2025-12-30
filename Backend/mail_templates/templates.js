// Order Confirmation Email
exports.orderConfirmationEmail = (customerName, order, pharmacy) => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Order Confirmation - Swasthya Sarthi</title>
        <style>
            body {
                background-color: #f8f9fa;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #28a745;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #28a745;
                margin-bottom: 10px;
            }
            .message {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #28a745;
                text-align: center;
            }
            .order-details {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #dee2e6;
            }
            .detail-row:last-child {
                border-bottom: none;
                font-weight: bold;
                font-size: 18px;
                color: #28a745;
            }
            .medicine-list {
                background-color: #ffffff;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
            }
            .medicine-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f1f3f4;
            }
            .medicine-item:last-child {
                border-bottom: none;
            }
            .cta {
                display: inline-block;
                padding: 12px 30px;
                background-color: #28a745;
                color: #ffffff;
                text-decoration: none;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                margin: 20px auto;
                text-align: center;
            }
            .support {
                text-align: center;
                font-size: 14px;
                color: #6c757d;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
            }
            .highlight {
                font-weight: bold;
                color: #28a745;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏥 Swasthya Sarthi</div>
                <p>Your Health, Our Priority</p>
            </div>
            
            <div class="message">Order Confirmed Successfully! ✅</div>
            
            <div class="body">
                <p>Dear <span class="highlight">${customerName}</span>,</p>
                <p>Thank you for choosing Swasthya Sarthi! Your order has been confirmed and is being processed.</p>
                
                <div class="order-details">
                    <h3>📋 Order Details</h3>
                    <div class="detail-row">
                        <span>Order ID:</span>
                        <span class="highlight">#${order._id.toString().slice(-8).toUpperCase()}</span>
                    </div>
                    <div class="detail-row">
                        <span>Pharmacy:</span>
                        <span>${pharmacy.name}</span>
                    </div>
                    <div class="detail-row">
                        <span>Delivery Type:</span>
                        <span>${order.deliveryType === 'delivery' ? '🚚 Home Delivery' : '🏪 Store Pickup'}</span>
                    </div>
                    ${order.deliveryType === 'pickup' ? `
                    <div class="detail-row">
                        <span>Pickup Code:</span>
                        <span class="highlight">${order.pickupCode}</span>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                        <span>Order Date:</span>
                        <span>${new Date(order.orderPlacedAt).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span>Total Amount:</span>
                        <span>₹${order.totalAmount}</span>
                    </div>
                </div>

                <div class="medicine-list">
                    <h3>💊 Medicines Ordered</h3>
                    ${order.medicines.map(med => `
                        <div class="medicine-item">
                            <span>${med.medicineName} x${med.quantity}</span>
                            <span>₹${med.total}</span>
                        </div>
                    `).join('')}
                </div>

                ${order.deliveryType === 'delivery' ? `
                    <p><strong>📍 Delivery Address:</strong> ${order.deliveryAddress}</p>
                    <p><strong>📞 Contact:</strong> ${order.contactNumber}</p>
                    <p>Your order will be delivered within 2-3 hours.</p>
                ` : `
                    <p><strong>🏪 Pickup Location:</strong> ${pharmacy.address}</p>
                    <p><strong>📞 Pharmacy Contact:</strong> ${pharmacy.contactNumber}</p>
                    <p><strong>🔢 Your Pickup Code:</strong> <span class="highlight">${order.pickupCode}</span></p>
                    <p>Please visit the pharmacy with this pickup code when your order is ready.</p>
                `}
                
                <div style="text-align: center;">
                    <a class="cta" href="http://localhost:3000/track/${order._id}">Track Your Order</a>
                </div>
            </div>
            
            <div class="support">
                <p>Need help? Contact us at <a href="mailto:support@swasthyasarthi.com">support@swasthyasarthi.com</a></p>
                <p>Thank you for trusting Swasthya Sarthi with your healthcare needs! 🙏</p>
            </div>
        </div>
    </body>
    </html>`;
};

// Order Status Update Email
exports.orderStatusUpdateEmail = (customerName, order, status, message) => {
    const statusEmojis = {
        'confirmed': '✅',
        'picked_up': '📦',
        'out_for_delivery': '🚚',
        'delivered': '🎉',
        'ready_for_pickup': '🔔',
        'completed': '✅'
    };

    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Order Update - Swasthya Sarthi</title>
        <style>
            body {
                background-color: #f8f9fa;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #17a2b8;
            }
            .logo {
                margin-left: auto;
                margin-right: auto;
                display: block;
                max-width: 200px;
                margin-bottom: 20px;
            }
            .status-badge {
                display: inline-block;
                padding: 10px 20px;
                background-color: #17a2b8;
                color: white;
                border-radius: 25px;
                font-weight: bold;
                margin: 20px 0;
            }
            .order-info {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .cta {
                display: inline-block;
                padding: 12px 30px;
                background-color: #17a2b8;
                color: #ffffff;
                text-decoration: none;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                margin: 20px auto;
                text-align: center;
            }
            .support {
                text-align: center;
                font-size: 14px;
                color: #6c757d;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
            }
            .highlight {
                font-weight: bold;
                color: #17a2b8;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo"><a href="https://EduElevate-edtech-project.vercel.app"><img class="logo" src="https://res.cloudinary.com/dzkaggnlf/image/upload/v1758460938/Gemini_Generated_Image_2f7v82f7v82f7v82_jwo9nf.png"
                    alt="Swasthya Sarthi Logo"></a></div>
                <p>Order Status Update</p>
            </div>
            
            <div class="body">
                <p>Dear <span class="highlight">${customerName}</span>,</p>
                
                <div style="text-align: center;">
                    <div class="status-badge">
                       ${status.toUpperCase().replace('_', ' ')}
                    </div>
                </div>
                
                <p style="text-align: center; font-size: 18px; margin: 20px 0;">
                    ${message}
                </p>
                
                <div class="order-info">
                    <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
                    <p><strong>Current Status:</strong> ${status.replace('_', ' ').toUpperCase()}</p>
                    <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <div style="text-align: center;">
                    <a class="cta" href="http://localhost:3000/track/${order._id}">Track Your Order</a>
                </div>
            </div>
            
            <div class="support">
                <p>Questions? Contact us at <a href="mailto:support@swasthyasarthi.com">support@swasthyasarthi.com</a></p>
            </div>
        </div>
    </body>
    </html>`;
};

// Pickup Ready Notification
exports.pickupReadyEmail = (customerName, order, pharmacy) => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Order Ready for Pickup - Swasthya Sarthi</title>
        <style>
            body {
                background-color: #f8f9fa;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #ffc107;
            }
            .logo {
                margin-left: auto;
                margin-right: auto;
                display: block;
                max-width: 200px;
                margin-bottom: 20px;
            }
            .pickup-code {
                background-color: #ffc107;
                color: #000;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                margin: 20px 0;
                letter-spacing: 3px;
            }
            .pharmacy-info {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .cta {
                display: inline-block;
                padding: 12px 30px;
                background-color: #ffc107;
                color: #000000;
                text-decoration: none;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                margin: 20px auto;
                text-align: center;
            }
            .support {
                text-align: center;
                font-size: 14px;
                color: #6c757d;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
            }
            .highlight {
                font-weight: bold;
                color: #ffc107;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo"><div class="logo"><a href="https://EduElevate-edtech-project.vercel.app"><img class="logo" src="https://res.cloudinary.com/dzkaggnlf/image/upload/v1758460938/Gemini_Generated_Image_2f7v82f7v82f7v82_jwo9nf.png"
                    alt="Swasthya Sarthi Logo"></a></div></div>
                <p>Your Order is Ready! </p>
            </div>
            
            <div class="body">
                <p>Dear <span class="highlight">${customerName}</span>,</p>
                
                <p style="text-align: center; font-size: 18px; margin: 20px 0;">
                    🔔 Your order is ready for pickup! Please visit the pharmacy with your pickup code.
                </p>
                
                <div class="pickup-code">
                    ${order.pickupCode}
                </div>
                
                <div class="pharmacy-info">
                    <h3> Pickup Location</h3>
                    <p><strong>Pharmacy:</strong> ${pharmacy.name}</p>
                    <p><strong>Address:</strong> ${pharmacy.address}</p>
                    <p><strong>Contact:</strong> ${pharmacy.contactNumber}</p>
                    <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
                </div>
                
                <p><strong> Pickup Instructions:</strong></p>
                <ul>
                    <li>Show this pickup code: <strong>${order.pickupCode}</strong></li>
                    <li>Carry a valid ID proof</li>
                    <li>Total amount: <strong>₹${order.totalAmount}</strong></li>
                </ul>
                
                <div style="text-align: center;">
                    <a class="cta" href="http://localhost:3000/track/${order._id}">View Order Details</a>
                </div>
            </div>
            
            <div class="support">
                <p>Need directions? Contact pharmacy at ${pharmacy.contactNumber}</p>
                <p>Support: <a href="mailto:support@swasthyasarthi.com">support@swasthyasarthi.com</a></p>
            </div>
        </div>
    </body>
    </html>`;
};

// Update adminApprovalEmail function:
exports.adminApprovalEmail = (name, type, status, reason = '') => {
    const isApproved = status === 'approved';
    const emoji = isApproved ? '✅' : '❌';
    const color = isApproved ? '#28a745' : '#dc3545';
    const bgColor = isApproved ? '#d4edda' : '#f8d7da';

    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Application ${status.charAt(0).toUpperCase() + status.slice(1)} - Swasthya Sarthi</title>
        <style>
            body {
                background-color: #f8f9fa;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid ${color};
            }
            .logo {
                margin-left: auto;
                margin-right: auto;
                display: block;
                max-width: 200px;
                margin-bottom: 20px;
            }
            .status-badge {
                background-color: ${bgColor};
                color: ${color};
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                font-size: 20px;
                font-weight: bold;
                margin: 20px 0;
                border: 1px solid ${color};
            }
            .reason-box {
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #dc3545;
            }
            .cta {
                display: inline-block;
                padding: 12px 30px;
                background-color: ${color};
                color: #ffffff;
                text-decoration: none;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                margin: 20px auto;
                text-align: center;
            }
            .support {
                text-align: center;
                font-size: 14px;
                color: #6c757d;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
            }
            .highlight {
                font-weight: bold;
                color: ${color};
            }
            .improvement-tips {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #ffc107;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo"><div class="logo"><a href="https://EduElevate-edtech-project.vercel.app"><img class="logo" src="https://res.cloudinary.com/dzkaggnlf/image/upload/v1758460938/Gemini_Generated_Image_2f7v82f7v82f7v82_jwo9nf.png"
                    alt="Swasthya Sarthi Logo"></a></div></div>
                <p>Application Status Update</p>
            </div>
            
            <div class="body">
                <p>Dear <span class="highlight">${name}</span>,</p>
                
                <div class="status-badge">
                    ${emoji} Your ${type} application has been ${status.toUpperCase()}
                </div>
                
                ${isApproved ? `
                    <p> <strong>Congratulations!</strong> Your application to join Swasthya Sarthi as a ${type} has been approved.</p>
                    
                    <p><strong> Next Steps:</strong></p>
                    <ul>
                        <li> You can now login to your ${type} dashboard</li>
                        <li> ${type === 'Pharmacy' ? 'Start adding your medicine inventory' : 'Start accepting delivery requests'}</li>
                        <li> Complete your profile setup</li>
                        <li> ${type === 'Pharmacy' ? 'Upload pharmacy license and certifications' : 'Update your availability and service areas'}</li>
                    </ul>
                    
                    <p><strong> Welcome Benefits:</strong></p>
                    <ul>
                        <li> Access to analytics dashboard</li>
                        <li> ${type === 'Pharmacy' ? 'Competitive commission rates' : 'Flexible earning opportunities'}</li>
                        <li> 24/7 customer support</li>
                        <li> Marketing and promotional support</li>
                    </ul>
                    
                    <div style="text-align: center;">
                        <a class="cta" href="http://localhost:3000/login">Login to Dashboard</a>
                    </div>
                ` : `
                    <p> We regret to inform you that your ${type} application has been <strong>rejected</strong> at this time.</p>
                    
                    ${reason ? `
                        <div class="reason-box">
                            <h4> Rejection Reason:</h4>
                            <p><strong>${reason}</strong></p>
                        </div>
                    ` : ''}
                    
                    <div class="improvement-tips">
                        <h4> How to Improve Your Application:</h4>
                        <ul>
                            <li> Review all required documents and ensure they are clear and valid</li>
                            <li> Verify that contact information is accurate and active</li>
                            <li> ${type === 'Pharmacy' ? 'Ensure pharmacy license is current and properly uploaded' : 'Verify identity documents and vehicle registration'}</li>
                            <li>Check that all form fields are completely filled out</li>
                            <li> ${type === 'Pharmacy' ? 'Ensure pharmacy meets all regulatory requirements' : 'Complete any missing background verification steps'}</li>
                        </ul>
                    </div>
                    
                    <p><strong> Re-application Process:</strong></p>
                    <ul>
                        <li> You can reapply after addressing the above concerns</li>
                        <li> Wait period: 7 days from rejection date</li>
                        <li> Contact support for specific guidance</li>
                        <li> All previous data will be cleared for fresh application</li>
                    </ul>
                    
                    <div style="text-align: center;">
                        <a class="cta" href="mailto:support@swasthyasarthi.com">Contact Support Team</a>
                    </div>
                    
                    <div style="text-align: center; margin-top: 15px;">
                        <a class="cta" href="http://localhost:3000/apply" style="background-color: #28a745;">Reapply Now</a>
                    </div>
                `}
            </div>
            
            <div class="support">
                <p> <strong>Need Help?</strong> Contact us at <a href="mailto:support@swasthyasarthi.com">support@swasthyasarthi.com</a></p>
                <p>Thank you for your interest in Swasthya Sarthi! </p>
            </div>
        </div>
    </body>
    </html>`;
};

// Add OTP verification email template
exports.otpVerificationEmail = (name, otp) => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>OTP Verification - Swasthya Sarthi</title>
        <style>
            body {
                background-color: #f8f9fa;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #007bff;
            }
            .logo {
                margin-left: auto;
                margin-right: auto;
                display: block;
                max-width: 200px;
                margin-bottom: 20px;
            }
            .otp-container {
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                margin: 30px 0;
                box-shadow: 0 4px 15px rgba(0,123,255,0.3);
            }
            .otp-code {
                font-size: 36px;
                font-weight: bold;
                letter-spacing: 8px;
                margin: 20px 0;
                padding: 15px;
                background-color: rgba(255,255,255,0.1);
                border-radius: 8px;
                border: 2px dashed rgba(255,255,255,0.3);
            }
            .warning-box {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-left: 4px solid #ffc107;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .security-tips {
                background-color: #d1ecf1;
                border: 1px solid #bee5eb;
                border-left: 4px solid #17a2b8;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .timer {
                display: inline-block;
                background-color: #dc3545;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
            }
            .support {
                text-align: center;
                font-size: 14px;
                color: #6c757d;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
            }
            .highlight {
                font-weight: bold;
                color: #007bff;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo"><div class="logo"><a href="https://EduElevate-edtech-project.vercel.app"><img class="logo" src="https://res.cloudinary.com/dzkaggnlf/image/upload/v1758460938/Gemini_Generated_Image_2f7v82f7v82f7v82_jwo9nf.png"
                    alt="Swasthya Sarthi Logo"></a></div></div>
                <p>Email Verification Required</p>
            </div>
            
            <div class="body">
                <p>Dear <span class="highlight">${name || 'User'}</span>,</p>
                
                <p>Welcome to <strong>Swasthya Sarthi</strong>! </p>
                <p>To complete your registration, please verify your email address using the OTP below:</p>
                
                <div class="otp-container">
                    <h3> Your Verification Code</h3>
                    <div class="otp-code">${otp}</div>
                    <p>Enter this code to verify your email</p>
                    <div class="timer">⏱ Valid for 10 minutes</div>
                </div>
                
                <div class="warning-box">
                    <h4> Important Security Notice:</h4>
                    <ul>
                        <li>This OTP is valid for <strong>10 minutes only</strong></li>
                        <li>Do not share this code with anyone</li>
                        <li>Our team will never ask for this code over phone/email</li>
                        <li>If you didn't request this, please ignore this email</li>
                    </ul>
                </div>
                
                <div class="security-tips">
                    <h4> Security Tips:</h4>
                    <ul>
                        <li> Always verify the sender's email address</li>
                        <li> Keep your account credentials secure</li>
                        <li> Log out from shared devices</li>
                        <li> Report suspicious activities immediately</li>
                    </ul>
                </div>
                
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>Copy the 6-digit OTP code above</li>
                    <li>Go back to the registration page</li>
                    <li>Enter the OTP in the verification field</li>
                    <li>Complete your profile setup</li>
                </ol>
                
                <p> <strong>What happens after verification?</strong></p>
                <ul>
                    <li> Your account will be activated</li>
                    <li> You can access your dashboard</li>
                    <li> Start using Swasthya Sarthi services</li>
                    <li> Receive important updates and notifications</li>
                </ul>
            </div>
            
            <div class="support">
                <p><strong> Didn't receive the code?</strong></p>
                <p>Check your spam folder or request a new OTP after 2 minutes</p>
                <p> Support: <a href="mailto:support@swasthyasarthi.com">support@swasthyasarthi.com</a></p>
                <p> Help Desk: +91 98765 43210 (24/7 support)</p>
                <p>Thank you for choosing Swasthya Sarthi! </p>
            </div>
        </div>
    </body>
    </html>`;
};

// Add welcome email template for after successful signup
exports.welcomeEmail = (userName, accountType) => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Welcome to Swasthya Sarthi</title>
        <style>
            body {
                background-color: #f8f9fa;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #28a745;
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                border-radius: 8px 8px 0 0;
                margin: -20px -20px 20px -20px;
                padding: 30px 20px 20px 20px;
            }
            .logo {
                margin-left: auto;
                margin-right: auto;
                display: block;
                max-width: 200px;
                margin-bottom: 20px;
            }
            .welcome-badge {
                background-color: #d4edda;
                border: 2px solid #28a745;
                color: #155724;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                font-size: 20px;
                font-weight: bold;
                margin: 20px 0;
            }
            .features-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 20px 0;
            }
            .feature-card {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                border-left: 4px solid #28a745;
            }
            .cta {
                display: inline-block;
                padding: 15px 30px;
                background-color: #28a745;
                color: #ffffff;
                text-decoration: none;
                border-radius: 25px;
                font-size: 18px;
                font-weight: bold;
                margin: 20px auto;
                text-align: center;
            }
            .support {
                text-align: center;
                font-size: 14px;
                color: #6c757d;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
            }
            .highlight {
                font-weight: bold;
                color: #28a745;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo"><div class="logo"><a href="https://EduElevate-edtech-project.vercel.app"><img class="logo" src="https://res.cloudinary.com/dzkaggnlf/image/upload/v1758460938/Gemini_Generated_Image_2f7v82f7v82f7v82_jwo9nf.png"
                    alt="Swasthya Sarthi Logo"></a></div></div>
                <h2>Welcome to Your Health Journey!</h2>
            </div>
            
            <div class="body">
                <div class="welcome-badge">
                     Welcome ${userName}! Your ${accountType} account is ready!
                </div>
                
                <p>Congratulations! You've successfully joined the <strong>Swasthya Sarthi</strong> family. We're excited to have you on board! </p>
                
                <h3> What you can do now:</h3>
                
                ${accountType === 'Customer' ? `
                <div class="features-grid">
                    <div class="feature-card">
                        <h4> Find Medicines</h4>
                        <p>Search nearby pharmacies</p>
                    </div>
                    <div class="feature-card">
                        <h4> Quick Delivery</h4>
                        <p>Get medicines delivered</p>
                    </div>
                    <div class="feature-card">
                        <h4> Store Pickup</h4>
                        <p>Collect from pharmacy</p>
                    </div>
                    <div class="feature-card">
                        <h4> Track Orders</h4>
                        <p>Real-time order tracking</p>
                    </div>
                </div>
                ` : accountType === 'Vendor' ? `
                <div class="features-grid">
                    <div class="feature-card">
                        <h4> Pharmacy Setup</h4>
                        <p>Complete your profile</p>
                    </div>
                    <div class="feature-card">
                        <h4> Add Inventory</h4>
                        <p>Upload medicine catalog</p>
                    </div>
                    <div class="feature-card">
                        <h4> Analytics</h4>
                        <p>Track sales & revenue</p>
                    </div>
                    <div class="feature-card">
                        <h4> Manage Orders</h4>
                        <p>Process customer orders</p>
                    </div>
                </div>
                ` : `
                <div class="features-grid">
                    <div class="feature-card">
                        <h4> Start Delivering</h4>
                        <p>Accept delivery requests</p>
                    </div>
                    <div class="feature-card">
                        <h4> Earn Money</h4>
                        <p>Flexible earning opportunities</p>
                    </div>
                    <div class="feature-card">
                        <h4> Service Area</h4>
                        <p>Set your delivery zones</p>
                    </div>
                    <div class="feature-card">
                        <h4> Track Earnings</h4>
                        <p>Monitor your income</p>
                    </div>
                </div>
                `}
                
                <h3> Getting Started:</h3>
                <ol>
                    <li> <strong>Email verified</strong> - You're all set!</li>
                    <li> Complete your profile for better experience</li>
                    <li> ${accountType === 'Customer' ? 'Start searching for medicines' : accountType === 'Vendor' ? 'Wait for admin approval' : 'Wait for admin approval'}</li>
                    <li> Download our mobile app (coming soon!)</li>
                </ol>
                
                ${accountType !== 'Customer' ? `
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4> Admin Approval Required</h4>
                    <p>Your ${accountType.toLowerCase()} application is under review. Our admin team will verify your documents and approve your account within <strong>24-48 hours</strong>.</p>
                    <p>You'll receive an email notification once approved!</p>
                </div>
                ` : ''}
                
                <div style="text-align: center;">
                    <a class="cta" href="http://localhost:3000/dashboard">Go to Dashboard</a>
                </div>
                
                <h3> Need Help?</h3>
                <ul>
                    <li> Email: <a href="mailto:support@swasthyasarthi.com">support@swasthyasarthi.com</a></li>
                    <li> WhatsApp: +91 98765 43210</li>
                    <li> Help Center: www.swasthyasarthi.com/help</li>
                    <li> Live Chat: Available 24/7</li>
                </ul>
            </div>
            
            <div class="support">
                <p><strong> Pro Tip:</strong> Complete your profile to unlock all features!</p>
                <p>Follow us:  Facebook |  Instagram |  Twitter</p>
                <p>Thank you for choosing Swasthya Sarthi - Your Health, Our Priority! </p>
            </div>
        </div>
    </body>
    </html>`;
};

// Vendor Sales Analytics Email
exports.vendorSalesAnalyticsEmail = (vendorName, analytics) => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Monthly Sales Report - Swasthya Sarthi</title>
        <style>
            body {
                background-color: #f8f9fa;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #6f42c1;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #6f42c1;
                margin-bottom: 10px;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 20px 0;
            }
            .stat-card {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                border-left: 4px solid #6f42c1;
            }
            .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: #6f42c1;
            }
            .stat-label {
                font-size: 14px;
                color: #6c757d;
                margin-top: 5px;
            }
            .top-medicines {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .medicine-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #dee2e6;
            }
            .medicine-item:last-child {
                border-bottom: none;
            }
            .cta {
                display: inline-block;
                padding: 12px 30px;
                background-color: #6f42c1;
                color: #ffffff;
                text-decoration: none;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                margin: 20px auto;
                text-align: center;
            }
            .support {
                text-align: center;
                font-size: 14px;
                color: #6c757d;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
            }
            .highlight {
                font-weight: bold;
                color: #6f42c1;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏥 Swasthya Sarthi</div>
                <p>Monthly Sales Analytics Report</p>
            </div>
            
            <div class="body">
                <p>Dear <span class="highlight">${vendorName}</span>,</p>
                
                <p>Here's your monthly sales performance summary:</p>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${analytics.totalOrders}</div>
                        <div class="stat-label">Total Orders</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">₹${analytics.totalRevenue}</div>
                        <div class="stat-label">Total Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${analytics.completedOrders}</div>
                        <div class="stat-label">Completed Orders</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${analytics.averageOrderValue}</div>
                        <div class="stat-label">Avg. Order Value</div>
                    </div>
                </div>

                <div class="top-medicines">
                    <h3>🏆 Top Selling Medicines</h3>
                    ${analytics.topMedicines.map((med, index) => `
                        <div class="medicine-item">
                            <span>${index + 1}. ${med.name}</span>
                            <span>${med.quantity} units sold</span>
                        </div>
                    `).join('')}
                </div>

                <p><strong>📈 Growth Insights:</strong></p>
                <ul>
                    <li>Orders increased by ${analytics.orderGrowth}% from last month</li>
                    <li>Revenue grew by ${analytics.revenueGrowth}% from last month</li>
                    <li>Customer satisfaction rating: ${analytics.rating}/5 ⭐</li>
                </ul>
                
                <div style="text-align: center;">
                    <a class="cta" href="http://localhost:3000/vendor/dashboard">View Detailed Analytics</a>
                </div>
            </div>
            
            <div class="support">
                <p>Need help growing your business? Contact us at <a href="mailto:vendor@swasthyasarthi.com">vendor@swasthyasarthi.com</a></p>
                <p>Thank you for being part of Swasthya Sarthi! 🙏</p>
            </div>
        </div>
    </body>
    </html>`;
};