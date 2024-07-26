"use strict";

module.exports = {
  api: {
    port: 8000,
    transport: "ws",
  },
  sandbox: {
    timeout: 5000,
    displayErrors: false,
  },
  activeClients: ["binance"],
  clients: {
    binance: {
      httpConnection: true,
      wsConnection: false,
      publicKey: "foo",
      privateKey: "bar",
      endpoints: {
        http: {
          depth: "https://api.binance.com/api/v3/depth",
        },
      },
    },
  },
};
