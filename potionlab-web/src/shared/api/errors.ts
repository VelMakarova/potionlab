export class HttpError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`Request failed: ${status}`);
    this.status = status;
  }
}

export class InvalidResponseError extends Error {
  constructor() {
    super('Invalid API response');
  }
}
