import React from 'react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.title} />
      </div>
      <div className="product-details">
        <h3 className="product-title" title={product.title}>{product.title}</h3>
        <div className="product-rating">
            <span className="rating-badge">{product.rating} ★</span>
            <span className="rating-count">({product.reviews})</span>
        </div>
        <div className="product-price">₹{product.price.toLocaleString('en-IN')}</div>
        <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
