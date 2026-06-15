import { Bot } from './bot.js';
import { WEBHOOK_PATH } from './constants.js';

export interface ServerOptions {
  privateKey: string;
  appId: string;
  webhookSecret: string;
}

export function createServer(bot: Bot) {
  return {
    async fetch(request: Request): Promise<Response> {
      const { pathname } = new URL(request.url);

      if (request.method === 'POST' && pathname === WEBHOOK_PATH) {
        return bot.handleRequest(request);
      }

      return new Response('Not found', { status: 404 });
    },
  };
}
