import { Container, Row, Col } from 'react-bootstrap';

const FormContainer = ({ children }) => {
  return (
    <Container>
      <Row className='justify-content-md-center'>
        <Col xs={12} md={6}>
          <div className='auth-card p-4 shadow-sm mt-5'>
            {children}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default FormContainer;
