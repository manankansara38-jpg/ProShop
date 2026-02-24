import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
  const [adminInfo, setAdminInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    try {
      // ONLY check sessionStorage - not Redux or localStorage
      const stored = sessionStorage.getItem('adminInfo');
      if (stored) {
        const admin = JSON.parse(stored);
        // Double check it's admin
        if (admin && admin.isAdmin === true) {
          setAdminInfo(admin);
          setIsLoading(false);
          return;
        }
      }

      // No valid admin session

      // No valid admin session
      setAdminInfo(null);
      setIsLoading(false);
    } catch (error) {
      console.error('Error reading admin session:', error);
      setAdminInfo(null);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Prefer Redux auth state (single source of truth). If the logged-in user
  // is an admin, allow access. Otherwise fall back to `sessionStorage.adminInfo`
  // which is used by the separate admin login flow.
  if (userInfo && userInfo.isAdmin) {
    return <Outlet />;
  }

  if (adminInfo && adminInfo.isAdmin) {
    return <Outlet />;
  }

  return <Navigate to='/admin' replace />;
};
export default AdminRoute;
