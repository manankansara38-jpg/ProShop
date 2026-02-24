import { Table, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
} from '../../slices/productsApiSlice';
import { toast } from 'react-toastify';

const ProductListScreen = () => {
  // Fetch ALL products for admin (no pagination limit)
  const { data, isLoading, error, refetch } = useGetProductsQuery({
    keyword: '',
    pageNumber: 1,
    getAll: true,
  });

  const [deleteProduct, { isLoading: loadingDelete }] =
    useDeleteProductMutation();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure')) {
      try {
        await deleteProduct(id);
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const [createProduct, { isLoading: loadingCreate }] =
    useCreateProductMutation();

  const [updateProduct] = useUpdateProductMutation();

  const createProductHandler = async () => {
    if (!window.confirm('Are you sure you want to create a new product?')) return;

    try {
      // Ask admin for initial quantity when creating a product
      const qtyStr = window.prompt('Enter initial quantity for this product (default 0):', '0');
      const qty = qtyStr !== null ? parseInt(qtyStr, 10) || 0 : 0;

      await createProduct({ countInStock: qty }).unwrap();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error || err);
    }
  };

  // Quick-update handler for out-of-stock products
  const quickUpdateQty = async (product) => {
    try {
      const qtyStr = window.prompt(
        `Update quantity for ${product.name}:`,
        String(product.countInStock || 0)
      );
      if (qtyStr === null) return; // cancelled
      const qty = parseInt(qtyStr, 10);
      if (isNaN(qty) || qty < 0) {
        return toast.error('Please enter a valid non-negative number');
      }

      // Send full product payload (update endpoint expects full fields)
      await updateProduct({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand,
        category: product.category,
        description: product.description,
        countInStock: qty,
      }).unwrap();

      toast.success('Quantity updated');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error || err);
    }
  };

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className='text-end'>
          <Button className='my-3' onClick={createProductHandler}>
            <FaPlus /> Create Product
          </Button>
        </Col>
      </Row>

      {loadingCreate && <Loader />}
      {loadingDelete && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || 'Error loading products'}</Message>
      ) : data && data.products && data.products.length > 0 ? (
        <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <Table striped bordered hover responsive className='table-sm mb-0'>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 10 }}>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th>STOCK</th>
                <th style={{ width: '180px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((product) => (
                <tr key={product._id}>
                  <td style={{ fontSize: '0.8rem' }}>{product._id.slice(0, 8)}...</td>
                  <td>{product.name}</td>
                  <td>₹{product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    {product.countInStock > 0 ? (
                      <span style={{ color: 'green', fontWeight: 'bold' }}>{product.countInStock}</span>
                    ) : (
                      <strong style={{ color: 'red' }}>Out Of Stock</strong>
                    )}
                  </td>
                  <td>
                    <Button
                      as={Link}
                      to={`/admin/product/${product._id}/edit`}
                      variant='light'
                      className='btn-sm mx-1'
                    >
                      <FaEdit />
                    </Button>
                    {product.countInStock === 0 && (
                      <Button
                        className='btn-sm mx-1'
                        style={{ backgroundColor: '#ff6b35', border: 'none', color: 'white' }}
                        onClick={() => quickUpdateQty(product)}
                      >
                        Qty
                      </Button>
                    )}
                    <Button
                      variant='danger'
                      className='btn-sm'
                      onClick={() => deleteHandler(product._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>      ) : (
        <Message>No products found</Message>
      )}
    </>
  );
};

export default ProductListScreen;
