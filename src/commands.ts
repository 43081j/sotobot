import { Octokit } from '@octokit/core';
import { EmitterWebhookEvent } from '@octokit/webhooks/types';

type IssueCommentEvent = EmitterWebhookEvent<'issue_comment.created'> & {
  octokit: Octokit;
};

export interface CommandContext {
  octokit: Octokit;
  payload: IssueCommentEvent['payload'];
  args: string[];
}

export type CommandHandler = (context: CommandContext) => Promise<void>;
