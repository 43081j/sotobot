import { App } from '@octokit/app';
import { Bot, BotOptions } from './bot.js';

const botCache = new WeakMap<CreateBotOptions, Bot>();

export interface CreateBotOptions {
  privateKey: string;
  appId: string;
  webhookSecret: string;
  bot: BotOptions;
}

export function createBot(options: CreateBotOptions): Bot {
  const cachedBot = botCache.get(options);
  if (cachedBot) {
    return cachedBot;
  }

  const { privateKey, appId, webhookSecret } = options;
  const app = new App({
    appId,
    privateKey,
    webhooks: {
      secret: webhookSecret,
    },
  });

  const bot = new Bot(app, options.bot);
  botCache.set(options, bot);
  return bot;
}
