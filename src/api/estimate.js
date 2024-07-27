({
  /**
   * properly documented business-logic method description
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
      // finding the smallest ask
      const [ask] = orderbook.asks[0];
      if (ask < bestAsk.ask) bestAsk = { ask, name: client.name };
    }
    const exchangeName = bestAsk.name;
    const ouputAmount = bestAsk.ask * amount;
    return { exchangeName, ouputAmount };
  },
});
