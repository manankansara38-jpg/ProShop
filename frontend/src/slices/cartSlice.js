import { createSlice } from '@reduxjs/toolkit';
import { updateCart } from '../utils/cartUtils';

// Helper to determine if user is logged in
const isUserLoggedIn = () => {
  const userInfo = sessionStorage.getItem('userInfo');
  const expirationTime = sessionStorage.getItem('expirationTime');
  const currentTime = new Date().getTime();
  return userInfo && expirationTime && currentTime <= parseInt(expirationTime);
};

// Helper to get cart from appropriate storage (guest = sessionStorage, user = localStorage)
const getCartFromStorage = () => {
  const storage = isUserLoggedIn() ? localStorage : sessionStorage;
  const cart = storage.getItem('cart');
  return cart ? JSON.parse(cart) : null;
};

const initialState = (() => {
  const cart = getCartFromStorage() || { cartItems: [], shippingAddress: {}, paymentMethod: 'Razorpay' };
  // Recalculate amounts when loading from storage to ensure they're set
  return updateCart(cart);
})();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      // NOTE: we don't need user, rating, numReviews or reviews
      // in the cart
      const { user, rating, numReviews, reviews, ...item } = action.payload;

      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }

      return updateCart(state, item);
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      return updateCart(state);
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      const storage = isUserLoggedIn() ? localStorage : sessionStorage;
      storage.setItem('cart', JSON.stringify(state));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      const storage = isUserLoggedIn() ? localStorage : sessionStorage;
      storage.setItem('cart', JSON.stringify(state));
    },
    clearCartItems: (state, action) => {
      state.cartItems = [];
      const storage = isUserLoggedIn() ? localStorage : sessionStorage;
      storage.setItem('cart', JSON.stringify(state));
    },
    // NOTE: here we need to reset state for when a user logs out so the next
    // user doesn't inherit the previous users cart and shipping
    resetCart: (state) => {
      localStorage.removeItem('cart');
      sessionStorage.removeItem('cart');
      state.cartItems = [];
      state.shippingAddress = {};
      state.paymentMethod = 'Razorpay';
    },
    // Load cart from appropriate storage based on login status
    loadCartFromStorage: (state) => {
      const storage = isUserLoggedIn() ? localStorage : sessionStorage;
      const savedCart = storage.getItem('cart');
      if (savedCart) {
        try {
          const cart = JSON.parse(savedCart);
          state.cartItems = cart.cartItems || [];
          state.shippingAddress = cart.shippingAddress || {};
          state.paymentMethod = cart.paymentMethod || 'Razorpay';
        } catch (error) {
          console.error('Error loading cart from storage:', error);
          state.cartItems = [];
          state.shippingAddress = {};
          state.paymentMethod = 'Razorpay';
        }
      } else {
        state.cartItems = [];
        state.shippingAddress = {};
        state.paymentMethod = 'Razorpay';
      }
      // Recalculate derived prices after loading cart items
      try {
        updateCart(state);
      } catch (err) {
        console.error('Error recalculating cart after load:', err);
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
  resetCart,
  loadCartFromStorage,
} = cartSlice.actions;

export default cartSlice.reducer;
