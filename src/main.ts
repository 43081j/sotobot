import { App } from '@octokit/app';
import { Bot, BotOptions } from './bot.js';

export interface CreateBotOptions {
  privateKey: string;
  appId: string;
  webhookSecret: string;
  bot: BotOptions;
}

export function createBot(options: CreateBotOptions): Bot {
  const { privateKey, appId, webhookSecret } = options;
  const app = new App({
    appId,
    privateKey,
    webhooks: {
      secret: webhookSecret,
    },
  });

  const bot = new Bot(app, options.bot);
  return bot;
}

export * from './commands.js';
