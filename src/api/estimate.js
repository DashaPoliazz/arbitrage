({
  /**
   * properly documented business-locig method description
   */
  async estimate({ inputCurrency, outputCurrency, amount }) {
    // To estimate correct priсe we have to:
    //  1. Take the most higher ask of 'inputCurrencty-outputcurrencty' from different client
    let bestAsk = { ask: Infinity, name: "" };
    for (const client of clients) {
      const orderbook = await client.orderbook(
        inputCurrency,
        outputCurrency,
        1,
      );

      //   {
      // 	lastUpdateId: 34592313711,
      // 	bids: [ [ '3262.39000000', '5.90450000' ] ],
      // 	asks: [ [ '3262.40000000', '28.13780000' ] ]
      //   }

      // finding the smallest ask
      const [ask] = orderbook.asks[0];
      if (ask < bestAsk.ask) bestAsk = { ask, name: client.name };
    }
    const exchangeName = bestAsk.name;
    const ouputAmount = bestAsk.ask * amount;
    return { exchangeName, ouputAmount };
  },
});
