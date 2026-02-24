// Currency formatter for Indian Rupee
export const formatPrice = (price) => {
  return `₹${parseFloat(price).toFixed(2)}`;
};

export const CURRENCY_SYMBOL = '₹';
