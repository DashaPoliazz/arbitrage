class Client {
  name;
  config;

  constructor(config) {
    this.config = config;
  }

  async orderbook(fromTicker, toTicker, limit = 1) {
    throw new Error("abstract class is unimplemnted");
  }
}

module.exports = Client;
