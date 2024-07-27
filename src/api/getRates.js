({
  /**
   * properly documented business-logic method description
   */
  async getRates({ inputCurrency, outputCurrency }) {
    const prices = [];
    for (const client of clients) {
      const price = await client.getPrice(inputCurrency, outputCurrency);
      prices.push({ ...price, stockExchange: client.name });
    }
    return prices;
  },
});
