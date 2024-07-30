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
  async estimate({ inputCurrency, outputCurrency, amount = 1 }) {
    let bestPrice = { price: Infinity, name: "" };
    for (const client of clients) {
      let directPair = await client.orderbook(inputCurrency, outputCurrency, 1);
      // We have to consider few cases:
      // 1. If pair "I-O" exists, and we can obtain it directly
      if (!directPair.isError) {
        const [ask] = directPair.asks[0];
        if (ask < bestPrice.price)
          bestPrice = { price: ask, name: client.name };
        continue;
      }
      // 2. If it doesn't
      //    Maybe reversed ratio exists "O-I"
      const reversedPair = await client.orderbook(
        outputCurrency,
        inputCurrency,
        1,
      );
      if (!reversedPair.isError) {
        const [ask] = reversedPair.asks[0];
        // Since the ratio is revert, we have to revert it again to get direct pair
        const normalizedPrice = 1 / ask;
        if (normalizedPrice < bestPrice.price)
          bestPrice = { price: normalizedPrice, name: client.name };
        continue;
      }

      //    We will try to derive the price from "INPUT-USDT" & "OUTPUT-USDT"
      const inputUsdtPair = await client.orderbook(inputCurrency, "USDT", 1);
      //    if we can't obtain inputUsdtPair, then it's impossible to derive pair "InputCurrencty/OutputCurrency"
      if (inputUsdtPair.isError) continue;
      //    otherwise, we can try to fetch "OUTPUT-USDT"
      const outputUsdtPair = await client.orderbook(outputCurrency, "USDT", 1);
      //    if we can't obtain outputUsdtPair, then it's impossible to derive pair "InputCurrencty/OutputCurrency"
      if (outputUsdtPair.isError) continue;

      const derivedPrice = inputUsdtPair.asks[0][0] / outputUsdtPair.asks[0][0];
      //    checking whether it's the lowest ask across all stock exchanges
      if (derivedPrice < bestPrice.price) {
        bestPrice = { price: derivedPrice, name: client.name };
      }
    }
    const exchangeName = bestPrice.name;
    const outputAmount = bestPrice.price * amount;
    return exchangeName.length
      ? { exchangeName, outputAmount }
      : `Cannot estimate ${inputCurrency}-${outputCurrency}`;
  },
});
