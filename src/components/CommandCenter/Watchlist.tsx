function useWatchlistQuotes() {
  return useQuery<Quote[]>({
    queryKey: ['watchlistQuotes'],
    queryFn: async () => {
      const promises = SYMBOLS.map(symbol =>
        apiGet<any>('quote', { symbol }).then(data => ({
          symbol: data.symbol,
          name: data.name,
          price: parseFloat(data.price || data.close || '0'),
          change: parseFloat(data.change || '0'),
          percent_change: parseFloat(data.percent_change || '0'),
        })).catch(e => ({ symbol, name: e.message, price: 0, change: 0, percent_change: 0 }))
      );
      return Promise.all(promises);
    },
    refetchInterval: 60000, // Refetch every 60 seconds instead of 15
  });
}
