import { render, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';

const Consumer = React.memo(({ onRender }) => {
  useCart();
  onRender();
  return null;
});

Consumer.displayName = 'Consumer';

describe('CartContext Performance', () => {
  it('does not re-render consumers when provider re-renders but value is unchanged', async () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
       const [, setTick] = useState(0);
       return (
         <>
           <button onClick={() => setTick(t => t + 1)}>Tick</button>
           <CartProvider>
             <Consumer onRender={renderSpy} />
           </CartProvider>
         </>
       )
    }

    const { getByText } = render(<TestComponent />);

    // Initial render
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // Force re-render of parent (TestComponent)
    const button = getByText('Tick');
    await act(async () => {
        button.click();
    });

    // If CartContext value is stable, Consumer (memoized) should not re-render.
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});
