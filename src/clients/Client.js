class Client {
  name;
  publicKey;
  #privateKey;

  constructor(config) {
    this.publicKey = config.publicKey;
    this.#privateKey = config.privateKey;
  }

  async orderbook(fromTicker, toTicker) {
    throw new Error("abstract class is unimplemnted");
  }
}

module.exports = Client;
