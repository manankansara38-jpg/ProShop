import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Message from '../components/Message';

const AdminErrorScreen = () => {
  return (
    <Container className='mt-5'>
      <Row className='justify-content-center'>
        <Col md={8}>
          <Message variant='danger'>
            <h2>⛔ Access Denied</h2>
            <p>You are not authorized to access the admin panel.</p>
            <p>Only administrators can access this area.</p>
          </Message>
          
          <div style={{ marginTop: '20px' }}>
            <Link to='/'>
              <Button variant='primary' className='me-2'>
                Continue Shopping
              </Button>
            </Link>
            <Link to='/admin'>
              <Button variant='secondary'>
                Back to Admin Login
              </Button>
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminErrorScreen;
