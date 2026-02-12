import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import '../../styles/admin.css';

export default function Kitchen() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        // Setup realtime subscription
        const channel = supabase
            .channel('kitchen-orders')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                },
                () => {
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchOrders() {
        setLoading(true);
        try {
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            // Fetch order items for each order
            if (ordersData && ordersData.length > 0) {
                const orderIds = ordersData.map(o => o.id);
                const { data: itemsData } = await supabase
                    .from('order_items')
                    .select('*')
                    .in('order_id', orderIds);

                const ordersWithItems = ordersData.map(order => ({
                    ...order,
                    items: (itemsData || []).filter(item => item.order_id === order.id),
                }));

                setOrders(ordersWithItems);
            } else {
                setOrders(ordersData || []);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            // Demo fallback
            setOrders(getDemoOrders());
        }
        setLoading(false);
    }

    async function updateOrderStatus(orderId, newStatus) {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            // Update local state
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
            );
        } catch (err) {
            console.error('Error updating order:', err);
            // Demo fallback — update local state anyway
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
            );
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        sessionStorage.removeItem('adminLoggedIn');
        navigate('/admin');
    }

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    const statusCounts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        completed: orders.filter(o => o.status === 'completed').length,
    };

    function getTimeElapsed(createdAt) {
        const now = new Date();
        const created = new Date(createdAt);
        const diff = Math.floor((now - created) / 1000 / 60);
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
    }

    function isUrgent(createdAt) {
        const diff = (new Date() - new Date(createdAt)) / 1000 / 60;
        return diff > 15;
    }

    function getCustomerInitials(name) {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    return (
        <div className="kitchen-page">
            {/* Header */}
            <div className="kitchen-header">
                <div className="kitchen-header-left">
                    <h2>🍽️ Kitchen Dashboard</h2>
                    <span className="cafe-badge">Shree Radhe Cafe</span>
                </div>
                <div className="admin-nav-links">
                    <Link to="/admin/kitchen" className="admin-nav-link active">Kitchen</Link>
                    <Link to="/admin/manage" className="admin-nav-link">Manage</Link>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="kitchen-tabs">
                {[
                    { key: 'all', label: 'All Orders' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'preparing', label: 'Preparing' },
                    { key: 'ready', label: 'Ready' },
                    { key: 'completed', label: 'Completed' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        className={`kitchen-tab ${statusFilter === tab.key ? 'active' : ''}`}
                        onClick={() => setStatusFilter(tab.key)}
                    >
                        {tab.label}
                        {statusCounts[tab.key] > 0 && (
                            <span className="tab-count">{statusCounts[tab.key]}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Orders Grid */}
            <div className="kitchen-orders">
                {loading ? (
                    <div className="kitchen-empty">
                        <div className="empty-icon">⏳</div>
                        <h3>Loading orders...</h3>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="kitchen-empty">
                        <div className="empty-icon">🎉</div>
                        <h3>No orders here</h3>
                        <p>New orders will appear here in real-time</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div className="order-card" key={order.id}>
                            {/* Card Header */}
                            <div className="order-card-header">
                                <div>
                                    <div className="order-card-number">#{order.order_number}</div>
                                    <div className="order-card-time">
                                        <span className={`time-elapsed ${isUrgent(order.created_at) ? 'urgent' : ''}`}>
                                            {getTimeElapsed(order.created_at)}
                                        </span>
                                    </div>
                                </div>
                                <span className={`order-status-badge ${order.status}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Customer Info */}
                            <div className="order-card-customer">
                                <div className="customer-avatar">
                                    {getCustomerInitials(order.customer_name)}
                                </div>
                                <div className="customer-info">
                                    <h4>{order.customer_name}</h4>
                                    <p>{order.phone}</p>
                                </div>
                                <span className={`fulfillment-badge ${order.fulfillment}`}>
                                    {order.fulfillment === 'dine-in' ? `🪑 Dine-in${order.table_number ? ` T${order.table_number}` : ''}` : '📦 Takeaway'}
                                </span>
                            </div>

                            {/* Order Items */}
                            <div className="order-card-items">
                                {(order.items || []).map((item, idx) => (
                                    <div className="order-card-item" key={idx}>
                                        <span>
                                            <span className="item-qty">{item.quantity}x</span>
                                            <span className="item-name">{item.item_name}</span>
                                        </span>
                                        <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="order-card-total">
                                <span>Total</span>
                                <span>₹{Number(order.total).toFixed(2)}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="order-card-actions">
                                {order.status === 'pending' && (
                                    <button
                                        className="btn-mark-preparing"
                                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                                    >
                                        👨‍🍳 Start Preparing
                                    </button>
                                )}
                                {order.status === 'preparing' && (
                                    <button
                                        className="btn-mark-ready"
                                        onClick={() => updateOrderStatus(order.id, 'ready')}
                                    >
                                        ✅ Mark Ready
                                    </button>
                                )}
                                {order.status === 'ready' && (
                                    <button
                                        className="btn-mark-completed"
                                        onClick={() => updateOrderStatus(order.id, 'completed')}
                                    >
                                        📋 Complete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// Demo orders for testing without Supabase
function getDemoOrders() {
    const now = new Date();
    return [
        {
            id: 'demo-1',
            order_number: 'ORD-234567',
            customer_name: 'Rahul Sharma',
            phone: '+91 98765 43210',
            fulfillment: 'dine-in',
            table_number: '5',
            status: 'pending',
            total: 210,
            created_at: new Date(now - 5 * 60000).toISOString(),
            items: [
                { item_name: 'Masala Chai', quantity: 2, price: 30 },
                { item_name: 'Paneer Tikka', quantity: 1, price: 120 },
                { item_name: 'Samosa', quantity: 1, price: 20 },
            ],
        },
        {
            id: 'demo-2',
            order_number: 'ORD-234568',
            customer_name: 'Priya Patel',
            phone: '+91 87654 32109',
            fulfillment: 'takeaway',
            table_number: null,
            status: 'preparing',
            total: 320,
            created_at: new Date(now - 12 * 60000).toISOString(),
            items: [
                { item_name: 'Chole Bhature', quantity: 2, price: 100 },
                { item_name: 'Mango Lassi', quantity: 2, price: 60 },
            ],
        },
        {
            id: 'demo-3',
            order_number: 'ORD-234569',
            customer_name: 'Amit Verma',
            phone: '+91 76543 21098',
            fulfillment: 'dine-in',
            table_number: '3',
            status: 'ready',
            total: 190,
            created_at: new Date(now - 20 * 60000).toISOString(),
            items: [
                { item_name: 'Veg Biryani', quantity: 1, price: 140 },
                { item_name: 'Gulab Jamun', quantity: 1, price: 50 },
            ],
        },
    ];
}
