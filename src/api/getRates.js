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
   *     "isError": false,
   *     "symbol": "USDTBTC",
   *     "price": 0.000015097074187022554,
   *     "stockExchange": "binance"
   *   },
   *   {
   *     "isError": false,
   *     "symbol": "USDTBTC",
   *     "price": 0.0000151,
   *     "stockExchange": "kucoin"
   *   }
   * ]
   * ```
   *
   * @param {Object} params - The parameters for retrieving the rates.
   * @param {string} params.baseCurrency - The ticker symbol of the input currency.
   * @param {string} params.quoteCurrency - The ticker symbol of the output currency.
   * @returns {Promise<Array<{symbol: string, price: number, stockExchange: string}>>} A promise that resolves to an array of objects representing the rates from different exchanges.
   */
  async getRates({ baseCurrency, quoteCurrency }) {
    const prices = [];
    for (const client of clients) {
      const price = await client.getPrice(baseCurrency, quoteCurrency);

      // We have to consider few cases:
      // 1. If pair "I-O" exists, and we can just add it to prices
      if (!price.isError) {
        prices.push({ exchangeName: client.name, rate: price.price });
        continue;
      }
      // 2. If it doesn't
      //    Maybe reversed ratio exists "O-I"
      const reversedPair = await client.getPrice(quoteCurrency, baseCurrency);
      if (!reversedPair.isError) {
        const price = reversedPair.price;
        // Since the ratio is revert, we have to revert it again to get direct pair
        const normalizedPrice = 1 / price;
        prices.push({
          exchangeName: client.name,
          rate: normalizedPrice,
        });
        continue;
      }

      //    We will try to derive the price from "INPUT-USDT" & "OUTPUT-USDT"
      const inputUsdtPair = await client.getPrice(baseCurrency, "USDT");
      //    if we can't obtain inputUsdtPair, then it's impossible to derive pair "InputCurrencty/quoteCurrency"
      if (inputUsdtPair.isError) continue;
      //    otherwise, we can try to fetch "OUTPUT-USDT"
      const outputUsdtPair = await client.getPrice(quoteCurrency, "USDT");
      //    if we can't obtain outputUsdtPair, then it's impossible to derive pair "InputCurrencty/quoteCurrency"
      if (outputUsdtPair.isError) continue;

      const derivedPrice = inputUsdtPair.price / outputUsdtPair.price;
      //    checking whether it's the lowest ask across all stock exchanges
      prices.push({
        exchangeName: client.name,
        rate: derivedPrice,
      });
    }
    return prices;
  },
});
