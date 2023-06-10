class NoOperationFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoOperationFoundError';
  }
}

export default NoOperationFoundError;
