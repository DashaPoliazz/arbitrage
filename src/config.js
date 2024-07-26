"use strict";

module.exports = {
  static: {
    port: 8000,
  },
  api: {
    port: 8001,
    transport: "ws",
  },
  sandbox: {
    timeout: 5000,
    displayErrors: false,
  },
};
