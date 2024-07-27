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
    console.log(url.toString());
    const response = await fetch(url);
    const result = await response.json();
    // TODO:
    // [ ] Move this logic to price adapter ?
    // [ ] Pass verification to get full-depth access to the orderbook
    const adaptedResult = {
      lastUpdateId: await result.data.time,
      bids: [
        [
          // price
          await result.data.bestBid,
          // qty
          await result.data.bestBidSize,
        ],
      ],
      asks: [
        [
          // price
          await result.data.bestAsk,
          await result.data.bestAskSize,
        ],
      ],
    };
    return adaptedResult;
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
    // url.searchParams.append("symbol", symbol);
    url.pathname = `${url.pathname}/${symbol}/current`;
    // fetching orderbook data
    const response = await fetch(url);
    const result = await response.json();
    console.log("RESULT", url);
    // TODO:
    // [ ] Move this logic to price adapter ?
    // [ ] Pass verification to get full-depth access to the orderbook
    const adaptedResult = {
      symbol: symbol.split("-").join(""),
      price: await result.data.value.toString(),
    };
    return adaptedResult;
  }
}

module.exports = KucoinHTTP;
