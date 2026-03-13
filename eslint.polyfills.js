// Node 16 polyfills for ESLint 9 compatibility.
// structuredClone: added in Node 17
if (!global.structuredClone) {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// AbortSignal.prototype.throwIfAborted: added in Node 17.3
if (
  typeof AbortSignal !== "undefined" &&
  !AbortSignal.prototype.throwIfAborted
) {
  AbortSignal.prototype.throwIfAborted = function () {
    if (this.aborted) {
      throw (
        this.reason ??
        new DOMException("signal is aborted without reason", "AbortError")
      );
    }
  };
}

// util.stripVTControlCharacters: added in Node 16.11.0 (we're on 16.10.0)
const util = require("util");
if (!util.stripVTControlCharacters) {
  util.stripVTControlCharacters = (str) =>
    str.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "");
}
