/**
 * Formats a number as currency with thousands separators and no decimal places
 * @param {number} amount - The amount to format
 * @param {string} currencySymbol - The currency symbol to use (default: '$')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencySymbol = '$') => {
  // Handle null, undefined, or NaN values
  if (amount == null || isNaN(amount)) {
    return `${currencySymbol}0`;
  }
  
  // Format with thousands separators and no decimal places
  return `${currencySymbol}${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

/**
 * Formats a number as currency with sign prefix (+ or -) and thousands separators
 * @param {number} amount - The amount to format 
 * @param {string} currencySymbol - The currency symbol to use (default: '$')
 * @returns {string} Formatted currency string with sign
 */
export const formatCurrencyWithSign = (amount, currencySymbol = '$') => {
  if (amount == null || isNaN(amount)) {
    return `${currencySymbol}0`;
  }
  
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}${formatCurrency(amount, currencySymbol)}`;
};
