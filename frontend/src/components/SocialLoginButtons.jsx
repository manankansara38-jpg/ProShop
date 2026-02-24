import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { setCredentials } from '../slices/authSlice';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const SocialLoginButtons = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';
  

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name, sub: id } = decoded;

      // Send to backend
      const response = await axios.post('/api/oauth/callback', {
        email,
        name,
        id,
        provider: 'google',
      });

      dispatch(setCredentials({ ...response.data }));
      toast.success('Logged in with Google successfully!');

      // Handle admin redirect
      if (response.data.isAdmin) {
        sessionStorage.setItem('adminInfo', JSON.stringify(response.data));
        navigate('/admin/dashboard');
      } else {
        navigate(redirect);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google login failed');
    }
  };

  

  return (
    <div className='my-3'>
      <div className='text-center mb-3'>
        <p>Or continue with</p>
      </div>

      <Row className='gap-2'>
        <Col xs={12} md={4} className='mx-auto'>
          <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <div className='w-100 d-flex justify-content-center'>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google login failed')}
                text='signin'
                size='large'
              />
            </div>
          </GoogleOAuthProvider>
        </Col>
      </Row>

      <Row className='gap-2 mt-2'>
        {/* Only Google login available */}
      </Row>

      <div className='my-3' style={{ borderTop: '1px solid #ccc' }}></div>
    </div>
  );
};

export default SocialLoginButtons;
