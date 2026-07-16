// lib/currency.ts
export function formatCurrency(amount: number, currencyCode: string, currencies: any[]) {
  const currency = currencies.find(c => c.code === currencyCode);
  const symbol = currency?.symbol || '$';
  
  // Formatear según la moneda
  if (currencyCode === 'PYG' || currencyCode === 'VES') {
    // Para monedas con muchos decimales
    return `${symbol}${amount.toFixed(0)}`;
  }
  
  return `${symbol}${amount.toFixed(2)}`;
}