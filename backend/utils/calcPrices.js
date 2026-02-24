function addDecimals(num) {
  return (Math.round(num * 100) / 100).toFixed(2);
}

// NOTE: the code below has been changed from the course code to fix an issue
// with type coercion of strings to numbers.
// Our addDecimals function expects a number and returns a string, so it is not
// correct to call it passing a string as the argument.

export function calcPrices(orderItems) {
  // Calculate the items price in whole number (pennies) to avoid issues with
  // floating point number calculations
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + (item.price * 100 * item.qty) / 100,
    0
  );

  console.log('🔍 CALC PRICES FUNCTION DEBUG:');
  console.log(`  Items Count: ${orderItems.length}`);
  console.log(`  Calculated itemsPrice: ${itemsPrice}`);
  console.log(`  Is itemsPrice > 1000? ${itemsPrice} > 1000 = ${itemsPrice > 1000}`);

  // Calculate the shipping price
  // 5% of items price if order > 1000, otherwise free shipping
  const shippingPrice = itemsPrice > 1000 ? itemsPrice * 0.05 : 0;
  
  console.log(`  Calculated shippingPrice: ${shippingPrice}`);

  // Calculate the tax price (15% of raw items total)
  const taxPrice = 0.15 * itemsPrice;
  console.log(`  Calculated taxPrice: ${taxPrice}`);

  // Calculate the total price (items + shipping + tax)
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  console.log(`  Calculated totalPrice: ${totalPrice}`);

  // return prices as strings fixed to 2 decimal places
  return {
    itemsPrice: addDecimals(itemsPrice),
    shippingPrice: addDecimals(shippingPrice),
    taxPrice: addDecimals(taxPrice),
    totalPrice: addDecimals(totalPrice),
  };
}
