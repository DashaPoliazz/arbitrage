class Client {
  name;
  config;

  constructor(config) {
    this.config = config;
  }

  async orderbook(fromTicker, toTicker, limit = 1) {
    throw new Error("abstract class is unimplemented");
  }

  async getPrice(fromTicker, toTicker) {
    throw new Error("abstract class is unimplemented");
  }
}

module.exports = Client;
