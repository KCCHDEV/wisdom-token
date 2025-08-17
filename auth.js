const axios = require('axios');
const colors = require('colors');

class DiscordAuth {
    constructor() {
        this.baseURL = 'https://discord.com/api/v9';
        this.headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Origin': 'https://discord.com',
            'Referer': 'https://discord.com/login',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        };
    }

    async getToken(email, password) {
        try {
            console.log(`${'[INFO]'.cyan} Attempting to authenticate: ${email.yellow}`);
            
            const loginData = {
                email: email,
                password: password,
                undelete: false,
                captcha_key: null,
                login_source: null,
                gift_code_sku_id: null
            };

            const response = await axios.post(`${this.baseURL}/auth/login`, loginData, {
                headers: this.headers
            });

            if (response.data.token) {
                console.log(`${'[SUCCESS]'.green} Token obtained for: ${email.yellow}`);
                return {
                    success: true,
                    token: response.data.token,
                    mfa: false
                };
            } else if (response.data.mfa) {
                console.log(`${'[MFA]'.yellow} 2FA required for: ${email.yellow}`);
                return {
                    success: false,
                    mfa: true,
                    ticket: response.data.ticket,
                    message: '2FA required - cannot proceed without MFA code'
                };
            } else {
                console.log(`${'[ERROR]'.red} Authentication failed for: ${email.yellow}`);
                return {
                    success: false,
                    mfa: false,
                    message: 'Invalid credentials'
                };
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                
                if (status === 400) {
                    if (data.captcha_key) {
                        console.log(`${'[ERROR]'.red} Captcha required for: ${email.yellow}`);
                        return {
                            success: false,
                            mfa: false,
                            message: 'Captcha required'
                        };
                    } else {
                        console.log(`${'[ERROR]'.red} Invalid credentials for: ${email.yellow}`);
                        return {
                            success: false,
                            mfa: false,
                            message: 'Invalid email or password'
                        };
                    }
                } else if (status === 429) {
                    console.log(`${'[ERROR]'.red} Rate limited for: ${email.yellow}`);
                    return {
                        success: false,
                        mfa: false,
                        message: 'Rate limited - try again later'
                    };
                } else {
                    console.log(`${'[ERROR]'.red} HTTP ${status} for: ${email.yellow}`);
                    return {
                        success: false,
                        mfa: false,
                        message: `HTTP ${status} error`
                    };
                }
            } else {
                console.log(`${'[ERROR]'.red} Network error for: ${email.yellow} - ${error.message}`);
                return {
                    success: false,
                    mfa: false,
                    message: 'Network error'
                };
            }
        }
    }

    async handleMFA(ticket, mfaCode) {
        try {
            const mfaData = {
                code: mfaCode,
                ticket: ticket,
                login_source: null,
                gift_code_sku_id: null
            };

            const response = await axios.post(`${this.baseURL}/auth/mfa/totp`, mfaData, {
                headers: this.headers
            });

            if (response.data.token) {
                return {
                    success: true,
                    token: response.data.token
                };
            } else {
                return {
                    success: false,
                    message: 'Invalid MFA code'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'MFA verification failed'
            };
        }
    }

    // Alternative method using different endpoints
    async getTokenAlternative(email, password) {
        try {
            console.log(`${'[INFO]'.cyan} Trying alternative method for: ${email.yellow}`);
            
            // First get fingerprint
            const fingerprintResponse = await axios.get(`${this.baseURL}/experiments`, {
                headers: this.headers
            });
            
            const fingerprint = fingerprintResponse.data.fingerprint;
            
            const loginData = {
                login: email,
                password: password,
                undelete: false,
                captcha_key: null,
                login_source: null,
                gift_code_sku_id: null,
                fingerprint: fingerprint
            };

            const response = await axios.post(`${this.baseURL}/auth/login`, loginData, {
                headers: this.headers
            });

            return this.handleAuthResponse(response, email);
        } catch (error) {
            console.log(`${'[ERROR]'.red} Alternative method failed for: ${email.yellow}`);
            return {
                success: false,
                message: 'Alternative authentication failed'
            };
        }
    }

    handleAuthResponse(response, email) {
        if (response.data.token) {
            console.log(`${'[SUCCESS]'.green} Token obtained for: ${email.yellow}`);
            return {
                success: true,
                token: response.data.token,
                mfa: false
            };
        } else if (response.data.mfa) {
            console.log(`${'[MFA]'.yellow} 2FA required for: ${email.yellow}`);
            return {
                success: false,
                mfa: true,
                ticket: response.data.ticket,
                message: '2FA required'
            };
        } else {
            return {
                success: false,
                mfa: false,
                message: 'Authentication failed'
            };
        }
    }
}

module.exports = DiscordAuth;