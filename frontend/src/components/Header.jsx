import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaSearch, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import SearchBox from './SearchBox';
import logo from '../assets/logo.png';
import { resetCart } from '../slices/cartSlice';
import { useClearCartMutation } from '../slices/cartApiSlice';

const Header = () => {
  const { cartItems = [] } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();
  const [clearCartApi] = useClearCartMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
    } catch (err) {
      console.error(err);
    }
    
    // Always logout locally, but KEEP the cart (don't clear it)
    dispatch(logout());
    navigate('/');
  };

  return (
    <header>
      <Navbar bg='primary' variant='dark' expand='lg' collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to='/' className='navbar-brand-mobile'>
            <img src={logo} alt='ProShop' />
            ProShop
          </Navbar.Brand>
          
          {/* Mobile: Search icon, Cart, and Hamburger */}
          <Nav className='d-lg-none ms-auto navbar-mobile-actions'>
            {showMobileSearch ? (
              <div className='mobile-search-expanded'>
                <SearchBox />
                <button 
                  className='search-close-btn'
                  onClick={() => setShowMobileSearch(false)}
                  type='button'
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <button
                className='navbar-search-icon-btn'
                onClick={() => setShowMobileSearch(true)}
                type='button'
              >
                <FaSearch />
              </button>
            )}
            <Nav.Link as={Link} to='/cart' className='navbar-cart-link'>
              <FaShoppingCart />
              {cartItems.length > 0 && (
                <Badge pill bg='success' className='cart-badge'>
                  {cartItems.reduce((a, c) => a + c.qty, 0)}
                </Badge>
              )}
            </Nav.Link>
            {userInfo ? (
              <>
                <Nav.Link as={Link} to='/profile' className='navbar-user-mobile'>
                  {userInfo.name.split(' ')[0]}
                </Nav.Link>
                <button className='navbar-logout-btn' onClick={logoutHandler} type='button' aria-label='Logout'>
                  <FaSignOutAlt />
                </button>
              </>
            ) : (
              <Nav.Link as={Link} to='/login' className='navbar-signin-link'>
                <FaUser />
              </Nav.Link>
            )}
          </Nav>

          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto'>
              <Nav.Link as={Link} to='/category/Electronics' className='fw-bold'>
                ⚡ Electronics
              </Nav.Link>
              <NavDropdown title='👕 Clothes' id='clothes-nav' className='fw-bold'>
                <NavDropdown.Item as={Link} to='/category/Clothes?subcategory=man'>
                  Men
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to='/category/Clothes?subcategory=female'>
                  Women
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to='/category/Clothes?subcategory=kids'>
                  Kids
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link as={Link} to='/category/Vegetables' className='fw-bold'>
                🥕 Vegetables
              </Nav.Link>
              <Nav.Link as={Link} to='/category/Medicine' className='fw-bold'>
                💊 Medicine
              </Nav.Link>
              
              {/* Desktop: SearchBox and Cart visible here */}
              <div className='d-none d-lg-flex align-items-center gap-3 ms-3'>
                <SearchBox />
                <Nav.Link as={Link} to='/cart'>
                  <FaShoppingCart /> Cart
                  {cartItems.length > 0 && (
                    <Badge pill bg='success' style={{ marginLeft: '5px' }}>
                      {cartItems.reduce((a, c) => a + c.qty, 0)}
                    </Badge>
                  )}
                </Nav.Link>
              </div>
              
              {userInfo ? (
                <>
                  <NavDropdown title={userInfo.name} id='username'>
                    <NavDropdown.Item as={Link} to='/profile'>
                      Profile
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={logoutHandler}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <Nav.Link as={Link} to='/login'>
                  <FaUser /> Sign In
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
