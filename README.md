# Discord Account Checker

A comprehensive Discord account checking system using `discord.js-selfbot` that can extract tokens from email/password combinations and retrieve detailed account information.

## ⚠️ Warning

This tool is for educational purposes only. Using selfbots violates Discord's Terms of Service and may result in account suspension or termination. Use at your own risk.

## 🚀 Features

- **Token Extraction**: Get Discord tokens from email/password combinations
- **2FA Support**: Handle accounts with Two-Factor Authentication enabled
- **Comprehensive Account Information**:
  - Basic user information (username, email, phone, verification status)
  - 2FA status detection
  - Nitro status and type (Classic, Basic, Full)
  - Billing information and payment methods
  - Connected accounts (Steam, Spotify, etc.)
  - Friends and relationships
  - Server/Guild information
  - User settings and preferences
  - Applications and bots owned

## 📋 Requirements

- Node.js 16+ 
- npm or yarn

## 🛠️ Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

## 📦 Dependencies

- `discord.js-selfbot-v13`: Discord selfbot library
- `axios`: HTTP client for API requests
- `readline-sync`: Interactive CLI input
- `colors`: Console text coloring
- `fs`: File system operations

## 🚦 Usage

### Start the Application

```bash
npm start
# or
node index.js
```

### Menu Options

1. **Single Account Check**: Check one account using email/password
2. **Token Check**: Check account using existing token
3. **Bulk Check**: Check multiple accounts from a file
4. **View Results**: Review previous check results
5. **Save Results**: Export results to JSON file

### File Format for Bulk Checking

Create a text file with email:password format (one per line):

```
example1@gmail.com:password123
example2@yahoo.com:mypassword
example3@hotmail.com:secretpass
```

## 📊 Information Retrieved

### Basic Information
- Username and discriminator
- User ID
- Email address
- Phone number
- Account verification status
- 2FA/MFA status
- Account creation date
- Avatar and banner

### Nitro Information
- Nitro subscription status
- Nitro type (None/Classic/Basic/Full)
- Premium subscription date
- Guild boost subscriptions

### Billing Information
- Payment methods (cards, PayPal, etc.)
- Card details (last 4 digits, expiry)
- Default payment method

### Connections
- Connected services (Steam, Spotify, GitHub, etc.)
- Connection verification status
- Activity sharing settings

### Relationships
- Friends list
- Blocked users
- Incoming friend requests
- Outgoing friend requests

### Servers/Guilds
- Server count
- Owned servers
- Server permissions
- Join dates

### Applications
- Created Discord applications
- Bot ownership
- Application verification status

## 🔧 API Methods Used

The system uses multiple Discord API endpoints:

- `/auth/login` - Authentication
- `/auth/mfa/totp` - 2FA verification
- `/users/@me` - User information
- `/users/@me/billing/payment-sources` - Billing data
- `/users/@me/connections` - Connected accounts
- `/users/@me/settings` - User settings
- `/users/@me/relationships` - Friends/blocked users
- `/users/@me/premium-guild-subscriptions` - Nitro boosts

## 🛡️ Security Features

- Password input masking
- Token sanitization in saved results
- Rate limiting protection
- Multiple authentication methods
- Error handling for various failure scenarios

## 📁 File Structure

```
discord-account-checker/
├── package.json          # Dependencies and scripts
├── index.js             # Main application
├── auth.js              # Authentication module
├── checker.js           # Account checking module
├── accounts_example.txt # Example file format
└── README.md           # This file
```

## 🔍 Example Output

```
╔══════════════════════════════════════════════════════════════╗
║                   DISCORD ACCOUNT CHECKER                   ║
║                 Using discord.js-selfbot                    ║
╚══════════════════════════════════════════════════════════════╝

==================================================
DISCORD ACCOUNT INFORMATION
==================================================

📋 BASIC INFORMATION
Username: user#1234
User ID: 123456789012345678
Email: user@example.com
Phone: +1234567890
Verified: ✅ Yes
2FA Enabled: ✅ Yes
Created: 2020-01-01T00:00:00.000Z

💎 NITRO STATUS
Nitro: ✅ Nitro
Since: 2022-01-01T00:00:00.000Z

💳 BILLING INFORMATION
Payment Method 1: Visa ending in 1234

🔗 CONNECTIONS
steam: username ✅
spotify: username ✅

👥 RELATIONSHIPS
Friends: 25
Blocked: 2
Incoming Requests: 1
Outgoing Requests: 0

🏠 SERVERS (GUILDS)
Total Servers: 15
Owned Servers: 2

🤖 APPLICATIONS
Total Applications: 1
- My Bot ✅
```

## ⚡ Performance Tips

- Use delays between bulk checks to avoid rate limiting
- Monitor console output for authentication status
- Keep tokens secure and never share them
- Use alternative authentication methods if primary fails

## 🚨 Rate Limiting

The application includes built-in rate limiting protection:
- 2-second delays between bulk checks
- Automatic retry with alternative methods
- Rate limit detection and error handling

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify email/password are correct
   - Check if account has 2FA enabled
   - Try alternative authentication method

2. **Captcha Required**
   - Discord may require captcha verification
   - Try again later or use different IP

3. **Rate Limited**
   - Wait before making more requests
   - Reduce bulk checking speed

4. **Token Invalid**
   - Token may have expired
   - Re-authenticate to get new token

## 📄 Legal Disclaimer

This tool is provided for educational and research purposes only. The developers are not responsible for any misuse or violations of Discord's Terms of Service. Users are solely responsible for their actions and should comply with all applicable laws and service agreements.

## 🤝 Contributing

This is an educational project. Please use responsibly and in accordance with all applicable terms of service and laws.

## 📝 Notes

- Selfbots are against Discord's Terms of Service
- Use only for educational purposes
- Account suspension/termination is possible
- Keep credentials and tokens secure
- Respect rate limits and API guidelines