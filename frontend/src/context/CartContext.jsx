import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);

    const addItem = useCallback((menuItem) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === menuItem.id);
            if (existing) {
                return prev.map(i =>
                    i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...menuItem, quantity: 1 }];
        });
    }, []);

    const removeItem = useCallback((itemId) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map(i =>
                    i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
                );
            }
            return prev.filter(i => i.id !== itemId);
        });
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const getItemQuantity = useCallback((itemId) => {
        const item = items.find(i => i.id === itemId);
        return item ? item.quantity : 0;
    }, [items]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = 0; // GST removed
    const total = subtotal;

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            clearCart,
            getItemQuantity,
            totalItems,
            subtotal,
            tax,
            total
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
