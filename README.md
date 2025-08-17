# Discord Account Checker 🔍

A comprehensive Discord account checking system using `discord.js-selfbot` that can extract tokens from email/password combinations and retrieve detailed account information.

## ⚠️ Warning

This tool is for educational purposes only. Using selfbots violates Discord's Terms of Service and may result in account suspension or termination. Use at your own risk.

## 🚀 Complete Feature List

### 🔐 Authentication Methods
- **Primary Login**: Direct email/password authentication via `/auth/login`
- **Alternative Login**: Fingerprint-based authentication with experiment endpoints
- **2FA/MFA Support**: Complete TOTP handling via `/auth/mfa/totp`
- **Auto-Retry**: Automatic fallback to alternative methods if primary fails
- **Captcha Detection**: Smart captcha detection with appropriate error handling
- **Rate Limit Protection**: Built-in rate limiting with intelligent delays

### 📊 Complete Account Information Extraction

#### 📋 Basic User Information
- **Username & Discriminator**: Full Discord tag (username#0000)
- **User ID**: Unique Discord user ID
- **Email Address**: Associated email (if accessible)
- **Phone Number**: Associated phone number (if accessible)
- **Account Verification**: Email/phone verification status
- **2FA/MFA Status**: ✅ Two-Factor Authentication enabled/disabled
- **Creation Date**: Account creation timestamp
- **Avatar & Banner**: Profile image and banner URLs
- **Accent Color**: Profile accent color code
- **Bio & Pronouns**: Profile description and pronouns

#### 💎 Nitro Information (Complete)
- **Nitro Status**: ✅ Active Nitro subscription detection
- **Nitro Type Classification**:
  - `None` (0) - No Nitro
  - `Nitro Classic` (1) - Legacy Nitro Classic
  - `Nitro` (2) - Full Nitro subscription
  - `Nitro Basic` (3) - Basic Nitro tier
- **Premium Since**: Nitro subscription start date
- **Guild Boost Subscriptions**: Server boost information
- **Premium Features Access**: Detailed premium feature availability

#### 💳 Billing & Payment Information
- **Payment Sources**: Complete payment method detection
- **Card Information**: 
  - Card brand (Visa, Mastercard, etc.)
  - Last 4 digits
  - Expiration month/year
  - Default payment method status
- **PayPal Integration**: PayPal account linking
- **Billing History**: Payment source management

#### 🔗 External Connections (Complete List)
- **Steam**: Gaming profile connection
- **Spotify**: Music streaming connection
- **YouTube**: Video platform connection
- **Twitch**: Streaming platform connection
- **GitHub**: Developer platform connection
- **Reddit**: Social platform connection
- **Twitter/X**: Social media connection
- **Facebook**: Social media connection
- **Xbox Live**: Gaming platform connection
- **PlayStation Network**: Gaming platform connection
- **Battle.net**: Gaming platform connection
- **League of Legends**: Game-specific connection
- **Connection Status**: Verified/unverified status for each
- **Activity Sharing**: Show activity settings per connection
- **Visibility Settings**: Public/private connection visibility

#### 👥 Relationships & Social
- **Friends List**: Complete friends roster with user details
- **Blocked Users**: List of blocked users
- **Incoming Friend Requests**: Pending incoming requests
- **Outgoing Friend Requests**: Pending outgoing requests
- **Relationship Metadata**: Friend since dates, mutual friends

#### 🏠 Server/Guild Information
- **Server Count**: Total number of joined servers
- **Server Details**: Name, ID, icon, member count for each server
- **Ownership Status**: Servers owned by the user
- **Permission Analysis**: User permissions in each server
- **Join Dates**: When user joined each server
- **Boost Status**: Server boost usage and history
- **Large Server Detection**: Large server membership analysis

#### ⚙️ User Settings & Preferences
- **Locale/Language**: Interface language setting
- **Theme**: Light/dark theme preference
- **Developer Mode**: Developer mode enabled/disabled
- **Accessibility**: Accessibility detection settings
- **Emoji Animation**: Animated emoji preferences
- **TTS Commands**: Text-to-speech settings
- **Message Display**: Compact/cozy message display
- **Activity Display**: Show current game activity
- **Friend Sources**: Friend request source permissions
- **Media Settings**: Embed, reaction, attachment preferences
- **Auto-play Settings**: GIF and media auto-play preferences
- **Timezone**: User timezone offset
- **AFK Timeout**: Auto-away timeout settings

#### 🤖 Applications & Development
- **Created Applications**: Discord applications owned by user
- **Bot Ownership**: Bots created and managed
- **Application Details**: Name, description, verification status
- **Bot Permissions**: Public bot settings and code grant requirements
- **Developer Information**: Application development metadata

#### 🎨 Profile Customization
- **Profile Effects**: Special profile animation effects
- **Theme Colors**: Custom profile theme colors
- **Popout Animations**: Profile popout animation types
- **Banner Customization**: Profile banner settings
- **Status Information**: Custom status and activity

### 🛠️ System Methods & Tools

#### Authentication Engine
1. `getToken(email, password)` - Primary authentication method
2. `getTokenAlternative(email, password)` - Fallback authentication
3. `handleMFA(ticket, mfaCode)` - 2FA/MFA processing
4. `handleAuthResponse()` - Response processing and validation

#### Information Extraction Methods
1. `checkAccount()` - Master account checking orchestrator
2. `checkNitroStatus()` - Nitro subscription analysis
3. `checkBillingInfo()` - Payment and billing data
4. `checkConnections()` - External platform connections
5. `checkUserSettings()` - User preferences and settings
6. `checkRelationships()` - Social connections and friends
7. `checkGuilds()` - Server membership and permissions
8. `checkApplications()` - Developer applications and bots
9. `getDetailedProfile()` - Extended profile information
10. `getNitroType()` - Nitro tier classification

#### User Interface & Experience
1. **Interactive Menu System**: Full CLI menu with 6 options
2. **Single Account Check**: Individual email/password checking
3. **Token-Based Check**: Direct token input verification
4. **Bulk Processing**: File-based mass account checking
5. **Results Management**: View and review previous results
6. **Data Export**: JSON export with sanitized data
7. **Real-time Progress**: Live progress tracking for bulk operations
8. **Colored Output**: Beautiful colored console output with emojis

#### Security & Logging
1. **Comprehensive Logging**: Multi-level logging system
2. **Data Sanitization**: Automatic sensitive data removal
3. **Audit Trails**: Complete operation tracking
4. **Error Handling**: Robust error management and recovery
5. **Rate Limit Management**: Intelligent request throttling
6. **Token Protection**: Token masking in logs and exports
7. **Email Masking**: Privacy-preserving email display
8. **Security Events**: Authentication and access logging

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

## 🔧 Complete API Endpoints Used

The system utilizes comprehensive Discord API coverage:

### Authentication Endpoints
- `GET /experiments` - Fingerprint generation for alternative auth
- `POST /auth/login` - Primary authentication endpoint
- `POST /auth/mfa/totp` - Two-Factor Authentication verification
- `POST /auth/mfa/sms` - SMS-based 2FA (if applicable)
- `POST /auth/mfa/webauthn` - WebAuthn 2FA support

### User Information Endpoints
- `GET /users/@me` - Complete user profile data
- `GET /users/@me/profile` - Extended profile information
- `GET /users/@me/settings` - User preferences and settings
- `GET /users/@me/billing/payment-sources` - Payment methods and billing
- `GET /users/@me/connections` - External platform connections
- `GET /users/@me/relationships` - Friends, blocked users, requests
- `GET /users/@me/premium-guild-subscriptions` - Nitro boost data

### Guild/Server Endpoints
- `GET /users/@me/guilds` - User's server memberships
- `GET /guilds/{guild_id}` - Detailed guild information
- `GET /guilds/{guild_id}/members/@me` - User's permissions in guild

### Application Endpoints
- `GET /applications` - User's created Discord applications
- `GET /applications/@me` - Current application context
- `GET /oauth2/applications/@me` - OAuth2 application data

### Additional Endpoints
- `GET /users/@me/library` - Game library (if accessible)
- `GET /users/@me/affinities/users` - User affinities and suggestions
- `GET /users/@me/sessions` - Active sessions information

## 🛡️ Security Features

- Password input masking
- Token sanitization in saved results
- Rate limiting protection
- Multiple authentication methods
- Error handling for various failure scenarios

## 📁 Complete File Structure

```
discord-account-checker/
├── 📦 Core System Files
│   ├── package.json              # Dependencies and npm scripts
│   ├── package-lock.json         # Locked dependency versions
│   └── .gitignore               # Git ignore patterns
│
├── 🚀 Application Files  
│   ├── index.js                 # Main application & CLI interface
│   ├── auth.js                  # Authentication engine (6 methods)
│   ├── checker.js               # Account information extractor (10+ methods)
│   └── logger.js                # Comprehensive logging system
│
├── 📄 Documentation
│   ├── README.md                # Complete system documentation
│   └── accounts_example.txt     # File format examples for bulk checking
│
├── 📊 Generated Files (Runtime)
│   ├── logs/                    # Log directory (auto-created)
│   │   ├── discord-checker-YYYY-MM-DD.log    # Daily logs
│   │   └── audit-YYYY-MM-DD.log              # Audit trails
│   ├── results.json             # Exported results (user-generated)
│   └── accounts.txt             # User account lists (user-created)
│
└── 🔧 Dependencies
    └── node_modules/            # npm dependencies (105 packages)
```

### File Descriptions

#### Core Application Files
- **`index.js`** (304 lines): Main CLI application with interactive menu system
- **`auth.js`** (202 lines): Complete authentication engine with 4 methods + fallbacks
- **`checker.js`** (397 lines): Account information extraction with 10+ specialized methods  
- **`logger.js`** (321 lines): Enterprise-grade logging with audit trails and security features

#### Key Methods by File

**Authentication Engine (`auth.js`):**
- `getToken()` - Primary email/password authentication
- `getTokenAlternative()` - Fingerprint-based fallback method
- `handleMFA()` - Complete 2FA/TOTP processing
- `handleAuthResponse()` - Response validation and processing

**Account Checker (`checker.js`):**
- `checkAccount()` - Master orchestrator method
- `checkNitroStatus()` - Nitro subscription analysis  
- `checkBillingInfo()` - Payment and billing data extraction
- `checkConnections()` - External platform connections
- `checkUserSettings()` - User preferences and configuration
- `checkRelationships()` - Social connections (friends, blocked, requests)
- `checkGuilds()` - Server membership and permissions
- `checkApplications()` - Discord applications and bots
- `getDetailedProfile()` - Extended profile information
- `displayAccountInfo()` - Beautiful formatted output

**Logging System (`logger.js`):**
- Multi-level logging (INFO, SUCCESS, WARNING, ERROR, DEBUG, SECURITY, AUDIT)
- Automatic data sanitization and privacy protection
- Rate limit and authentication event tracking
- Log statistics and export functionality
- Old log cleanup and maintenance

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