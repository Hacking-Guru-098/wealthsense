export const formatINR = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

export const formatPct = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return `${Number(value).toFixed(1)}%`;
};
