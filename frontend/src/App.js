import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { logout, setCredentials } from './slices/authSlice';
import { loadCartFromStorage } from './slices/cartSlice';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // Restore user session from sessionStorage if it's valid (tab-scoped)
    const expirationTime = sessionStorage.getItem('expirationTime');
    const userInfo = sessionStorage.getItem('userInfo');
    const currentTime = new Date().getTime();

    if (expirationTime && userInfo) {
      // If session has expired, clear everything
      if (currentTime > parseInt(expirationTime)) {
        dispatch(logout());
      } else {
        // Session is still valid, restore user to Redux
        try {
          const user = JSON.parse(userInfo);
          dispatch(setCredentials(user));
        } catch (error) {
          console.error('Error restoring session:', error);
          dispatch(logout());
        }
      }
    }
  }, [dispatch]);

  // Handle cart switching when user logs in or logs out
  useEffect(() => {
    if (userInfo) {
      // User just logged in - reload customer cart from localStorage
      console.log('USER LOGGED IN - Reloading customer cart from storage');
      dispatch(loadCartFromStorage());
    } else {
      // User is logged out - reload guest cart from localStorage
      console.log('USER LOGGED OUT - Reloading guest cart from storage');
      dispatch(loadCartFromStorage());
    }
  }, [userInfo, dispatch]);

  return (
    <>
      <ToastContainer />
      <Header />
      <main className='py-3'>
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default App;
