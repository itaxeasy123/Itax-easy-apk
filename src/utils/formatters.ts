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

export function sanitizeNumberInput(value: string) {
  // Remove any character that is not a digit or decimal point
  let sanitized = value.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point exists
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Handle leading zeros (e.g., '012' -> '12', but keep '0.12')
  if (sanitized.length > 1 && sanitized.startsWith('0') && sanitized[1] !== '.') {
    sanitized = sanitized.replace(/^0+/, '');
  }
  
  return sanitized;
}
