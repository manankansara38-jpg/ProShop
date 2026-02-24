import { COUPONS_URL } from '../constants.js';
import { apiSlice } from './apiSlice.js';

export const couponsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActiveCoupons: builder.query({
      query: () => `${COUPONS_URL}/active`,
      providesTags: ['Coupon'],
    }),
    validateCoupon: builder.mutation({
      query: (data) => ({
        url: `${COUPONS_URL}/validate`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Coupon'],
    }),
    getUserCoupons: builder.query({
      query: () => `${COUPONS_URL}/user`,
      providesTags: ['Coupon'],
      keepUnusedDataFor: 0,  // Never cache - always fetch fresh
    }),
    createCoupon: builder.mutation({
      query: (data) => ({
        url: `${COUPONS_URL}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Coupon'],
    }),
    getCoupons: builder.query({
      query: () => `${COUPONS_URL}`,
      providesTags: ['Coupon'],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${COUPONS_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Coupon'],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `${COUPONS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupon'],
    }),
  }),
});

export const {
  useGetActiveCouponsQuery,
  useValidateCouponMutation,
  useGetUserCouponsQuery,
  useCreateCouponMutation,
  useGetCouponsQuery,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApiSlice;
