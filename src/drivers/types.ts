export interface PRCommentCreatedEventDetail<T> {
  body: string;
  raw: T;
  repository: string;
  owner: string;
  pullRequestNumber: number;
}

export interface DriverEventMap {
  error: CustomEvent<unknown>;
  'pr.commentCreated': CustomEvent<PRCommentCreatedEventDetail<unknown>>;
}

export interface Driver {
  handleRequest(request: Request): Promise<Response>;

  addEventListener<TEvent extends keyof DriverEventMap>(
    event: TEvent,
    listener: (ev: DriverEventMap[TEvent]) => void,
  ): void;
  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void;
}
