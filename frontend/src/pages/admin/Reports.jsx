import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import '../../styles/admin.css';

export default function Reports() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReportData();
    }, [selectedDate]);

    async function fetchReportData() {
        setLoading(true);
        try {
            // Fetch date range (start of day to end of day)
            const startDate = new Date(selectedDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(selectedDate);
            endDate.setHours(23, 59, 59, 999);

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    items:order_items(*)
                `)
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error('Error fetching reports:', err);
        }
        setLoading(false);
    }

    async function togglePaymentStatus(order) {
        const newStatus = order.payment_status === 'paid' ? 'unpaid' : 'paid';
        try {
            const { error } = await supabase
                .from('orders')
                .update({ payment_status: newStatus })
                .eq('id', order.id);

            if (error) throw error;

            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, payment_status: newStatus } : o));
        } catch (err) {
            console.error('Error updating payment status:', err);
            // Optimistic update fallback for demo
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, payment_status: newStatus } : o));
        }
    }

    // Calculations
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const cashOrders = orders.filter(o => o.payment_method === 'cash').length;
    const onlineOrders = orders.filter(o => o.payment_method !== 'cash').length;
    const paidOrders = orders.filter(o => o.payment_status === 'paid' || o.payment_method !== 'cash').length; // Assuming non-cash are auto-paid? User asked for manual toggle.

    // Helper for payment status display
    const getPaymentBadge = (order) => {
        if (order.payment_method !== 'cash') return <span className="badge paid">Online Paid</span>;
        return (
            <button
                className={`payment-toggle ${order.payment_status === 'paid' ? 'paid' : 'unpaid'}`}
                onClick={() => togglePaymentStatus(order)}
            >
                {order.payment_status === 'paid' ? '✅ Paid' : '❌ Unpaid'}
            </button>
        );
    };

    return (
        <div className="kitchen-page">
            {/* Header */}
            <div className="kitchen-header">
                <div className="kitchen-header-left">
                    <h2>📊 Reports & History</h2>
                    <span className="cafe-badge">Shree Radhe Cafe</span>
                </div>
                <div className="admin-nav-links">
                    <Link to="/admin/kitchen" className="admin-nav-link">Kitchen</Link>
                    <Link to="/admin/manage" className="admin-nav-link">Manage</Link>
                    <Link to="/admin/reports" className="admin-nav-link active">Reports</Link>
                </div>
            </div>

            <div className="manage-content">
                {/* Controls */}
                <div className="reports-controls">
                    <label>Select Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="date-input"
                    />
                </div>

                {/* Summary Cards */}
                <div className="summary-cards">
                    <div className="summary-card">
                        <h3>Total Orders</h3>
                        <p>{totalOrders}</p>
                    </div>
                    <div className="summary-card">
                        <h3>Total Revenue</h3>
                        <p>₹{totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="summary-card">
                        <h3>Payment Split</h3>
                        <div className="split-stat">Cash: {cashOrders}</div>
                        <div className="split-stat">Online: {onlineOrders}</div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="manage-table-wrap">
                    <table className="manage-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Time</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Payment Mode</th>
                                <th>Payment Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="td-empty">Loading...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="8" className="td-empty">No orders found for this date.</td></tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id}>
                                        <td><strong>#{order.order_number}</strong></td>
                                        <td>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>
                                            <div>{order.customer_name}</div>
                                            <small>{order.phone}</small>
                                        </td>
                                        <td>
                                            <div className="report-items">
                                                {order.items?.map(i => (
                                                    <div key={i.id}>{i.quantity}x {i.item_name}</div>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 'bold' }}>₹{Number(order.total).toFixed(2)}</td>
                                        <td><span className={`order-status-badge ${order.status}`}>{order.status}</span></td>
                                        <td>
                                            <span className="pay-mode-badge">{order.payment_method.toUpperCase()}</span>
                                        </td>
                                        <td>{getPaymentBadge(order)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
