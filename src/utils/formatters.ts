export function formatYears(value: number) {
  if (!Number.isFinite(value)) {
    return '0';
  }

  const rounded = Number(value.toFixed(2));

  if (Number.isInteger(rounded)) {
    return String(rounded);
  }

  return rounded.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}

export function formatCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return '0.00';
  }

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
