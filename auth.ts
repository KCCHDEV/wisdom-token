import axios, { AxiosResponse } from "axios";
import "colors";

type AuthSuccess = {
  success: true;
  token: string;
  mfa: false;
};

type AuthMfaRequired = {
  success: false;
  mfa: true;
  ticket: string;
  message: string;
};

type AuthFailure = {
  success: false;
  mfa: false;
  message: string;
};

export type AuthResult = AuthSuccess | AuthMfaRequired | AuthFailure;

type MfaResult =
  | {
      success: true;
      token: string;
    }
  | {
      success: false;
      message: string;
    };

type DiscordAuthResponse = {
  token?: string;
  mfa?: boolean;
  ticket?: string;
  [key: string]: unknown;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

class DiscordAuth {
  private readonly baseURL: string;
  private readonly headers: Record<string, string>;

  constructor() {
    this.baseURL = "https://discord.com/api/v9";
    this.headers = {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Origin: "https://discord.com",
      Referer: "https://discord.com/login",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
    };
  }

  public async getToken(email: string, password: string): Promise<AuthResult> {
    try {
      console.log(`${"[INFO]".cyan} Attempting to authenticate: ${email.yellow}`);

      const loginData = {
        email,
        password,
        undelete: false,
        captcha_key: null,
        login_source: null,
        gift_code_sku_id: null,
      };

      const response = await axios.post<DiscordAuthResponse>(`${this.baseURL}/auth/login`, loginData, {
        headers: this.headers,
      });

      return this.handleAuthResponse(response, email);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const data = (error.response.data as Record<string, unknown> | undefined) ?? {};

        if (status === 400) {
          if (data.captcha_key) {
            console.log(`${"[ERROR]".red} Captcha required for: ${email.yellow}`);
            return { success: false, mfa: false, message: "Captcha required" };
          }
          console.log(`${"[ERROR]".red} Invalid credentials for: ${email.yellow}`);
          return { success: false, mfa: false, message: "Invalid email or password" };
        }

        if (status === 429) {
          console.log(`${"[ERROR]".red} Rate limited for: ${email.yellow}`);
          return { success: false, mfa: false, message: "Rate limited - try again later" };
        }

        console.log(`${"[ERROR]".red} HTTP ${status} for: ${email.yellow}`);
        return { success: false, mfa: false, message: `HTTP ${status} error` };
      }

      console.log(`${"[ERROR]".red} Network error for: ${email.yellow} - ${getErrorMessage(error)}`);
      return { success: false, mfa: false, message: "Network error" };
    }
  }

  public async handleMFA(ticket: string, mfaCode: string): Promise<MfaResult> {
    try {
      const mfaData = {
        code: mfaCode,
        ticket,
        login_source: null,
        gift_code_sku_id: null,
      };

      const response = await axios.post<DiscordAuthResponse>(`${this.baseURL}/auth/mfa/totp`, mfaData, {
        headers: this.headers,
      });

      if (response.data.token) {
        return { success: true, token: response.data.token };
      }

      return { success: false, message: "Invalid MFA code" };
    } catch {
      return { success: false, message: "MFA verification failed" };
    }
  }

  public async getTokenAlternative(email: string, password: string): Promise<AuthResult> {
    try {
      console.log(`${"[INFO]".cyan} Trying alternative method for: ${email.yellow}`);

      const fingerprintResponse = await axios.get<{ fingerprint?: string }>(`${this.baseURL}/experiments`, {
        headers: this.headers,
      });

      const fingerprint = fingerprintResponse.data.fingerprint;

      const loginData = {
        login: email,
        password,
        undelete: false,
        captcha_key: null,
        login_source: null,
        gift_code_sku_id: null,
        fingerprint: fingerprint ?? null,
      };

      const response = await axios.post<DiscordAuthResponse>(`${this.baseURL}/auth/login`, loginData, {
        headers: this.headers,
      });

      return this.handleAuthResponse(response, email);
    } catch {
      console.log(`${"[ERROR]".red} Alternative method failed for: ${email.yellow}`);
      return { success: false, mfa: false, message: "Alternative authentication failed" };
    }
  }

  private handleAuthResponse(response: AxiosResponse<DiscordAuthResponse>, email: string): AuthResult {
    if (response.data.token) {
      console.log(`${"[SUCCESS]".green} Token obtained for: ${email.yellow}`);
      return { success: true, token: response.data.token, mfa: false };
    }

    if (response.data.mfa) {
      console.log(`${"[MFA]".yellow} 2FA required for: ${email.yellow}`);
      return {
        success: false,
        mfa: true,
        ticket: response.data.ticket ?? "",
        message: "2FA required",
      };
    }

    console.log(`${"[ERROR]".red} Authentication failed for: ${email.yellow}`);
    return { success: false, mfa: false, message: "Authentication failed" };
  }
}

export default DiscordAuth;
