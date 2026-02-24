import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';

import { logout } from './authSlice'; // Import the logout action

// NOTE: code here has changed to handle when our JWT and Cookie expire.
// We need to customize the baseQuery to be able to intercept any 401 responses
// and log the user out
// https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#customizing-queries-with-basequery

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  // include credentials so cookies (JWT) are sent with requests
  credentials: 'include',
});

async function baseQueryWithAuth(args, api, extra) {
  const result = await baseQuery(args, api, extra);
  // Dispatch the logout action on 401.
  if (result.error && result.error.status === 401) {
    let requestUrl = '';
    if (typeof args === 'object' && args) {
      requestUrl = args.url || '';
    } else if (typeof args === 'string') {
      requestUrl = args;
    }

    const path = requestUrl.split('?')[0];
    const isProtectedPath =
      path.startsWith('/api/orders') || path.startsWith('/api/users');

    try {
      console.warn('🔴 401 ERROR:', {
        url: requestUrl,
        path: path,
        isProtectedPath: isProtectedPath,
        willLogout: isProtectedPath,
      });
    } catch (e) {}

    // Only auto-logout for requests to protected endpoints (/api/orders, /api/users)
    // These endpoints always require authentication
    if (isProtectedPath) {
      api.dispatch(logout());
    }
  }
  return result;
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithAuth, // Use the customized baseQuery
  tagTypes: ['Product', 'Order', 'User', 'Coupon'],
  endpoints: (builder) => ({}),
});
