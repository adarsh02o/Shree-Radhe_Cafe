import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext';
import '../styles/menu.css';

export default function Menu() {
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const { addItem, removeItem, getItemQuantity, totalItems, total } = useCart();

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const [catRes, itemRes] = await Promise.all([
                supabase.from('categories').select('*').order('sort_order'),
                supabase.from('menu_items').select('*').eq('is_available', true)
            ]);

            const cats = catRes.data && catRes.data.length > 0 ? catRes.data : getDemoCategories();
            const items = itemRes.data && itemRes.data.length > 0 ? itemRes.data : getDemoItems();
            setCategories(cats);
            setMenuItems(items);
        } catch (err) {
            console.error('Error fetching menu:', err);
            setCategories(getDemoCategories());
            setMenuItems(getDemoItems());
        }
        setLoading(false);
    }

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="menu-page">
            <div className="menu-header">
                <div className="menu-header-top">
                    <h2>Shree Radhe Cafe</h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                        {menuItems.length} items
                    </span>
                </div>

                <div className="menu-search">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="category-filter">
                    <button
                        className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        All Items
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="menu-items-list">
                {loading ? (
                    <div className="menu-empty">
                        <div className="empty-icon">⏳</div>
                        <p>Loading menu...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="menu-empty">
                        <div className="empty-icon">🍽️</div>
                        <p>No items found</p>
                    </div>
                ) : (
                    filteredItems.map((item, index) => {
                        const qty = getItemQuantity(item.id);
                        return (
                            <div
                                className="menu-item-card"
                                key={item.id}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="menu-item-info">
                                    {item.is_daily_special && (
                                        <span className="daily-special-badge">⭐ Today's Special</span>
                                    )}
                                    <h3>{item.name}</h3>
                                    <p className="description">{item.description}</p>
                                    <span className="price">₹{item.price.toFixed(2)}</span>
                                </div>
                                <div className="menu-item-actions">
                                    {qty > 0 ? (
                                        <div className="qty-controls">
                                            <button onClick={() => removeItem(item.id)}>−</button>
                                            <span className="qty-num">{qty}</span>
                                            <button onClick={() => addItem(item)}>+</button>
                                        </div>
                                    ) : (
                                        <button className="add-btn" onClick={() => addItem(item)}>
                                            Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Floating Cart Badge */}
            {totalItems > 0 && (
                <div className="cart-badge-float">
                    <Link to="/review" className="cart-badge-inner">
                        <div className="cart-badge-left">
                            <span className="cart-count">{totalItems}</span>
                            <span className="cart-label">View Cart</span>
                        </div>
                        <span className="cart-total">₹{total.toFixed(2)}</span>
                    </Link>
                </div>
            )}
        </div>
    );
}

// Demo fallback data
function getDemoCategories() {
    return [
        { id: 'cat-1', name: 'Chai & Beverages', sort_order: 1 },
        { id: 'cat-2', name: 'Snacks', sort_order: 2 },
        { id: 'cat-3', name: 'Main Course', sort_order: 3 },
        { id: 'cat-4', name: 'Desserts', sort_order: 4 },
        { id: 'cat-5', name: 'Cold Drinks', sort_order: 5 },
    ];
}

function getDemoItems() {
    return [
        { id: '1', name: 'Masala Chai', description: 'Rich aromatic tea with traditional Indian spices', price: 30, category_id: 'cat-1', is_daily_special: false },
        { id: '2', name: 'Adrak Chai', description: 'Fresh ginger-infused tea, perfect for rainy days', price: 35, category_id: 'cat-1', is_daily_special: false },
        { id: '3', name: 'Filter Coffee', description: 'South Indian style strong filter coffee', price: 40, category_id: 'cat-1', is_daily_special: false },
        { id: '4', name: 'Samosa', description: 'Crispy golden pastry filled with spiced potatoes', price: 20, category_id: 'cat-2', is_daily_special: true },
        { id: '5', name: 'Vada Pav', description: 'Mumbai style spiced potato fritter in soft bun', price: 30, category_id: 'cat-2', is_daily_special: false },
        { id: '6', name: 'Bread Pakora', description: 'Crispy gram flour coated bread with mint chutney', price: 35, category_id: 'cat-2', is_daily_special: false },
        { id: '7', name: 'Paneer Tikka', description: 'Grilled cottage cheese with bell peppers, spices', price: 120, category_id: 'cat-2', is_daily_special: false },
        { id: '8', name: 'Pav Bhaji', description: 'Spiced mashed vegetables with buttered pav bread', price: 80, category_id: 'cat-2', is_daily_special: false },
        { id: '9', name: 'Chole Bhature', description: 'Spicy chickpea curry with fluffy fried bread', price: 100, category_id: 'cat-3', is_daily_special: false },
        { id: '10', name: 'Paneer Butter Masala', description: 'Creamy tomato gravy with soft paneer cubes', price: 150, category_id: 'cat-3', is_daily_special: false },
        { id: '11', name: 'Veg Biryani', description: 'Fragrant basmati rice with mixed vegetables', price: 140, category_id: 'cat-3', is_daily_special: true },
        { id: '12', name: 'Gulab Jamun', description: 'Soft milk dumplings soaked in rose-cardamom syrup', price: 50, category_id: 'cat-4', is_daily_special: false },
        { id: '13', name: 'Kulfi', description: 'Traditional Indian frozen dessert with pistachios', price: 60, category_id: 'cat-4', is_daily_special: false },
        { id: '14', name: 'Mango Lassi', description: 'Thick creamy yogurt smoothie with fresh mango', price: 60, category_id: 'cat-5', is_daily_special: false },
        { id: '15', name: 'Cold Coffee', description: 'Iced coffee blended with vanilla ice cream', price: 70, category_id: 'cat-5', is_daily_special: false },
        { id: '16', name: 'Fresh Lime Soda', description: 'Refreshing citrus soda, sweet or salty', price: 40, category_id: 'cat-5', is_daily_special: false },
    ];
}
