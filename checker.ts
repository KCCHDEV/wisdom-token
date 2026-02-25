import axios from "axios";
import "colors";

const { Client } = require("discord.js-selfbot-v13") as {
  Client: new () => any;
};

type GenericMap = Record<string, any>;

type CheckResult =
  | {
      success: true;
      data: AccountInfo;
    }
  | {
      success: false;
      error: string;
    };

type AccountInfo = {
  basicInfo: GenericMap;
  nitro: GenericMap;
  billing: GenericMap;
  connections: GenericMap[];
  settings: GenericMap;
  relationships: GenericMap;
  guilds: GenericMap;
  applications: GenericMap[];
  profile: GenericMap;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

class DiscordChecker {
  private readonly token: string;
  private readonly client: any;
  private readonly baseURL: string;
  private readonly headers: Record<string, string>;

  constructor(token: string) {
    this.token = token;
    this.client = new Client();
    this.baseURL = "https://discord.com/api/v9";
    this.headers = {
      Authorization: token,
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    };
  }

  public async checkAccount(): Promise<CheckResult> {
    try {
      console.log(`${"[INFO]".cyan} Checking account information...`);
      await this.client.login(this.token);

      const user = this.client.user;
      const accountInfo: AccountInfo = {
        basicInfo: {
          id: user.id,
          username: user.username,
          discriminator: user.discriminator,
          tag: user.tag,
          email: user.email,
          phone: user.phone,
          verified: user.verified,
          mfaEnabled: user.mfaEnabled,
          createdAt: user.createdAt,
          avatar: user.avatar,
          banner: user.banner,
          accentColor: user.accentColor,
        },
        nitro: await this.checkNitroStatus(),
        billing: await this.checkBillingInfo(),
        connections: await this.checkConnections(),
        settings: await this.checkUserSettings(),
        relationships: await this.checkRelationships(),
        guilds: await this.checkGuilds(),
        applications: await this.checkApplications(),
        profile: await this.getDetailedProfile(),
      };

      await this.client.destroy();
      return { success: true, data: accountInfo };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  private async checkNitroStatus(): Promise<GenericMap> {
    try {
      const response = await axios.get(`${this.baseURL}/users/@me`, { headers: this.headers });
      const premiumType = Number(response.data.premium_type ?? 0);
      const nitroInfo: GenericMap = {
        hasNitro: premiumType > 0,
        premiumType,
        nitroType: this.getNitroType(premiumType),
        premiumSince: response.data.premium_since ?? null,
      };

      try {
        const subscriptionsResponse = await axios.get(`${this.baseURL}/users/@me/premium-guild-subscriptions`, {
          headers: this.headers,
        });
        nitroInfo.premiumGuildSubscriptions = subscriptionsResponse.data;
      } catch {
        nitroInfo.premiumGuildSubscriptions = [];
      }

      return nitroInfo;
    } catch {
      return { hasNitro: false, error: "Could not check Nitro status" };
    }
  }

  private async checkBillingInfo(): Promise<GenericMap> {
    try {
      const response = await axios.get(`${this.baseURL}/users/@me/billing/payment-sources`, { headers: this.headers });
      return {
        paymentSources: (response.data as GenericMap[]).map((source) => ({
          id: source.id,
          type: source.type,
          brand: source.brand,
          lastFour: source.last_4,
          expiresMonth: source.expires_month,
          expiresYear: source.expires_year,
          default: source.default,
        })),
      };
    } catch {
      return { paymentSources: [], error: "Could not access billing information" };
    }
  }

  private async checkConnections(): Promise<GenericMap[]> {
    try {
      const response = await axios.get(`${this.baseURL}/users/@me/connections`, { headers: this.headers });
      return (response.data as GenericMap[]).map((connection) => ({
        type: connection.type,
        name: connection.name,
        id: connection.id,
        verified: connection.verified,
        showActivity: connection.show_activity,
        visibility: connection.visibility,
      }));
    } catch {
      return [];
    }
  }

  private async checkUserSettings(): Promise<GenericMap> {
    try {
      const response = await axios.get(`${this.baseURL}/users/@me/settings`, { headers: this.headers });
      return {
        locale: response.data.locale,
        theme: response.data.theme,
        developerMode: response.data.developer_mode,
        allowAccessibilityDetection: response.data.allow_accessibility_detection,
        animateEmoji: response.data.animate_emoji,
        enableTtsCommand: response.data.enable_tts_command,
        messageDisplayCompact: response.data.message_display_compact,
        showCurrentGame: response.data.show_current_game,
        restrictedGuilds: response.data.restricted_guilds,
        friendSourceFlags: response.data.friend_source_flags,
        renderEmbeds: response.data.render_embeds,
        renderReactions: response.data.render_reactions,
        inlineAttachmentMedia: response.data.inline_attachment_media,
        inlineEmbedMedia: response.data.inline_embed_media,
        gifAutoPlay: response.data.gif_auto_play,
        convertEmoticons: response.data.convert_emoticons,
        afkTimeout: response.data.afk_timeout,
        timezone: response.data.timezone_offset,
      };
    } catch {
      return { error: "Could not access user settings" };
    }
  }

  private async checkRelationships(): Promise<GenericMap> {
    try {
      const response = await axios.get(`${this.baseURL}/users/@me/relationships`, { headers: this.headers });
      const relationships: GenericMap = { friends: [], blocked: [], incoming: [], outgoing: [] };

      for (const rel of response.data as GenericMap[]) {
        const user = {
          id: rel.user?.id,
          username: rel.user?.username,
          discriminator: rel.user?.discriminator,
          avatar: rel.user?.avatar,
        };

        switch (rel.type) {
          case 1:
            relationships.friends.push(user);
            break;
          case 2:
            relationships.blocked.push(user);
            break;
          case 3:
            relationships.incoming.push(user);
            break;
          case 4:
            relationships.outgoing.push(user);
            break;
          default:
            break;
        }
      }

      return relationships;
    } catch {
      return { error: "Could not access relationships" };
    }
  }

  private async checkGuilds(): Promise<GenericMap> {
    try {
      const guilds = this.client.guilds.cache.map((guild: any) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        owner: guild.ownerId === this.client.user.id,
        permissions: guild.members.cache.get(this.client.user.id)?.permissions.toArray() ?? [],
        memberCount: guild.memberCount,
        large: guild.large,
        features: guild.features,
        joinedAt: guild.joinedAt,
      }));

      return { count: guilds.length, guilds };
    } catch {
      return { count: 0, guilds: [], error: "Could not access guilds" };
    }
  }

  private async checkApplications(): Promise<GenericMap[]> {
    try {
      const response = await axios.get(`${this.baseURL}/applications`, { headers: this.headers });
      return (response.data as GenericMap[]).map((app) => ({
        id: app.id,
        name: app.name,
        description: app.description,
        botPublic: app.bot_public,
        botRequireCodeGrant: app.bot_require_code_grant,
        verified: app.verified,
      }));
    } catch {
      return [];
    }
  }

  private async getDetailedProfile(): Promise<GenericMap> {
    try {
      const response = await axios.get(`${this.baseURL}/users/@me/profile`, { headers: this.headers });
      return {
        bio: response.data.bio ?? "",
        pronouns: response.data.pronouns ?? "",
        accentColor: response.data.accent_color,
        banner: response.data.banner,
        themeColors: response.data.theme_colors,
        popoutAnimationParticleType: response.data.popout_animation_particle_type,
        profileEffectId: response.data.profile_effect_id,
      };
    } catch {
      return { error: "Could not access detailed profile" };
    }
  }

  private getNitroType(premiumType: number): string {
    switch (premiumType) {
      case 0:
        return "None";
      case 1:
        return "Nitro Classic";
      case 2:
        return "Nitro";
      case 3:
        return "Nitro Basic";
      default:
        return "Unknown";
    }
  }

  public displayAccountInfo(accountInfo: AccountInfo): void {
    console.log(`\n${"=".repeat(50).cyan}`);
    console.log("DISCORD ACCOUNT INFORMATION".cyan.bold);
    console.log("=".repeat(50).cyan);

    console.log("\n📋 BASIC INFORMATION".yellow.bold);
    console.log(`Username: ${accountInfo.basicInfo.username}#${accountInfo.basicInfo.discriminator}`.white);
    console.log(`User ID: ${accountInfo.basicInfo.id}`.white);
    console.log(`Email: ${accountInfo.basicInfo.email || "Not available"}`.white);
    console.log(`Phone: ${accountInfo.basicInfo.phone || "Not available"}`.white);
    console.log(`Verified: ${accountInfo.basicInfo.verified ? "✅ Yes".green : "❌ No".red}`);
    console.log(`2FA Enabled: ${accountInfo.basicInfo.mfaEnabled ? "✅ Yes".green : "❌ No".red}`);
    console.log(`Created: ${String(accountInfo.basicInfo.createdAt)}`.white);

    console.log("\n💎 NITRO STATUS".yellow.bold);
    if (accountInfo.nitro.hasNitro) {
      console.log(`Nitro: ✅ ${accountInfo.nitro.nitroType}`.green);
      console.log(`Since: ${accountInfo.nitro.premiumSince || "Unknown"}`.white);
    } else {
      console.log("Nitro: ❌ No Nitro".red);
    }

    console.log("\n💳 BILLING INFORMATION".yellow.bold);
    if (accountInfo.billing.paymentSources && accountInfo.billing.paymentSources.length > 0) {
      accountInfo.billing.paymentSources.forEach((source: any, index: number) => {
        console.log(`Payment Method ${index + 1}: ${source.brand} ending in ${source.lastFour}`.white);
      });
    } else {
      console.log("No payment methods found".red);
    }

    console.log("\n🔗 CONNECTIONS".yellow.bold);
    if (accountInfo.connections && accountInfo.connections.length > 0) {
      accountInfo.connections.forEach((conn: any) => {
        console.log(`${conn.type}: ${conn.name} ${conn.verified ? "✅" : "❌"}`.white);
      });
    } else {
      console.log("No connections found".red);
    }

    console.log("\n👥 RELATIONSHIPS".yellow.bold);
    if (accountInfo.relationships && !accountInfo.relationships.error) {
      console.log(`Friends: ${accountInfo.relationships.friends.length}`.white);
      console.log(`Blocked: ${accountInfo.relationships.blocked.length}`.white);
      console.log(`Incoming Requests: ${accountInfo.relationships.incoming.length}`.white);
      console.log(`Outgoing Requests: ${accountInfo.relationships.outgoing.length}`.white);
    }

    console.log("\n🏠 SERVERS (GUILDS)".yellow.bold);
    if (accountInfo.guilds && accountInfo.guilds.guilds) {
      console.log(`Total Servers: ${accountInfo.guilds.count}`.white);
      const ownedServers = accountInfo.guilds.guilds.filter((g: any) => g.owner);
      console.log(`Owned Servers: ${ownedServers.length}`.white);
    }

    console.log("\n🤖 APPLICATIONS".yellow.bold);
    if (accountInfo.applications && accountInfo.applications.length > 0) {
      console.log(`Total Applications: ${accountInfo.applications.length}`.white);
      accountInfo.applications.forEach((app: any) => {
        console.log(`- ${app.name} ${app.verified ? "✅" : "❌"}`.white);
      });
    } else {
      console.log("No applications found".red);
    }

    console.log(`\n${"=".repeat(50).cyan}`);
  }
}

export default DiscordChecker;
