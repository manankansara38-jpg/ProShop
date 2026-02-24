import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Form, Button, Row, Col } from 'react-bootstrap';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';

const AdminLoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      
      // Check if this user is admin - REQUIRED
      if (!res.isAdmin) {
        alert('❌ Access Denied: You are not an administrator. Only admin accounts can access this panel.');
        setEmail('');
        setPassword('');
        return;
      }
      
      // Store in BOTH Redux (for API calls) and sessionStorage (for admin identity)
      dispatch(setCredentials({ ...res }));
      sessionStorage.setItem('adminInfo', JSON.stringify(res));
      navigate('/admin/dashboard');
    } catch (err) {
      alert(`❌ Login failed: ${err?.data?.message || err.error}`);
      setEmail('');
      setPassword('');
    }
  };

  return (
    <FormContainer>
      <h1 style={{ marginTop: '50px', marginBottom: '30px' }}>🔐 Admin Panel Login</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Only administrators can access this area. If you are a customer, please go back to the store.
      </p>
      
      <Form onSubmit={submitHandler}>
        <Form.Group className='my-2' controlId='email'>
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type='email'
            placeholder='Enter admin email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='password'>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Enter admin password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Button type='submit' variant='primary' className='mt-3' disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In as Admin'}
        </Button>
      </Form>

      {isLoading && <Loader />}

      <Row className='py-3'>
        <Col>
          <Link to='/' className='btn btn-secondary'>
            ← Back to Store
          </Link>
        </Col>
      </Row>


    </FormContainer>
  );
};

export default AdminLoginScreen;
