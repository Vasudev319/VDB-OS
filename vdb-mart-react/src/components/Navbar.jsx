import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, login, logout } = useAuth();
  const [search, setSearch] = useState('');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span style={{color:'white', fontSize: '20px', fontWeight: 'bold', fontStyle: 'italic'}}>VDB Mart</span>
        </Link>

        <div className="navbar-search">
            <input
                type="text"
                placeholder="Search for products, brands and more"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {!user ? (
                <Link to="/login" style={{ background: 'white', color: '#2874F1', padding: '5px 20px', fontWeight: 'bold', border: 'none', cursor: 'pointer', textDecoration: 'none' }}>Login</Link>
            ) : (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                   <span style={{ color: 'white' }}>Hi, {user.name}</span>
                   {user.role === 'admin' && <Link to="/admin" style={{ color: 'white' }}>Admin Panel</Link>}
                   {user.role === 'seller' && <Link to="/seller" style={{ color: 'white' }}>Seller Panel</Link>}
                   {user.role === 'delivery' && <Link to="/delivery" style={{ color: 'white' }}>Delivery Panel</Link>}
                   <button onClick={logout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 10px', cursor: 'pointer' }}>Logout</button>
                </div>
            )}

            <div className="navbar-cart">
                <Link to="/cart" style={{ display: 'flex', alignItems: 'center', color: 'white', textDecoration: 'none' }}>
                    <span>Cart</span>
                    {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                </Link>
            </div>
        </div>
      </div>
      <style>{`
        .dropdown-content { display: none; }
        .dropdown:hover .dropdown-content { display: block; }
      `}</style>
    </nav>
  );
};

export default Navbar;
