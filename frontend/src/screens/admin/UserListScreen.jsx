import React, { useState } from 'react';
import { Table, Button, Form, Row, Col } from 'react-bootstrap';
import { FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import {
  useDeleteUserMutation,
  useGetUsersQuery,
} from '../../slices/usersApiSlice';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const UserListScreen = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  const [query, setQuery] = useState('');

  const [deleteUser] = useDeleteUserMutation();

  const displayedUsers = (users || []).filter((user) => {
    if (!query) return true;
    const q = query.trim();
    return (
      String(user._id).includes(q) ||
      (user.email && user.email.toLowerCase().includes(q.toLowerCase()))
    );
  });

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure')) {
      try {
        await deleteUser(id);
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <div>
      <h1>Users</h1>

      {isLoading && <Loader />}

      {error && (
        <Message variant='danger'>
          {(error && ((error.data && error.data.message) || error.error)) || 'Failed to load users'}
        </Message>
      )}

      {!isLoading && !error && (
        <>
          <Row className='mb-3'>
            <Col md={6}>
              <Form.Control
                type='text'
                placeholder='Search by User ID or email...'
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
                <th>NAME</th>
                <th>EMAIL</th>
                <th>ADMIN</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.name}</td>
                  <td>
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  </td>
                  <td>
                    {user.isAdmin ? (
                      <FaCheck style={{ color: 'green' }} />
                    ) : (
                      <FaTimes style={{ color: 'red' }} />
                    )}
                  </td>
                  <td>
                    {!user.isAdmin && (
                      <>
                        <Button
                          as={Link}
                          to={`/admin/user/${user._id}/edit`}
                          style={{ marginRight: '10px' }}
                          variant='light'
                          className='btn-sm'
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant='danger'
                          className='btn-sm'
                          onClick={() => deleteHandler(user._id)}
                        >
                          <FaTrash style={{ color: 'white' }} />
                        </Button>
                      </>
                    )}
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

export default UserListScreen;
