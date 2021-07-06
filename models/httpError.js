class HttpError extends Error {
  constructor(message, code) {
    super(message);
    // error.code is a string label to identify the type of error (eg. ERR_HTTP_HEADERS_SENT )
    this.status = code;
  }
}

module.exports = HttpError;
