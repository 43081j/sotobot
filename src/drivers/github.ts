import { App } from '@octokit/app';
import type { Octokit } from '@octokit/core';
import { createWebMiddleware } from '@octokit/webhooks';
import type {
  HandlerFunction,
  WebhookEventHandlerError,
} from '@octokit/webhooks/types';
import { WEBHOOK_PATH } from '../constants.js';
import { hasWriteAccess } from '../octokit.js';
import { Driver, PRCommentCreatedEventDetail } from './types.js';

export interface GitHubDriverOptions {
  privateKey: string;
  appId: string;
  webhookSecret: string;
}

type IssueCommentCreatedEvent = Parameters<
  HandlerFunction<
    'issue_comment.created',
    {
      octokit: Octokit;
    }
  >
>[0];

export interface GitHubDriverEventMap {
  error: CustomEvent<unknown>;
  commentCreated: CustomEvent<
    PRCommentCreatedEventDetail<IssueCommentCreatedEvent>
  >;
}

export class GitHubDriver extends EventTarget implements Driver {
  readonly #app: App;
  readonly #middleware: (request: Request) => Promise<Response>;

  constructor(options: GitHubDriverOptions) {
    super();

    const { privateKey, appId, webhookSecret } = options;
    this.#app = new App({
      appId,
      privateKey,
      webhooks: {
        secret: webhookSecret,
      },
    });
    this.#app.webhooks.onError(this.#onError);
    this.#app.webhooks.on('issue_comment.created', this.#onIssueComment);

    this.#middleware = createWebMiddleware(this.#app.webhooks, {
      path: WEBHOOK_PATH,
    });
  }

  handleRequest(request: Request): Promise<Response> {
    return this.#middleware(request);
  }

  #onIssueComment: HandlerFunction<
    'issue_comment.created',
    {
      octokit: Octokit;
    }
  > = async (event): Promise<void> => {
    const { payload, octokit } = event;
    if (!payload.issue.pull_request) {
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

    this.dispatchEvent(
      new CustomEvent<PRCommentCreatedEventDetail<IssueCommentCreatedEvent>>(
        'pr.commentCreated',
        {
          detail: {
            raw: event,
            body: payload.comment.body || '',
            repository: payload.repository.name,
            owner: payload.repository.owner.login,
            pullRequestNumber: payload.issue.number,
          },
        },
      ),
    );
  };

  #onError = (error: WebhookEventHandlerError): void => {
    this.dispatchEvent(
      new CustomEvent('error', {
        detail: error,
      }),
    );
  };
}
