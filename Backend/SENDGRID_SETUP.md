# SendGrid Email Setup for Render Deployment

## 🚀 Quick Setup (5 minutes)

### Step 1: Create SendGrid Account
1. Go to: https://signup.sendgrid.com/
2. Sign up (FREE plan - 100 emails/day)
3. Verify your email

### Step 2: Get API Key
1. Login to SendGrid Dashboard
2. Go to: **Settings** → **API Keys**
3. Click **"Create API Key"**
4. Name: `Swasthya-Sarthi-Production`
5. Permissions: **Full Access** (or at least Mail Send)
6. Copy the API Key (starts with `SG.`)

### Step 3: Add to Render Environment Variables
1. Go to Render Dashboard
2. Select your backend service: **swasthya-sarthi-backend**
3. Go to **Environment** tab
4. Add new environment variable:
   - **Key:** `SENDGRID_API_KEY`
   - **Value:** `SG.xxxxxxxxxxxxxxxxxxxx` (paste your API key)
5. Add another variable:
   - **Key:** `USE_SENDGRID`
   - **Value:** `true`
6. Click **Save Changes**

### Step 4: Verify Sender Email (Important!)
1. In SendGrid Dashboard, go to: **Settings** → **Sender Authentication**
2. Choose **Single Sender Verification**
3. Add sender email: `bairariyakhushal@gmail.com`
4. Fill details and submit
5. Check your email and verify

### Step 5: Deploy
Your changes are already pushed to GitHub. Render will auto-deploy!

## ✅ Testing
After deployment, check Render logs for:
```
📧 Using SendGrid transporter...
✅ Email sent successfully to: customer@email.com
```

## 🔧 Local Development
Local development will continue using Gmail (no changes needed).
SendGrid only activates on Render when `USE_SENDGRID=true`.

## 📊 Monitor Usage
- SendGrid Dashboard → Stats
- Free Plan: 100 emails/day
- Upgrade if needed

## ⚠️ Important Notes
1. **Must verify sender email** before sending
2. Keep API key secret (never commit to GitHub)
3. Gmail will still work locally for testing
4. SendGrid is more reliable for production

## 🆘 Troubleshooting
If email still fails:
1. Check API key is correct in Render
2. Verify sender email is verified in SendGrid
3. Check SendGrid Dashboard → Activity for error details
