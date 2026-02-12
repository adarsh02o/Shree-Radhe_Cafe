import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/review.css';

export default function ReviewOrder() {
    const navigate = useNavigate();
    const { items, subtotal, tax, total, addItem, removeItem } = useCart();
    const [fulfillment, setFulfillment] = useState('dine-in');
    const [tableNumber, setTableNumber] = useState('');

    if (items.length === 0) {
        return (
            <div className="review-page">
                <div className="page-header">
                    <Link to="/menu" className="back-btn">←</Link>
                    <h2>Review Order</h2>
                </div>
                <div className="review-content" style={{ textAlign: 'center', paddingTop: '80px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
                    <h3 style={{ marginBottom: '8px' }}>Your cart is empty</h3>
                    <p>Add some items from the menu</p>
                    <Link to="/menu" className="btn-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>
                        Browse Menu →
                    </Link>
                </div>
            </div>
        );
    }

    function handleConfirm() {
        // Store order details in sessionStorage for checkout
        sessionStorage.setItem('orderDetails', JSON.stringify({
            fulfillment,
            tableNumber: fulfillment === 'dine-in' ? tableNumber : '',
        }));
        navigate('/checkout');
    }

    return (
        <div className="review-page">
            <div className="page-header">
                <Link to="/menu" className="back-btn">←</Link>
                <h2>Review Order</h2>
            </div>

            <div className="review-content">
                {/* Fulfillment Type */}
                <div className="fulfillment-section">
                    <h4>Fulfillment Type</h4>
                    <div className="fulfillment-toggle">
                        <button
                            className={fulfillment === 'dine-in' ? 'active' : ''}
                            onClick={() => setFulfillment('dine-in')}
                        >
                            Dine-in
                        </button>
                        <button
                            className={fulfillment === 'takeaway' ? 'active' : ''}
                            onClick={() => setFulfillment('takeaway')}
                        >
                            Takeaway
                        </button>
                    </div>
                </div>

                {/* Table Number (only for dine-in) */}
                {fulfillment === 'dine-in' && (
                    <div className="table-section">
                        <label>📍 Table Number</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="table-input"
                                placeholder="Enter your table number"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Order Items */}
                <div className="order-items-section">
                    <div className="order-items-header">
                        <h4>Order Items</h4>
                        <Link to="/menu" className="edit-cart-link">Edit Cart</Link>
                    </div>
                    {items.map(item => (
                        <div className="order-item-row" key={item.id}>
                            <div className="order-item-left">
                                <span className="order-item-qty">{item.quantity}x</span>
                                <div className="order-item-details">
                                    <h4>{item.name}</h4>
                                </div>
                            </div>
                            <span className="order-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                {/* Price Breakdown */}
                <div className="price-breakdown">
                    <div className="price-row">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="price-row">
                        <span>GST (5%)</span>
                        <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="price-row total">
                        <span>Total Preview</span>
                        <span className="amount">₹{total.toFixed(2)}</span>
                    </div>
                    <p className="calculated-note">CALCULATED BY SERVER</p>
                </div>
            </div>

            {/* Sticky Bottom */}
            <div className="sticky-bottom">
                <button className="btn-primary" onClick={handleConfirm}>
                    Confirm Order <span>→</span>
                </button>
                <p className="step-note">FINAL STEP BEFORE PAYMENT</p>
            </div>
        </div>
    );
}
