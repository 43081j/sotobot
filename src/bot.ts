import { App } from '@octokit/app';
import type { Octokit } from '@octokit/core';
import { createWebMiddleware } from '@octokit/webhooks';
import type {
  EmitterWebhookEvent,
  WebhookEventHandlerError,
} from '@octokit/webhooks/types';
import { parseCommand } from './comments.js';
import { WEBHOOK_PATH } from './constants.js';
import { hasWriteAccess } from './octokit.js';

type WebhookMiddleware = (request: Request) => Promise<Response>;

type IssueCommentEvent = EmitterWebhookEvent<'issue_comment.created'> & {
  octokit: Octokit;
};

export interface CommandContext {
  octokit: Octokit;
  payload: IssueCommentEvent['payload'];
  args: string[];
}

export type CommandHandler = (context: CommandContext) => Promise<void>;

export interface BotOptions {
  name: string;
}

export class Bot {
  readonly #app: App;
  readonly #middleware: WebhookMiddleware;
  readonly #commands = new Map<string, CommandHandler>();
  readonly #options: BotOptions;

  constructor(app: App, options: BotOptions) {
    this.#options = options;
    this.#app = app;

    this.#app.webhooks.onError(this.#onError);
    this.#app.webhooks.on('issue_comment.created', this.#onIssueComment);

    this.#middleware = createWebMiddleware(this.#app.webhooks, {
      path: WEBHOOK_PATH,
    });
  }

  addCommand(name: string | string[], fn: CommandHandler): void {
    if (Array.isArray(name)) {
      for (const n of name) {
        this.#commands.set(n, fn);
      }
    } else {
      this.#commands.set(name, fn);
    }
  }

  handleRequest(request: Request): Promise<Response> {
    return this.#middleware(request);
  }

  #onIssueComment = async ({
    octokit,
    payload,
  }: IssueCommentEvent): Promise<void> => {
    if (!payload.issue.pull_request) {
      return;
    }

    const command = parseCommand(this.#options.name, payload.comment.body);
    if (!command) {
      return;
    }

    const handler = this.#commands.get(command.name);
    if (!handler) {
      return;
    }

    const username = payload.comment.user?.login;
    if (!username) {
      return;
    }

    const allowed = await hasWriteAccess(
      octokit,
      payload.repository.owner.login,
      payload.repository.name,
      username,
    );
    if (!allowed) {
      return;
    }

    await handler({ octokit, payload, args: command.args });
  };

  #onError = (error: WebhookEventHandlerError): void => {
    console.error('Webhook handler error', error);
  };
}
