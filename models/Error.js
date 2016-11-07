/* jshint esnext: true */
module.exports = class ErrorMessage {
  constructor(msg, code) {
    this.message = msg || 'UnKnown Error';
    this.code = code || 520;
  }
};
