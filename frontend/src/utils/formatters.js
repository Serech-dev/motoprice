export function formatCurrencyARS(value) {
  if (value === null || value === undefined || isNaN(value)) return '$ 0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(value);
}

export function formatCurrencyUSD(value) {
  if (value === null || value === undefined || isNaN(value)) return 'US$ 0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
}

export function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return '0.0%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(1)}%`;
}

