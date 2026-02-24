import { useState, useEffect } from 'react';
import { Row, Col, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';

const AdminDashboardScreen = () => {
  const [adminInfo, setAdminInfo] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('adminInfo');
      if (stored) {
        setAdminInfo(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error reading admin session:', error);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('adminInfo');
    dispatch(logout());
    navigate('/admin');
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <Row className='mb-4'>
        <Col md={8}>
          <h1>Welcome to Admin Dashboard, {adminInfo?.name}!</h1>
          <p className='text-muted'>Manage your e-commerce store</p>
        </Col>
        <Col md={4} className='text-end'>
          <Button variant='danger' onClick={handleLogout}>
            Logout
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={4} className='mb-4'>
          <Card>
            <Card.Body>
              <Card.Title>📦 Products</Card.Title>
              <Card.Text>Create, edit, or delete products</Card.Text>
              <Link to='/admin/productlist'>
                <Button variant='primary' className='w-100'>
                  Manage Products
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className='mb-4'>
          <Card>
            <Card.Body>
              <Card.Title>📋 Orders</Card.Title>
              <Card.Text>View and manage customer orders</Card.Text>
              <Link to='/admin/orderlist'>
                <Button variant='primary' className='w-100'>
                  View Orders
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className='mb-4'>
          <Card>
            <Card.Body>
              <Card.Title>👥 Users</Card.Title>
              <Card.Text>Manage users and permissions</Card.Text>
              <Link to='/admin/userlist'>
                <Button variant='primary' className='w-100'>
                  Manage Users
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardScreen;
