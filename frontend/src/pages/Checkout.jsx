import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext';
import '../styles/checkout.css';

export default function Checkout() {
    const navigate = useNavigate();
    const { items, subtotal, tax, total, clearCart } = useCart();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Get order details from review page
    const orderDetails = JSON.parse(sessionStorage.getItem('orderDetails') || '{}');

    async function handlePlaceOrder() {
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        if (!phone.trim() || phone.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        setError('');

        // Generate order number
        const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

        try {
            // Insert order into Supabase
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    order_number: orderNumber,
                    customer_name: name.trim(),
                    phone: phone.trim(),
                    fulfillment: orderDetails.fulfillment || 'dine-in',
                    table_number: orderDetails.tableNumber || null,
                    payment_method: paymentMethod,
                    status: 'pending',
                    subtotal: subtotal,
                    tax: 0,
                    total: total,
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Insert order items
            const orderItems = items.map(item => ({
                order_id: order.id,
                menu_item_id: item.id,
                item_name: item.name,
                quantity: item.quantity,
                price: item.price,
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Request notification permission
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }

            // Store order info for confirmation page
            sessionStorage.setItem('lastOrder', JSON.stringify({
                id: order.id,
                orderNumber,
                customerName: name,
                phone,
                fulfillment: orderDetails.fulfillment,
                tableNumber: orderDetails.tableNumber,
                items: items.map(i => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price,
                })),
                subtotal,
                tax,
                total,
                paymentMethod,
            }));

            clearCart();
            sessionStorage.removeItem('orderDetails');
            navigate('/confirmation');
        } catch (err) {
            console.error('Order error:', err);
            // Fallback: still navigate even if Supabase fails (demo mode)
            const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
            sessionStorage.setItem('lastOrder', JSON.stringify({
                id: 'demo-' + Date.now(),
                orderNumber,
                customerName: name,
                phone,
                fulfillment: orderDetails.fulfillment,
                tableNumber: orderDetails.tableNumber,
                items: items.map(i => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price,
                })),
                subtotal,
                tax,
                total,
                paymentMethod,
            }));
            clearCart();
            sessionStorage.removeItem('orderDetails');
            navigate('/confirmation');
        }
        setLoading(false);
    }

    const paymentOptions = [
        {
            id: 'cash',
            name: 'Cash',
            desc: 'Pay at counter',
            icon: '💵',
        }
    ];

    return (
        <div className="checkout-page">
            <div className="page-header">
                <Link to="/review" className="back-btn">←</Link>
                <h2>Checkout</h2>
            </div>

            {/* Step Indicator */}
            <div className="step-indicator">
                <div className="step completed">
                    <div className="step-circle">✓</div>
                    <span className="step-label">Cart</span>
                </div>
                <div className="step-line completed"></div>
                <div className="step active">
                    <div className="step-circle">2</div>
                    <span className="step-label">Details</span>
                </div>
                <div className="step-line"></div>
                <div className="step upcoming">
                    <div className="step-circle">3</div>
                    <span className="step-label">Success</span>
                </div>
            </div>

            <div className="checkout-content">
                <div className="checkout-section">
                    <h1>Customer Details</h1>
                    <p className="subtitle">Provide your info and choose payment method.</p>

                    {/* Full Name */}
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div className="input-group">
                            <span className="input-icon">👤</span>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <div className="input-group">
                            <span className="input-icon">📱</span>
                            <input
                                type="tel"
                                className="input-field"
                                placeholder="+91 XXXXX XXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="form-group">
                        <label className="form-label">Select Payment Method</label>
                        <div className="payment-methods">
                            {paymentOptions.map(opt => (
                                <div
                                    key={opt.id}
                                    className={`payment-option ${paymentMethod === opt.id ? 'selected' : ''}`}
                                    onClick={() => setPaymentMethod(opt.id)}
                                >
                                    <div className="payment-icon">{opt.icon}</div>
                                    <div className="payment-info">
                                        <h4>{opt.name}</h4>
                                        <p>{opt.desc}</p>
                                    </div>
                                    <div className="payment-radio">
                                        <div className="radio-dot"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && <p className="error-msg" style={{ color: 'var(--danger)', textAlign: 'center', marginTop: '8px' }}>{error}</p>}
                </div>
            </div>

            {/* Sticky Bottom */}
            <div className="sticky-bottom">
                <button
                    className="btn-primary"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                >
                    {loading ? 'Placing Order...' : 'Continue Order'} <span>→</span>
                </button>
            </div>
        </div>
    );
}
