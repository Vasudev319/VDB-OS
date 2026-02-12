import React, { useEffect } from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { describe, it, expect } from 'vitest';

const TestComponent = ({ onRender }) => {
  const { cart, addToCart, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart();

  useEffect(() => {
    onRender({ cart, addToCart, removeFromCart, updateQuantity, cartCount, cartTotal });
  });

  return null;
};

describe('CartContext', () => {
  it('updates cart count and total correctly', async () => {
    let contextValue;
    render(
      <CartProvider>
        <TestComponent onRender={(val) => { contextValue = val; }} />
      </CartProvider>
    );

    // Initial state
    await waitFor(() => expect(contextValue).toBeDefined());
    expect(contextValue.cart).toEqual([]);
    expect(contextValue.cartCount).toBe(0);
    expect(contextValue.cartTotal).toBe(0);

    // Add item
    act(() => {
      contextValue.addToCart({ id: 1, price: 10, quantity: 1 });
    });

    await waitFor(() => {
        expect(contextValue.cartCount).toBe(1);
    });
    expect(contextValue.cartTotal).toBe(10);

    // Add another item
    act(() => {
      contextValue.addToCart({ id: 2, price: 20, quantity: 1 });
    });

    await waitFor(() => {
        expect(contextValue.cartCount).toBe(2);
    });
    expect(contextValue.cartTotal).toBe(30);

    // Increase quantity
    act(() => {
      contextValue.updateQuantity(1, 2);
    });

    await waitFor(() => {
        expect(contextValue.cartCount).toBe(3); // 2 + 1
    });
    expect(contextValue.cartTotal).toBe(40); // 2*10 + 20

    // Decrease quantity
    act(() => {
      contextValue.updateQuantity(1, 1);
    });

    await waitFor(() => {
        expect(contextValue.cartCount).toBe(2);
    });
    expect(contextValue.cartTotal).toBe(30);

    // Remove item
    act(() => {
      contextValue.removeFromCart(1);
    });

    await waitFor(() => {
        expect(contextValue.cartCount).toBe(1);
    });
    expect(contextValue.cartTotal).toBe(20);
  });
});
