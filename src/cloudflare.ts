import { Bot } from './bot.js';
import { WEBHOOK_PATH } from './constants.js';

type BotFactory = () => Promise<Bot>;
const botCache = new WeakMap<BotFactory, Bot>();

export function createServer(bot: Bot | BotFactory) {
  return {
    async fetch(request: Request): Promise<Response> {
      const { pathname } = new URL(request.url);
      let instance: Bot;
      if (typeof bot === 'function') {
        const existing = botCache.get(bot);
        if (existing) {
          instance = existing;
        } else {
          instance = await bot();
          botCache.set(bot, instance);
        }
      } else {
        instance = bot;
      }

      if (request.method === 'POST' && pathname === WEBHOOK_PATH) {
        return instance.handleRequest(request);
      }

      return new Response('Not found', { status: 404 });
    },
  };
}
