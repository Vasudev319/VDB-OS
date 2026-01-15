import React, { useState } from 'react';

const SellerPanel = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Sample Product', price: 99.99, stock: 10 }
  ]);

  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name) return;
    setProducts([...products, { id: Date.now(), ...newProduct }]);
    setNewProduct({ name: '', price: '', stock: '' });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Seller Dashboard</h1>
      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 1 }}>
          <h2>Add New Product</h2>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              style={{ padding: '8px' }}
            />
            <input
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              style={{ padding: '8px' }}
            />
            <input
              type="number"
              placeholder="Stock"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              style={{ padding: '8px' }}
            />
            <button type="submit" style={{ padding: '10px', background: '#2874F1', color: 'white', border: 'none', cursor: 'pointer' }}>
              Add Product
            </button>
          </form>
        </div>
        <div style={{ flex: 1 }}>
          <h2>My Products</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {products.map(p => (
              <li key={p.id} style={{ padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.name}</span>
                <span>${p.price} (Stock: {p.stock})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SellerPanel;
