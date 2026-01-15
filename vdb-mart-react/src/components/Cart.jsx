import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <img src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" alt="Empty Cart" className="empty-cart-img" />
        <h2>Your cart is empty!</h2>
        <p>Add items to it now.</p>
        <Link to="/" className="shop-now-btn">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-image">
                <img src={item.image} alt={item.title} />
            </div>
            <div className="cart-item-details">
                <h3>{item.title}</h3>
                <div className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</div>
                <div className="cart-item-actions">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <input type="text" value={item.quantity} readOnly />
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3>Price Details</h3>
        <div className="summary-row">
            <span>Price ({cart.length} items)</span>
            <span>₹{cartTotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="summary-row">
            <span>Delivery Charges</span>
            <span className="free-delivery">Free</span>
        </div>
        <div className="summary-total">
            <span>Total Amount</span>
            <span>₹{cartTotal.toLocaleString('en-IN')}</span>
        </div>
        <button className="place-order-btn">PLACE ORDER</button>
      </div>
    </div>
  );
};

export default Cart;
