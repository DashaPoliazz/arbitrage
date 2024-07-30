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
      const price = await client.getPrice(inputCurrency, outputCurrency);

      // We have to consider few cases:
      // 1. If pair "I-O" exists, and we can just add it to prices
      if (!price.isError) {
        prices.push({ ...price, stockExchange: client.name });
        continue;
      }
      // 2. If it doesn't
      //    Maybe reversed ratio exists "O-I"
      const reversedPair = await client.getPrice(outputCurrency, inputCurrency);
      if (!reversedPair.isError) {
        const price = reversedPair.price;
        // Since the ratio is revert, we have to revert it again to get direct pair
        const normalizedPrice = 1 / price;
        prices.push({
          isError: false,
          symbol: `${inputCurrency}${outputCurrency}`,
          price: normalizedPrice,
          stockExchange: client.name,
        });
        continue;
      }

      //    We will try to derive the price from "INPUT-USDT" & "OUTPUT-USDT"
      const inputUsdtPair = await client.getPrice(inputCurrency, "USDT");
      //    if we can't obtain inputUsdtPair, then it's impossible to derive pair "InputCurrencty/OutputCurrency"
      if (inputUsdtPair.isError) continue;
      //    otherwise, we can try to fetch "OUTPUT-USDT"
      const outputUsdtPair = await client.getPrice(outputCurrency, "USDT");
      //    if we can't obtain outputUsdtPair, then it's impossible to derive pair "InputCurrencty/OutputCurrency"
      if (outputUsdtPair.isError) continue;

      const derivedPrice = inputUsdtPair.price / outputUsdtPair.price;
      //    checking whether it's the lowest ask across all stock exchanges
      prices.push({
        isError: false,
        symbol: `${inputCurrency}${outputCurrency}`,
        price: derivedPrice,
        stockExchange: client.name,
      });
    }
    return prices;
  },
});
