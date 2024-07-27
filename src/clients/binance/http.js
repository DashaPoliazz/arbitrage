const { URL } = require("node:url");
const Client = require("../Client.js");

class BinanceHTTP extends Client {
  constructor(config) {
    super(config);
    this.name = "binance";
  }

  /**
   * https://binance-docs.github.io/apidocs/spot/en/#order-book
   *
   * @param {string} fromTicker
   * @param {string} toTicker
   * @param {number} limit
   */
  async orderbook(fromTicker, toTicker, limit = 1) {
    // building url up
    const url = new URL(this.config.endpoints.http.depth);
    const symbol = fromTicker.concat(toTicker).toUpperCase();
    url.searchParams.append("symbol", symbol);
    url.searchParams.append("limit", limit);
    // fetching orderbook data
    const response = await fetch(url);
    const result = await response.json();
    return result;
  }

  /**
   * https://binance-docs.github.io/apidocs/spot/en/#trading-day-ticker
   *
   * @param {string} fromTicker
   * @param {string} toTicker
   */
  async getPrice(fromTicker, toTicker) {
    const url = new URL(this.config.endpoints.http.price);
    const symbol = fromTicker.concat(toTicker).toUpperCase();
    url.searchParams.append("symbol", symbol);
    // fetching orderbook data
    const response = await fetch(url);
    const result = await response.json();
    return result;
  }
}

class Adapter extends BinanceHTTP {
  constructor(config) {
    super(config);
  }

  async orderbook(fromTicker, toTicker, limit = 1) {
    const originalShape = await super.orderbook(fromTicker, toTicker, limit);
  }
  async getPrice(fromTicker, toTicker) {}
}

module.exports = BinanceHTTP;
