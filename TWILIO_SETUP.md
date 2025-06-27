# Twilio SMS Setup for Invoice Notifications

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number
```

## How to Get Twilio Credentials

1. **Sign up for Twilio**: Go to [twilio.com](https://twilio.com) and create an account
2. **Get Account SID & Auth Token**: 
   - Go to your Twilio Console Dashboard
   - Copy your Account SID and Auth Token
3. **Get a Phone Number**:
   - In Twilio Console, go to Phone Numbers > Manage > Buy a number
   - Purchase a phone number (usually ~$1/month)
   - This will be your `TWILIO_PHONE_NUMBER`

## SMS Message Format

The SMS will include:
- Client name
- Invoice number  
- Amount due
- Due date
- Payment terms
- Any invoice notes
- Company signature

## Usage

1. Navigate to Invoices page
2. For any **Draft** invoice, you'll see two send buttons:
   - 📧 **Send** (Email) - Blue button
   - 💬 **SMS** (Text Message) - Green button
3. Click the SMS button to send invoice details via text message
4. The system will notify you of success/failure and show the recipient phone number

## Error Handling

Common errors handled:
- Missing client phone number
- Invalid phone number format
- Phone number not mobile-capable
- Twilio configuration issues

## Cost

- Typical SMS costs ~$0.0075 per message in the US
- International rates vary
- Phone number rental ~$1/month

## Phone Number Format

Client phone numbers should be in international format:
- ✅ `+1234567890` 
- ✅ `+1 (234) 567-8900`
- ❌ `234-567-8900` (missing country code)

The system will attempt to send to whatever format is stored in the database. 