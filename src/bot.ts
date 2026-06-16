import { parseCommand } from './comments.js';
import { Driver, PRCommentCreatedEventDetail } from './drivers/types.js';
import { BotOptions } from './options.js';

export interface BotCommandEventDetail {
  bot: Bot;
  command: string;
  args: string[];
  repo: string;
  owner: string;
  pullRequestNumber: number;
  source: unknown;
}

export interface BotEventMap {
  botCommand: CustomEvent<BotCommandEventDetail>;
}

interface BotEventTarget extends EventTarget {
  addEventListener<TEvent extends keyof BotEventMap>(
    event: TEvent,
    listener: (ev: BotEventMap[TEvent]) => void,
  ): void;
  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void;
}

const eventTarget = EventTarget as {
  new (): BotEventTarget;
  prototype: BotEventTarget;
};

export class Bot extends eventTarget {
  readonly #driver: Driver;
  readonly #options: BotOptions;

  public get name(): string {
    return this.#options.name;
  }

  public get driver(): Driver {
    return this.#driver;
  }

  constructor(driver: Driver, options: BotOptions) {
    super();

    this.#driver = driver;
    this.#options = options;

    this.#driver.addEventListener(
      'pr.commentCreated',
      this.#onPRCommentCreated,
    );
  }

  handleRequest(request: Request): Promise<Response> {
    return this.#driver.handleRequest(request);
  }

  #onPRCommentCreated = async (
    ev: CustomEvent<PRCommentCreatedEventDetail<unknown>>,
  ): Promise<void> => {
    const command = parseCommand(this.#options.name, ev.detail.body);

    if (!command) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<BotCommandEventDetail>('botCommand', {
        detail: {
          bot: this,
          command: command.name,
          args: command.args,
          repo: ev.detail.repository,
          owner: ev.detail.owner,
          pullRequestNumber: ev.detail.pullRequestNumber,
          source: ev.detail.raw,
        },
      }),
    );
  };
}
