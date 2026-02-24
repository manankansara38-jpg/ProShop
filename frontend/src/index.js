import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/bootstrap.custom.css';
import './assets/styles/index.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import RegisterScreen from './screens/RegisterScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import ProfileScreen from './screens/ProfileScreen';
import OrderListScreen from './screens/admin/OrderListScreen';
import ProductListScreen from './screens/admin/ProductListScreen';
import ProductEditScreen from './screens/admin/ProductEditScreen';
import UserListScreen from './screens/admin/UserListScreen';
import UserEditScreen from './screens/admin/UserEditScreen';
import AdminOrderDetailScreen from './screens/admin/AdminOrderDetailScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminErrorScreen from './screens/AdminErrorScreen';
import AdminAppLayout from './components/AdminAppLayout';
import store from './store';
import { Provider } from 'react-redux';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* MAIN STORE APP - Customer Side */}
      <Route path='/' element={<App />}>
        <Route index={true} path='/' element={<HomeScreen />} />
        <Route path='/search/:keyword' element={<HomeScreen />} />
        <Route path='/page/:pageNumber' element={<HomeScreen />} />
        <Route
          path='/search/:keyword/page/:pageNumber'
          element={<HomeScreen />}
        />
        <Route path='/category/:category' element={<HomeScreen />} />
        <Route path='/product/:id' element={<ProductScreen />} />
        <Route path='/cart' element={<CartScreen />} />
        <Route path='/login' element={<LoginScreen />} />
        <Route path='/forgot-password' element={<ForgotPasswordScreen />} />
        <Route path='/password/reset/:token' element={<ResetPasswordScreen />} />
        <Route path='/register' element={<RegisterScreen />} />
        
        {/* Registered users only */}
        <Route path='' element={<PrivateRoute />}>
          <Route path='/shipping' element={<ShippingScreen />} />
          <Route path='/payment' element={<PaymentScreen />} />
          <Route path='/placeorder' element={<PlaceOrderScreen />} />
          <Route path='/order/:id' element={<OrderScreen />} />
          <Route path='/profile' element={<ProfileScreen />} />
        </Route>
      </Route>

      {/* ADMIN AREA - COMPLETELY SEPARATE */}
      <Route path='/admin' element={<AdminLoginScreen />} />
      
      {/* Admin Protected Routes */}
      <Route path='/admin' element={<AdminRoute />}>
        <Route element={<AdminAppLayout />}>
          <Route path='dashboard' element={<AdminDashboardScreen />} />
          <Route path='productlist' element={<ProductListScreen />} />
          <Route path='orderlist' element={<OrderListScreen />} />
          <Route path='order/:id' element={<AdminOrderDetailScreen />} />
          <Route path='userlist' element={<UserListScreen />} />
          <Route path='product/:id/edit' element={<ProductEditScreen />} />
          <Route path='user/:id/edit' element={<UserEditScreen />} />
        </Route>
      </Route>
    </>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);

reportWebVitals();
