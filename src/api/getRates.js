({
  /**
   * Retrieves the current exchange rates for a given currency pair from multiple clients.
   *
   * The method queries each client for the current price of the specified currency pair,
   * and then collects these prices into a list. Each entry in the list includes the
   * price and the name of the exchange where the price was obtained.
   *
   * Example of the returned array:
   * ```json
   * [
   *   {
   *     "symbol": "ETHBTC",
   *     "price": 0.04796,
   *     "stockExchange": "binance"
   *   },
   *   {
   *     "symbol": "ETHBTC",
   *     "price": 0.04796,
   *     "stockExchange": "kucoin"
   *   }
   * ]
   * ```
   *
   * @param {Object} params - The parameters for retrieving the rates.
   * @param {string} params.inputCurrency - The ticker symbol of the input currency.
   * @param {string} params.outputCurrency - The ticker symbol of the output currency.
   * @returns {Promise<Array<{symbol: string, price: number, stockExchange: string}>>} A promise that resolves to an array of objects representing the rates from different exchanges.
   */
  async getRates({ inputCurrency, outputCurrency }) {
    const prices = [];
    for (const client of clients) {
      try {
        const price = await client.getPrice(inputCurrency, outputCurrency);
        prices.push({ ...price, stockExchange: client.name });
      } catch (error) {}
    }
    return prices;
  },
});
