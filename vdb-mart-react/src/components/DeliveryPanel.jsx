import React, { useState } from 'react';

const DeliveryPanel = () => {
  const [orders, setOrders] = useState([
    { id: 101, customer: 'Alice', address: '123 Main St', status: 'Pending' },
    { id: 102, customer: 'Bob', address: '456 Oak Ave', status: 'In Transit' },
  ]);

  const toggleStatus = (id) => {
    setOrders(orders.map(o => {
      if (o.id === id) {
        return { ...o, status: o.status === 'Delivered' ? 'Pending' : 'Delivered' };
      }
      return o;
    }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Delivery Dashboard</h1>
      <h2>Assigned Orders</h2>
      <div style={{ display: 'grid', gap: '20px' }}>
        {orders.map(order => (
          <div key={order.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Order #{order.id}</h3>
              <p>Customer: {order.customer}</p>
              <p>Address: {order.address}</p>
              <p>Status: <span style={{ fontWeight: 'bold', color: order.status === 'Delivered' ? 'green' : 'orange' }}>{order.status}</span></p>
            </div>
            <button
              onClick={() => toggleStatus(order.id)}
              style={{ padding: '10px 20px', background: '#2874F1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Mark {order.status === 'Delivered' ? 'Pending' : 'Delivered'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryPanel;
