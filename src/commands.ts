import type { Bot } from './bot.js';

export interface CommandContext {
  command: string;
  raw: unknown;
  args: string[];
  repo: string;
  owner: string;
  pullRequestNumber: number | undefined;
}

export type CommandHandler = (
  bot: Bot,
  context: CommandContext,
) => Promise<void>;
