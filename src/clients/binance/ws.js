const Client = require("../Client.js");

class BinanceWS extends Client {
  constructor(config) {
    super(config);
  }

  async orderbook(fromTicker, toTicker) {
    // unimplemented!
  }
}

module.exports = BinanceWS;
