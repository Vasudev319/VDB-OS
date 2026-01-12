import React from 'react';
import ProductCard from './ProductCard';
import { products } from '../data/products';

const ProductList = () => {
  return (
    <div className="product-list-container">
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
