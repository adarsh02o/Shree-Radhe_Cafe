import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import '../styles/confirmation.css';

export default function OrderConfirmation() {
    const [order, setOrder] = useState(null);
    const [orderStatus, setOrderStatus] = useState('pending');

    useEffect(() => {
        const lastOrder = sessionStorage.getItem('lastOrder');
        if (lastOrder) {
            const parsed = JSON.parse(lastOrder);
            setOrder(parsed);

            // Subscribe to realtime status updates
            if (parsed.id && !parsed.id.startsWith('demo-')) {
                const channel = supabase
                    .channel('order-status-' + parsed.id)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'orders',
                            filter: `id=eq.${parsed.id}`,
                        },
                        (payload) => {
                            const newStatus = payload.new.status;
                            setOrderStatus(newStatus);

                            // Browser notification when order is ready
                            if (newStatus === 'ready') {
                                sendNotification(parsed.orderNumber);
                            }
                        }
                    )
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            }
        }
    }, []);

    function sendNotification(orderNumber) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🎉 Your order is ready!', {
                body: `Order ${orderNumber} is ready for pickup. Enjoy your meal!`,
                icon: '/vite.svg',
                tag: 'order-ready',
            });
        }
    }

    if (!order) {
        return (
            <div className="confirmation-page">
                <div className="confirmation-content" style={{ paddingTop: '80px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🤔</div>
                    <h2>No order found</h2>
                    <p>Looks like you haven't placed an order yet.</p>
                    <Link to="/menu" className="btn-primary" style={{ marginTop: '24px' }}>
                        Browse Menu →
                    </Link>
                </div>
            </div>
        );
    }

    const statusMessages = {
        pending: '⏳ Your order has been received and will be prepared soon.',
        preparing: '👨‍🍳 Your order is being prepared with care!',
        ready: '🎉 Your order is ready! Please pick it up.',
        completed: '✅ Order completed. Thank you!',
    };

    return (
        <div className="confirmation-page">
            <div className="confirmation-content">
                {/* Success Icon */}
                <div className="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>

                <h1>Thank You for Your Order!</h1>
                <p>Your meal is being prepared with care.</p>

                {/* Status Banner */}
                <div className={`order-status-banner ${orderStatus}`}>
                    {statusMessages[orderStatus]}
                </div>

                {/* Order Number */}
                <div className="order-number-section">
                    <p className="order-number-label">ORDER NUMBER</p>
                    <p className="order-number-value">#{order.orderNumber}</p>
                </div>

                {/* Estimated Time */}
                <div className="estimated-time">
                    <p className="time-label">ESTIMATED READY IN</p>
                    <p className="time-value">15-20 min</p>
                </div>

                {/* Order Summary */}
                <div className="order-summary-section">
                    <h3>Order Summary</h3>
                    {order.items.map((item, idx) => (
                        <div className="summary-item" key={idx}>
                            <div className="summary-item-left">
                                <span className="summary-item-qty">{item.quantity}x</span>
                                <div>
                                    <p className="summary-item-name">{item.name}</p>
                                </div>
                            </div>
                            <span className="summary-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}

                    <div className="summary-totals">
                        <div className="summary-total-row">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-total-row">
                            <span>GST</span>
                            <span>₹{order.tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-total-row final">
                            <span>Total Paid</span>
                            <span>₹{order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Contact Footer */}
                <div className="contact-footer">
                    <p>For cancellations or modifications, please call</p>
                    <a href="tel:+919876543210" className="phone">+91 98765 43210</a>
                </div>

                {/* Back to Menu */}
                <Link to="/" className="btn-primary" style={{ marginTop: '32px' }}>
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
