import { Bot } from './bot.js';
import { BotOptions } from './options.js';
import { Driver } from './drivers/types.js';

export function createBot(options: BotOptions, driver: Driver): Bot {
  const bot = new Bot(driver, options);
  return bot;
}

export { Bot, type BotCommandEventDetail, type BotEventMap } from './bot.js';
export * from './commands.js';
export * from './drivers/types.js';
export * from './drivers/github.js';
