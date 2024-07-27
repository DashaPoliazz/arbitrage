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

  /**
   * ```json
   * {
   *   "lastUpdateId": 1027024,
   *   "bids": [
   *     [
   *       "4.00000000",     // PRICE
   *       "431.00000000"    // QTY
   *     ]
   *   ],
   *   "asks": [
   *     [
   *       "4.00000200",     // PRICE
   *       "12.00000000"     // QTY
   *     ]
   *   ]
   * }
   * ```
   *
   * @param {string} fromTicker - The ticker symbol for the 'from' currency.
   * @param {string} toTicker - The ticker symbol for the 'to' currency.
   * @param {number} [limit=1] - The number of entries to retrieve. Defaults to 1.
   * @returns {Promise<{lastUpdateId: number, bids: Array<[string, string]>, asks: Array<[string, string]>}>} The formatted order book data.
   */
  async orderbook(fromTicker, toTicker, limit = 1) {
    const originalShape = await super.orderbook(fromTicker, toTicker, limit);
    return originalShape;
  }

  /**
   * ```json
   * {
   *   "symbol": "ETHBTC",
   *   "price": 0.04784,
   *   "stockExchange": "binance"
   * }
   * ```
   *
   * @param {string} fromTicker - The ticker symbol for the 'from' currency.
   * @param {string} toTicker - The ticker symbol for the 'to' currency.
   * @param {number} [limit=1] - The number of entries to retrieve. Defaults to 1.
   * @returns {Promise<{symbol: string, price: number, stockExchange: string}>} The order book data formatted as an object.
   */
  async getPrice(fromTicker, toTicker) {
    const originalShape = await super.getPrice(fromTicker, toTicker);
    return {
      ...originalShape,
      price: Number(originalShape.price),
    };
  }
}

module.exports = Adapter;
