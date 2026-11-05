export const discordLink = "https://discord.com/invite/jsb9XQJ";
export const evidenceRationalDiscordChannelId = "964000735073284127";
export const umaDiscordGuildId = "718590743446290492";
export const evidenceRationalDiscordChannelLink = `https://discord.com/channels/${umaDiscordGuildId}/${evidenceRationalDiscordChannelId}`;
export const discordToken = process.env.DISCORD_TOKEN ?? "";
// Temporary: while this bot's Message Content Intent review is pending, reads go
// through a scoped proxy on UMABot. Unset both to call Discord directly again.
export const discordProxyUrl = process.env.DISCORD_PROXY_URL ?? "";
export const discordProxyKey = process.env.DISCORD_PROXY_KEY ?? "";
