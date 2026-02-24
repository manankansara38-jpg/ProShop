export const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

// NOTE: the code below has been changed from the course code to fix an issue
// with type coercion of strings to numbers.
// Our addDecimals function expects a number and returns a string, so it is not
// correct to call it passing a string as the argument.

export const updateCart = (state) => {
  // Calculate the items price in whole number (pennies) to avoid issues with
  // floating point number calculations
  const itemsPrice = state.cartItems.reduce(
    (acc, item) => {
      // Prefer discountPrice when present and lower than regular price
      const rawPrice = typeof item.discountPrice !== 'undefined' && item.discountPrice !== null && Number(item.discountPrice) < Number(item.price)
        ? Number(item.discountPrice)
        : Number(item.price);
      const unitPrice = Number.isNaN(rawPrice) ? 0 : rawPrice;
      return acc + (unitPrice * 100 * item.qty) / 100;
    },
    0
  );
  state.itemsPrice = addDecimals(itemsPrice);

  // Calculate the shipping price
  // 5% of items price if order > 1000, otherwise free shipping
  const shippingPrice = itemsPrice > 1000 ? itemsPrice * 0.05 : 0;
  state.shippingPrice = addDecimals(shippingPrice);

  // Calculate the tax price (15% of raw items total)
  const taxPrice = 0.15 * itemsPrice;
  state.taxPrice = addDecimals(taxPrice);

  // Total = items + shipping + tax
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  state.totalPrice = addDecimals(totalPrice);

  console.log('🛒 CART CALCULATION DEBUG:');
  console.log('  Items Total:', itemsPrice);
  console.log('  Shipping (5% if > 1000):', shippingPrice);
  console.log('  Tax (15%):', taxPrice);
  console.log('  Final Total:', totalPrice);

  // Save cart to appropriate storage:
  // - Logged-in users: localStorage (persists across sessions/tabs/logouts)
  // - Guests: sessionStorage (per-tab only, no sharing between tabs)
  const userInfo = sessionStorage.getItem('userInfo');
  const expirationTime = sessionStorage.getItem('expirationTime');
  const currentTime = new Date().getTime();
  const isLoggedIn = userInfo && expirationTime && currentTime <= parseInt(expirationTime);
  
  const storage = isLoggedIn ? localStorage : sessionStorage;
  storage.setItem('cart', JSON.stringify(state));

  return state;
};
