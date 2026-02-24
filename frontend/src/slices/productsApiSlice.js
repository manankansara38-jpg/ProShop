import { PRODUCTS_URL } from '../constants';
import { apiSlice } from './apiSlice';

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ pageNumber = 1, keyword = '', getAll = false }) => {
        const params = { pageNumber };
        if (keyword) params.keyword = keyword;
        if (getAll) params.getAll = true;
        return { url: PRODUCTS_URL, params };
      },
      keepUnusedDataFor: 0,
      providesTags: ['Products'],
    }),
    getProductDetails: builder.query({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    createProduct: builder.mutation({
      // allow optional payload (e.g., { countInStock }) when creating products
      query: (data) => ({
        url: `${PRODUCTS_URL}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/${data.productId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Products'],
    }),
    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: `/api/upload`,
        method: 'POST',
        body: data,
      }),
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
    createReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/${data.productId}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    getTopProducts: builder.query({
      query: () => `${PRODUCTS_URL}/top`,
      keepUnusedDataFor: 5,
    }),
    getLatestProducts: builder.query({
      query: () => `${PRODUCTS_URL}/latest`,
      keepUnusedDataFor: 5,
    }),
    getHotProducts: builder.query({
      query: () => `${PRODUCTS_URL}/hot`,
      keepUnusedDataFor: 5,
    }),
    getProductsByCategory: builder.query({
      query: ({ category, subcategory }) => {
        const params = {};
        if (subcategory) {
          params.subcategory = subcategory;
        }
        return {
          url: `${PRODUCTS_URL}/category/${category}`,
          params,
        };
      },
      providesTags: ['Products'],
      keepUnusedDataFor: 5,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
  useDeleteProductMutation,
  useCreateReviewMutation,
  useGetTopProductsQuery,
  useGetLatestProductsQuery,
  useGetHotProductsQuery,
  useGetProductsByCategoryQuery,
} = productsApiSlice;
