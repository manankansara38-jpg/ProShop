import React, { useState } from 'react';
import { Table, Button, Form, Row, Col } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';
import { Link } from 'react-router-dom';

const OrderListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();
  const [query, setQuery] = useState('');

  const displayedOrders = (orders || []).filter((order) => {
    if (!query) return true;
    const q = query.trim();
    return (
      String(order._id).includes(q) ||
      (order.user && order.user.email && order.user.email.toLowerCase().includes(q.toLowerCase()))
    );
  });

  return (
    <div>
      <h1>Orders</h1>

      {isLoading && <Loader />}

      {error && (
        <Message variant='danger'>
          {(error && ((error.data && error.data.message) || error.error)) || 'Failed to load orders'}
        </Message>
      )}

      {!isLoading && !error && (
        <>
          <Row className='mb-3'>
            <Col md={6}>
              <Form.Control
                type='text'
                placeholder='Search by Order ID or user email...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Button variant='light' onClick={() => setQuery('')}>
                Clear
              </Button>
            </Col>
          </Row>

          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>USER</th>
                <th>EMAIL</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayedOrders.map((order) => (
                <tr
                  key={order._id}
                  style={order.paymentMethod === 'COD' ? { backgroundColor: 'lightskyblue', opacity: 0.95 } : {}}
                >
                  <td>{order._id}</td>
                  <td>{order.user && order.user.name}</td>
                  <td>{order.user && order.user.email}</td>
                  <td>{order.createdAt ? order.createdAt.substring(0, 10) : ''}</td>
                  <td>₹{order.totalPrice}</td>
                  <td>
                    {order.isPaid ? (
                      order.paidAt ? order.paidAt.substring(0, 10) : ''
                    ) : (
                      <FaTimes style={{ color: 'red' }} />
                    )}
                  </td>
                  <td>
                    {order.isDelivered ? (
                      order.deliveredAt ? order.deliveredAt.substring(0, 10) : ''
                    ) : (
                      <FaTimes style={{ color: 'red' }} />
                    )}
                  </td>
                  <td>
                    <Button as={Link} to={`/admin/order/${order._id}`} variant='light' className='btn-sm'>
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
};

export default OrderListScreen;
