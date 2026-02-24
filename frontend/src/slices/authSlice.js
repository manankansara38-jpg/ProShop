import { createSlice } from '@reduxjs/toolkit';

let initialUser = null;
try {
  const stored = sessionStorage.getItem('userInfo');
  const expiration = sessionStorage.getItem('expirationTime');
  if (stored && expiration && Number(expiration) > Date.now()) {
    initialUser = JSON.parse(stored);
  } else {
    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('expirationTime');
  }
} catch (err) {
  initialUser = null;
}

const initialState = {
  userInfo: initialUser,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      sessionStorage.setItem('userInfo', JSON.stringify(action.payload));
      try {
        console.log('AUTH setCredentials', { payload: action.payload });
      } catch (e) {}
      // Set session expiration to 24 hours from now
      const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;
      sessionStorage.setItem('expirationTime', expirationTime.toString());
      
      // Get guest cart from sessionStorage (if exists)
      const guestCart = sessionStorage.getItem('cart');
      
      // Get user's existing cart from localStorage (default to empty)
      const existingUserCartStr = localStorage.getItem('cart');
      const userCart = existingUserCartStr 
        ? JSON.parse(existingUserCartStr)
        : { cartItems: [], shippingAddress: {}, paymentMethod: 'Razorpay' };
      
      if (guestCart) {
        try {
          const guestCartData = JSON.parse(guestCart);
          // Save guest cart for later restoration on logout
          sessionStorage.setItem('guestCart', guestCart);
          
          // Always merge guest items into user cart
          if (guestCartData.cartItems && guestCartData.cartItems.length > 0) {
            // Add guest items, merging duplicates by incrementing qty.
            // Be tolerant of item id fields: some carts use `_id`, others use `product`.
            guestCartData.cartItems.forEach((guestItem) => {
              const guestId = guestItem._id || guestItem.product;
              const existingItem = userCart.cartItems.find((x) => {
                const idA = x._id || x.product;
                return idA && guestId && idA.toString() === guestId.toString();
              });

              const guestQty = Number(guestItem.qty) || 0;

              if (existingItem) {
                existingItem.qty = (Number(existingItem.qty) || 0) + guestQty; // Merge quantities
              } else {
                // Ensure qty is a number
                const toAdd = { ...guestItem, qty: guestQty };
                userCart.cartItems.push(toAdd); // Add new item
              }
            });
          }
          
          sessionStorage.removeItem('cart'); // Clear guest cart from sessionStorage
        } catch (error) {
          console.error('Error merging guest cart:', error);
        }
      }
      
      // Save merged cart to localStorage
      localStorage.setItem('cart', JSON.stringify(userCart));
    },
    logout: (state, action) => {
      state.userInfo = null;
      sessionStorage.removeItem('userInfo');
      try {
        console.log('AUTH logout');
      } catch (e) {}
      sessionStorage.removeItem('expirationTime');
      
      // Clear guest/session cart data on logout but keep the user's saved
      // cart in localStorage so it persists across logout/login cycles.
      // This avoids deleting the customer's saved cart when they sign out.
      sessionStorage.removeItem('cart');
      sessionStorage.removeItem('guestCart');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
