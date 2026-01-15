import React from 'react';

const AdminPanel = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <div className="stats" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
          <h3>Total Users</h3>
          <p>1,234</p>
        </div>
        <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
          <h3>Total Orders</h3>
          <p>567</p>
        </div>
        <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
          <h3>Revenue</h3>
          <p>$12,345</p>
        </div>
      </div>
      <h2>Manage Users</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#eee', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>ID</th>
            <th style={{ padding: '10px' }}>Name</th>
            <th style={{ padding: '10px' }}>Role</th>
            <th style={{ padding: '10px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>1</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>John Doe</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Seller</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Active</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>2</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Jane Smith</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Buyer</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Active</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
