const { URL } = require("node:url");
const Client = require("../Client.js");

class KucoinHTTP extends Client {
  constructor(config) {
    super(config);
    this.name = "kucoin";
  }

  /**
   * https://www.kucoin.com/docs/rest/spot-trading/market-data/get-ticker
   *
   * @param {string} fromTicker
   * @param {string} toTicker
   * @param {number} limit
   */
  async orderbook(fromTicker, toTicker, limit = 1) {
    // building url up
    const url = new URL(this.config.endpoints.http.depth);
    const symbol = fromTicker.concat("-").concat(toTicker).toUpperCase();
    url.searchParams.append("symbol", symbol);
    // fetching orderbook data
    const response = await fetch(url);
    const result = await response.json();
    return result;
  }

  /**
   * https://www.kucoin.com/docs/rest/spot-trading/market-data/get-ticker
   *
   * @param {string} fromTicker
   * @param {string} toTicker
   * @param {number} limit
   */
  async getPrice(fromTicker, toTicker) {
    const url = new URL(this.config.endpoints.http.price);
    const symbol = fromTicker.concat("-").concat(toTicker).toUpperCase();
    url.pathname = `${url.pathname}/${symbol}/current`;
    // fetching orderbook data
    const response = await fetch(url);
    const result = await response.json();
    return result;
  }
}

class Adapter extends KucoinHTTP {
  STATUS_CODES = {
    SUCCESS: "2",
  };

  constructor(config, logger) {
    super(config);
    this.logger = logger;
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
    // Errors handling
    if (!originalShape.code.startsWith(this.STATUS_CODES.SUCCESS)) {
      this.logger.log(originalShape);
      return {
        isError: true,
        message: originalShape.msg,
        code: Number(originalShape.code),
      };
    }
    if (originalShape.data === null) {
      return {
        isError: true,
        message: "There is no data :(",
        code: Number(originalShape.code),
      };
    }
    // Normal flow
    const adaptedShape = {
      isError: false,
      lastUpdateId: originalShape.data.time,
      bids: [[originalShape.data.bestBid, originalShape.data.bestBidSize]],
      asks: [[originalShape.data.bestAsk, originalShape.data.bestAskSize]],
    };
    return adaptedShape;
  }

  /**
   * ```json
   * {
   *   "symbol": "ETHBTC",
   *   "price": 0.04784,
   * }
   * ```
   *
   * @param {string} fromTicker - The ticker symbol for the 'from' currency.
   * @param {string} toTicker - The ticker symbol for the 'to' currency.
   * @param {number} [limit=1] - The number of entries to retrieve. Defaults to 1.
   * @returns {Promise<{symbol: string, price: number}>} The order book data formatted as an object.
   */
  async getPrice(fromTicker, toTicker) {
    const originalShape = await super.getPrice(fromTicker, toTicker);
    // Error founded
    if (originalShape.msg && originalShape.code) {
      this.logger.log(originalShape);
      return {
        isError: true,
        message: originalShape.msg,
        code: Number(originalShape.code),
      };
    }
    if (originalShape.data === null) {
      return {
        isError: true,
        message: "There is no data :(",
        code: Number(originalShape.code),
      };
    }
    // Normal flow
    const adaptedShape = {
      isError: false,
      symbol: originalShape.data.symbol.split("-").join("").toUpperCase(),
      price: Number(originalShape.data.value),
    };
    return adaptedShape;
  }
}

module.exports = Adapter;
