({
  /**
   * Estimates the output amount of a given currency based on the best ask price
   * from different clients.
   *
   * The method queries the order book for each client to find the lowest ask price
   * for the specified currency pair. It then calculates the output amount using the
   * best ask price found and the provided input amount.
   *
   * Example of the returned object:
   * ```json
   * {
   *   "exchangeName": "binance",
   *   "outputAmount": 68162.01
   * }
   * ```
   *
   * @param {Object} params - The parameters for the estimate calculation.
   * @param {string} params.inputCurrency - The ticker symbol of the input currency.
   * @param {string} params.outputCurrency - The ticker symbol of the output currency.
   * @param {number} params.amount - The amount of the input currency to estimate.
   * @returns {Promise<{exchangeName: string, outputAmount: number}>} The estimated output amount and the exchange name.
   */
  async estimate({ inputCurrency, outputCurrency, amount }) {
    // To estimate correct priсe we have to
    // take the most higher ask of 'inputCurrencty-outputcurrencty'
    // from different client
    let bestAsk = { ask: Infinity, name: "" };
    for (const client of clients) {
      const orderbook = await client.orderbook(
        inputCurrency,
        outputCurrency,
        1,
      );
      console.log(orderbook, client.name);
      // finding the smallest ask
      const [ask] = orderbook.asks[0];
      if (ask < bestAsk.ask) bestAsk = { ask, name: client.name };
    }
    const exchangeName = bestAsk.name;
    const ouputAmount = bestAsk.ask * amount;
    return { exchangeName, ouputAmount };
  },
});
