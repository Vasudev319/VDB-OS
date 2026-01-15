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
                <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                    <button style={{ background: 'white', color: '#2874F1', padding: '5px 20px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Login as...</button>
                    <div className="dropdown-content" style={{ position: 'absolute', backgroundColor: '#f9f9f9', minWidth: '160px', boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)', zIndex: 1 }}>
                        <button onClick={() => login('Admin')} style={{ width: '100%', padding: '12px 16px', border: 'none', textAlign: 'left', cursor: 'pointer' }}>Admin</button>
                        <button onClick={() => login('Seller')} style={{ width: '100%', padding: '12px 16px', border: 'none', textAlign: 'left', cursor: 'pointer' }}>Seller</button>
                        <button onClick={() => login('Delivery')} style={{ width: '100%', padding: '12px 16px', border: 'none', textAlign: 'left', cursor: 'pointer' }}>Delivery Staff</button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                   <span style={{ color: 'white' }}>Hi, {user.name}</span>
                   {user.role === 'Admin' && <Link to="/admin" style={{ color: 'white' }}>Admin Panel</Link>}
                   {user.role === 'Seller' && <Link to="/seller" style={{ color: 'white' }}>Seller Panel</Link>}
                   {user.role === 'Delivery' && <Link to="/delivery" style={{ color: 'white' }}>Delivery Panel</Link>}
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
