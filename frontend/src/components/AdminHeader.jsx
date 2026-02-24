import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slices/authSlice';
import logo from '../assets/logo.png';
import { useState, useEffect } from 'react';

const AdminHeader = () => {
  const [adminInfo, setAdminInfo] = useState(null);
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('adminInfo');
      if (stored) {
        setAdminInfo(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error reading admin info:', error);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('adminInfo');
    dispatch(logout());
    navigate('/admin');
  };

  return (
    <header>
      <Navbar bg='danger' variant='dark' expand='lg' collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to='/'>
            <img src={logo} alt='ProShop' />
            ProShop - Admin Panel
          </Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto'>
              <NavDropdown title={`🔐 ${
                userInfo?.isAdmin ? userInfo.name : adminInfo?.name || 'Admin'
              }`} id='adminmenu'>
                <NavDropdown.Item as={Link} to='/admin/dashboard'>
                  Dashboard
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to='/admin/productlist'>
                  Products
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to='/admin/orderlist'>
                  Orders
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to='/admin/userlist'>
                  Users
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default AdminHeader;
