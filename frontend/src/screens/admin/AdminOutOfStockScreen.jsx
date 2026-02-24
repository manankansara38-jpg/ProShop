import { Table, Button, Row, Col, Form } from 'react-bootstrap';
import { FaEdit, FaSync } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetProductsQuery, useUpdateProductMutation } from '../../slices/productsApiSlice';
import { toast } from 'react-toastify';
import { useState } from 'react';

const AdminOutOfStockScreen = () => {
  const { data, isLoading, error, refetch } = useGetProductsQuery({ pageNumber: 1 });
  const [updateProduct] = useUpdateProductMutation();
  const [restockQty, setRestockQty] = useState({});

  // Filter out of stock products
  const outOfStockProducts = data?.products?.filter((p) => p.countInStock === 0) || [];

  const restockHandler = async (productId, product) => {
    try {
      const newQty = parseInt(restockQty[productId]) || 0;
      if (newQty <= 0) {
        toast.error('Please enter a valid quantity');
        return;
      }

      await updateProduct({
        productId,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand,
        category: product.category,
        description: product.description,
        countInStock: newQty,
      }).unwrap();

      toast.success(`${product.name} restocked with ${newQty} items`);
      setRestockQty({ ...restockQty, [productId]: '' });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Row className='align-items-center mb-3'>
        <Col>
          <h1>⚠️ Out of Stock Products</h1>
        </Col>
        <Col className='text-end'>
          <Button variant='primary' onClick={() => refetch()}>
            <FaSync /> Refresh
          </Button>
        </Col>
      </Row>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : outOfStockProducts.length === 0 ? (
        <Message variant='success'>✅ All products are in stock!</Message>
      ) : (
        <>
          <Message variant='warning'>
            You have {outOfStockProducts.length} product(s) out of stock. Please restock them.
          </Message>
          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>STOCK</th>
                <th>RESTOCK QTY</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {outOfStockProducts.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>₹{product.price}</td>
                  <td>{product.category}</td>
                  <td>
                    <span style={{ color: 'red', fontWeight: 'bold' }}>
                      {product.countInStock}
                    </span>
                  </td>
                  <td>
                    <Form.Control
                      type='number'
                      min='1'
                      value={restockQty[product._id] || ''}
                      onChange={(e) =>
                        setRestockQty({
                          ...restockQty,
                          [product._id]: e.target.value,
                        })
                      }
                      placeholder='Enter qty'
                      style={{ width: '100px' }}
                    />
                  </td>
                  <td>
                    <Button
                      variant='success'
                      className='btn-sm mx-1'
                      onClick={() => restockHandler(product._id, product)}
                      disabled={!restockQty[product._id]}
                    >
                      <FaSync /> Restock
                    </Button>
                    <Button
                      as={Link}
                      to={`/admin/product/${product._id}/edit`}
                      variant='light'
                      className='btn-sm'
                    >
                      <FaEdit /> Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </>
  );
};

export default AdminOutOfStockScreen;
