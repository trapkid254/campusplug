# CampusPlug Integrations Setup

## M-Pesa Daraja (STK Push)

### Sandbox setup

1. Create account at [Safaricom Daraja](https://developer.safaricom.co.ke)
2. Create an app and note **Consumer Key** and **Consumer Secret**
3. Under Lipa Na M-Pesa → get **Passkey** and use test shortcode **174379**
4. Add to `.env`:

```env
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/payments/mpesa/callback
```

### Local callback testing

Daraja must reach your callback URL. Use [ngrok](https://ngrok.com):

```bash
ngrok http 3000
# Copy HTTPS URL → MPESA_CALLBACK_URL
```

### Sandbox test phone

Use the test number from Daraja portal (often `254708374149`). STK push will prompt for PIN **174379** in sandbox.

### Production

```env
MPESA_ENV=production
MPESA_SHORTCODE=your_live_paybill
# Use production credentials from Daraja
```

---

## Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → APIs & Services → Credentials
3. Create **OAuth 2.0 Client ID** (Web application)
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`
5. Add to `.env`:

```env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

The Google button appears on login/register when both variables are set.

---

## Africa's Talking SMS

### Sandbox

1. Sign up at [Africa's Talking](https://africastalking.com)
2. Get API key from dashboard (sandbox)
3. Add to `.env`:

```env
AT_USERNAME=sandbox
AT_API_KEY=your_sandbox_api_key
AT_ENV=sandbox
```

4. In sandbox, add your phone number as a **verified number** in the dashboard to receive test SMS.

### Production

```env
AT_USERNAME=your_live_username
AT_API_KEY=your_live_api_key
AT_ENV=production
```

### SMS triggers

| Event | Recipient |
|-------|-----------|
| Registration welcome | User's phone |
| Property inquiry | Landlord's phone |
| Internship application | Provider's phone |
| Application status update | Student's phone |
| Listing approved | Landlord's phone |
| M-Pesa payment success | Payer's phone |

Users must have a phone number on their profile (collected at registration).

---

## Demo mode (no credentials)

Without M-Pesa credentials, payments complete instantly in demo mode.
Without SMTP, emails log to console.
Without AT_API_KEY, SMS log to console.
