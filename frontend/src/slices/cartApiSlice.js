import { apiSlice } from './apiSlice';
import { CART_URL } from '../constants';

export const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => ({
        url: CART_URL,
      }),
      keepUnusedDataFor: 5,
    }),
    updateCart: builder.mutation({
      query: (cart) => ({
        url: CART_URL,
        method: 'PUT',
        body: cart,
      }),
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: CART_URL,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetCartQuery,
  useUpdateCartMutation,
  useClearCartMutation,
} = cartApiSlice;
