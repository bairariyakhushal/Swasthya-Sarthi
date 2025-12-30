# Swasthya Sarthi - Healthcare Platform

A comprehensive healthcare platform connecting customers, pharmacies, volunteers, and admins for efficient medicine delivery with AI-powered assistance.

## 🚀 Features

### For Customers
- 🔍 Search medicines by name or symptoms
- 📍 Find nearby pharmacies based on location
- 🤖 AI-powered medicine information and symptom checker
- 💊 Order medicines with prescription upload
- 📦 Track order status in real-time
- 💳 Secure payment via Razorpay

### For Vendors (Pharmacies)
- 🏪 Register and manage pharmacy
- 📊 Inventory management
- 📈 Sales analytics and dashboard
- 🛍️ Order management
- 💰 Revenue tracking

### For Volunteers (Delivery Partners)
- 🚗 Accept delivery orders
- 📍 Real-time location tracking
- 💼 Delivery management
- 💵 Earnings tracking

### For Admin
- ✅ Approve/reject pharmacy and volunteer registrations
- 👥 Manage users, pharmacies, and volunteers
- 📊 Platform analytics dashboard

## 🛠️ Tech Stack

### Frontend
- **Framework:** React + Vite
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **Animations:** Framer Motion
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT
- **File Upload:** Cloudinary
- **Payment:** Razorpay
- **AI Integration:** OpenAI API
- **Email:** Nodemailer

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Clone Repository
```bash
git clone https://github.com/bairariyakhushal/Swasthya-Sarthi.git
cd Swasthya-Sarthi
```

### Install Dependencies
```bash
# Install root dependencies (for concurrently)
npm install

# Or install separately
cd Backend
npm install
cd ../Frontend
npm install
```

### Environment Variables

#### Backend (.env in Backend folder)
```env
PORT=4000
DB_URL=your_mongodb_connection_string
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email
MAIL_PASS=your_email_password
JWT_SECRET=your_jwt_secret
FOLDER_NAME=Swasthya_Sarthi
CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
OPENCAGE_API_KEY=your_opencage_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

#### Frontend (.env in Frontend folder)
```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

## 🚀 Running the Application

### Development Mode (Both Frontend & Backend)
```bash
npm run dev
```

### Run Separately

**Backend:**
```bash
npm run server
```

**Frontend:**
```bash
npm run client
```

### Production Mode
```bash
npm start
```

## 📁 Project Structure

```
Swasthya-Sarthi/
├── Backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middlewares/     # Custom middlewares
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── Frontend/
│   ├── src/
│   │   ├── api/         # API integration
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── redux/       # State management
│   │   ├── router/      # Routing configuration
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
└── package.json         # Root package.json
```

## 🌐 Deployment

### Backend (Render)
1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Create New > Web Service
4. Connect GitHub repository
5. Configure:
   - **Build Command:** `cd Backend && npm install`
   - **Start Command:** `cd Backend && npm start`
   - Add environment variables
6. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Import GitHub repository
4. Configure:
   - **Root Directory:** `Frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - Add environment variable: `VITE_API_BASE_URL=your_backend_url`
5. Deploy

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/sendotp` - Send OTP
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/changepassword` - Change password

### Pharmacy
- `POST /api/v1/pharmacy/search` - Search medicines
- `POST /api/v1/pharmacy/nearest` - Get nearest pharmacies
- `POST /api/v1/pharmacy/register` - Register pharmacy
- `POST /api/v1/pharmacy/inventory/:pharmacyId` - Update inventory

### Orders
- `POST /api/v1/order/create-payment-order` - Create order
- `POST /api/v1/order/verify-payment` - Verify payment
- `GET /api/v1/order/my-orders` - Get user orders
- `GET /api/v1/order/track/:orderId` - Track order

### Admin
- `GET /api/v1/admin/dashboard` - Admin dashboard
- `GET /api/v1/admin/pharmacies/pending` - Pending pharmacies
- `PUT /api/v1/admin/pharmacies/:id/approval` - Approve pharmacy

## 👥 Contributors

- Khushal Bairariya - [@bairariyakhushal](https://github.com/bairariyakhushal)

- Nilesh Rahangdale - [nileshrahangdale08@gmail.com](https://github.com/nilesh-rahangdale)

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For any queries, reach out at: swasthyasarthi0@gmail.com
