class HttpError extends Error{
  constructor(message, errorCode) {
    super(message); // call Parent's constructor
    this.code = errorCode; // add a "code" property
  }
}

module.exports = HttpError;