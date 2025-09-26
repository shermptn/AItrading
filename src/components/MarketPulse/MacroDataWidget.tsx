function useMacroQuotes(symbols: SymbolConfig[]) {
  return useQuery<Quote[]>({
    queryKey: ['macroQuotes', symbols.map(s => s.symbol).join(',')],
    queryFn: async () => {
      const promises = symbols.map(s =>
        apiGet<any>('quote', { symbol: s.symbol }).then(data => ({
          symbol: data.symbol,
          price: parseFloat(data.price || data.close || '0'),
          change: parseFloat(data.change || '0'),
          percent_change: parseFloat(data.percent_change || '0'),
        })).catch(() => ({ symbol: s.symbol, price: 0, change: 0, percent_change: 0 }))
      );
      return Promise.all(promises);
    },
    refetchInterval: 60000, // Refetch every 60 seconds instead of 30
  });
}
