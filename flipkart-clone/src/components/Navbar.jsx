import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cartCount } = useCart();
  const [search, setSearch] = useState('');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg" alt="Flipkart" />
        </Link>

        <div className="navbar-search">
            <input
                type="text"
                placeholder="Search for products, brands and more"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <button>
                <svg width="20" height="20" viewBox="0 0 17 18" xmlns="http://www.w3.org/2000/svg">
                    <g fill="#2874F1" fillRule="evenodd">
                        <path className="_34RNph" d="m11.618 9.897l4.225 4.212c.092.09.1.23.02.312l-1.464 1.46c-.08.08-.222.072-.314-.02L9.868 11.66M6.486 10.9c-2.42 0-4.38-1.955-4.38-4.367 0-2.413 1.96-4.37 4.38-4.37s4.38 1.957 4.38 4.37c0 2.412-1.96 4.368-4.38 4.368m0-10.834C2.904.066 0 2.96 0 6.533 0 10.105 2.904 13 6.486 13s6.487-2.895 6.487-6.467c0-3.572-2.905-6.467-6.487-6.467"></path>
                    </g>
                </svg>
            </button>
        </div>

        <div className="navbar-links">
            <div className="navbar-login">
                <button>Login</button>
            </div>
            <div className="navbar-cart">
                <Link to="/cart" style={{ display: 'flex', alignItems: 'center', color: 'white', textDecoration: 'none' }}>
                    <span>Cart</span>
                    {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                </Link>
            </div>
            <div className="navbar-more">
                <span>Become a Seller</span>
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
