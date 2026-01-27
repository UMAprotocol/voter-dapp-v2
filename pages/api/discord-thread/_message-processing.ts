import { DiscordMessageT, RawDiscordMessageT } from "types";
import { APIEmbed } from "discord-api-types/v10";

/**
 * Strips markdown headers (# ## ###) and converts them to bold text
 */
export function stripMarkdownHeaders(message: string): string {
  return message.replace(
    /#{1,3}\s+(.*?)$/gm,
    (_, p1: string) => `**${p1.trim()}**`
  );
}

/**
 * Fixes markdown bold formatting by trimming whitespace inside bold markers
 */
export function fixMarkdownBold(message: string): string {
  return message.replace(
    /\*\*(.*?)\*\*/g,
    (_, p1: string) => `**${p1.trim()}**`
  );
}

/**
 * Generates a Discord CDN avatar URL from userId and avatar hash
 */
export function discordPhoto(
  userId: string,
  userAvatar: string | null
): string | undefined {
  if (!userId || !userAvatar) return undefined;
  return `https://cdn.discordapp.com/avatars/${userId}/${userAvatar}`;
}

/**
 * Replaces Discord mention syntax (<@userId>) with formatted username
 */
export function replaceMentions(
  message: string,
  mentions: { id: string; username: string }[]
): string {
  let result = message;
  for (const entry of mentions) {
    result = result.replace(`<@${entry.id}>`, `**@${entry.username}**`);
  }
  return result;
}

/**
 * Replaces embed URLs with markdown links including embed titles
 */
export function replaceEmbeds(message: string, embeds: APIEmbed[]): string {
  let result = message;
  for (const embed of embeds) {
    if (embed?.url && embed?.title) {
      result = result.replace(
        `(${embed.url})`,
        `[${embed.title}](${embed.url})`
      );
    }
  }
  return result;
}

/**
 * Appends attachment links to the message content
 */
export function concatenateAttachments(
  message: string,
  attachments: {
    id: string;
    filename: string;
    proxy_url: string;
    url: string;
  }[]
): string {
  const concat: string[] = [];
  attachments.forEach((attachment, index) => {
    concat.push(
      `[Link ${index + 1}](${attachment.url || attachment.proxy_url})`
    );
  });

  return [message, concat.join(",  ")].join("\n");
}

/**
 * Processes raw Discord messages into a structured format with nested replies.
 * - Sanitizes markdown formatting
 * - Processes mentions and embeds
 * - Organizes messages into a tree structure with replies nested under parent messages
 */
export function processRawMessages(
  messages: RawDiscordMessageT[]
): DiscordMessageT[] {
  // First, process all messages into a flat structure
  const allProcessedMessages: (DiscordMessageT & {
    referencedMessageId?: string;
  })[] = messages
    .filter((message) => message.content != "")
    .map((msg: RawDiscordMessageT) => {
      try {
        const sanitized = fixMarkdownBold(stripMarkdownHeaders(msg.content));
        return {
          message: concatenateAttachments(
            replaceEmbeds(
              replaceMentions(sanitized, msg.mentions || []),
              msg.embeds || []
            ),
            msg.attachments || []
          ),
          sender: msg.author?.username || "Unknown",
          senderPicture: discordPhoto(msg.author?.id, msg.author?.avatar),
          time: Math.floor(new Date(msg.timestamp).getTime() / 1000),
          id: msg.id,
          referencedMessageId: msg.message_reference?.message_id,
        };
      } catch (error) {
        console.warn("Failed to process Discord message:", error, msg);
        return null;
      }
    })
    .filter(Boolean) as (DiscordMessageT & { referencedMessageId?: string })[];

  // Create a map of all messages by ID for quick lookup
  const messageMap = new Map<
    string,
    DiscordMessageT & { referencedMessageId?: string }
  >();
  allProcessedMessages.forEach((msg) => messageMap.set(msg.id, msg));

  // Helper function to find the root parent message ID
  function findRootParentId(messageId: string): string {
    const message = messageMap.get(messageId);
    if (!message || !message.referencedMessageId) {
      return messageId;
    }
    return findRootParentId(message.referencedMessageId);
  }

  // Separate top-level messages and replies
  const topLevelMessages: DiscordMessageT[] = [];
  const repliesMap = new Map<string, DiscordMessageT[]>();
  const orphanedReplies: DiscordMessageT[] = [];

  for (const message of allProcessedMessages) {
    const { referencedMessageId, ...cleanMessage } = message;

    if (!referencedMessageId) {
      topLevelMessages.push({
        ...cleanMessage,
        replies: [],
      } as DiscordMessageT);
    } else {
      const rootParentId = findRootParentId(referencedMessageId);
      const rootParent = messageMap.get(rootParentId);
      if (rootParent && !rootParent.referencedMessageId) {
        const existingReplies = repliesMap.get(rootParentId) || [];
        existingReplies.push(cleanMessage);
        repliesMap.set(rootParentId, existingReplies);
      } else {
        orphanedReplies.push(cleanMessage);
      }
    }
  }

  // Attach replies to their parent messages
  const finalMessages = topLevelMessages.map((message) => {
    const replies = repliesMap.get(message.id) || [];
    return {
      ...message,
      replies: replies,
    };
  });

  // Add orphaned replies as top-level messages
  orphanedReplies.forEach((orphanedReply) => {
    finalMessages.push({ ...orphanedReply, replies: [] });
  });

  return finalMessages;
}
