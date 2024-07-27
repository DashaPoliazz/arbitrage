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
  activeClients: ["binance", "kucoin"],
  clients: {
    binance: {
      httpConnection: true,
      wsConnection: false,
      publicKey: "foo",
      privateKey: "bar",
      endpoints: {
        http: {
          depth: "https://api.binance.com/api/v3/depth",
          price: "https://api.binance.com/api/v3/ticker/price",
        },
      },
    },
    kucoin: {
      httpConnection: true,
      wsConnection: false,
      publicKey: "foo",
      privateKey: "bar",
      endpoints: {
        http: {
          depth: "https://api.kucoin.com/api/v1/market/orderbook/level1",
          price: "https://api.kucoin.com/api/v1/mark-price",
        },
      },
    },
  },
};
