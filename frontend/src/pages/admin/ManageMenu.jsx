import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import '../../styles/admin.css';

export default function ManageMenu() {
    const [activeTab, setActiveTab] = useState('categories');
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Category form
    const [catName, setCatName] = useState('');
    const [catSort, setCatSort] = useState(0);
    const [editingCat, setEditingCat] = useState(null);

    // Menu item form
    const [showItemForm, setShowItemForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemForm, setItemForm] = useState({
        name: '', description: '', price: '', category_id: '', is_available: true, is_daily_special: false,
    });

    // Confirmation dialog
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        fetchAll();
    }, []);

    async function fetchAll() {
        setLoading(true);
        try {
            const [catRes, itemRes] = await Promise.all([
                supabase.from('categories').select('*').order('sort_order'),
                supabase.from('menu_items').select('*').order('created_at'),
            ]);
            if (catRes.data) setCategories(catRes.data);
            if (itemRes.data) setMenuItems(itemRes.data);
        } catch (err) {
            console.error('Fetch error:', err);
        }
        setLoading(false);
    }

    // ── Category CRUD ──────────────────────────────
    async function handleSaveCategory(e) {
        e.preventDefault();
        if (!catName.trim()) return;

        if (editingCat) {
            const { error } = await supabase
                .from('categories')
                .update({ name: catName.trim(), sort_order: parseInt(catSort) || 0 })
                .eq('id', editingCat.id);
            if (!error) {
                setCategories(prev => prev.map(c => c.id === editingCat.id ? { ...c, name: catName.trim(), sort_order: parseInt(catSort) || 0 } : c));
                setEditingCat(null);
            }
        } else {
            const { data, error } = await supabase
                .from('categories')
                .insert({ name: catName.trim(), sort_order: parseInt(catSort) || 0 })
                .select()
                .single();
            if (!error && data) {
                setCategories(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
            }
        }
        setCatName('');
        setCatSort(0);
    }

    function startEditCategory(cat) {
        setEditingCat(cat);
        setCatName(cat.name);
        setCatSort(cat.sort_order || 0);
    }

    async function deleteCategory(id) {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) {
            setCategories(prev => prev.filter(c => c.id !== id));
        }
        setConfirmDelete(null);
    }

    // ── Menu Item CRUD ─────────────────────────────
    function openItemForm(item = null) {
        if (item) {
            setEditingItem(item);
            setItemForm({
                name: item.name,
                description: item.description || '',
                price: item.price.toString(),
                category_id: item.category_id || '',
                is_available: item.is_available,
                is_daily_special: item.is_daily_special,
            });
        } else {
            setEditingItem(null);
            setItemForm({ name: '', description: '', price: '', category_id: '', is_available: true, is_daily_special: false });
        }
        setShowItemForm(true);
    }

    async function handleSaveItem(e) {
        e.preventDefault();
        if (!itemForm.name.trim() || !itemForm.price) return;

        const payload = {
            name: itemForm.name.trim(),
            description: itemForm.description.trim(),
            price: parseFloat(itemForm.price),
            category_id: itemForm.category_id || null,
            is_available: itemForm.is_available,
            is_daily_special: itemForm.is_daily_special,
        };

        if (editingItem) {
            const { error } = await supabase
                .from('menu_items')
                .update(payload)
                .eq('id', editingItem.id);
            if (!error) {
                setMenuItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...payload } : i));
            }
        } else {
            const { data, error } = await supabase
                .from('menu_items')
                .insert(payload)
                .select()
                .single();
            if (!error && data) {
                setMenuItems(prev => [...prev, data]);
            }
        }
        setShowItemForm(false);
        setEditingItem(null);
    }

    async function toggleItemField(item, field) {
        const newVal = !item[field];
        const { error } = await supabase
            .from('menu_items')
            .update({ [field]: newVal })
            .eq('id', item.id);
        if (!error) {
            setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, [field]: newVal } : i));
        }
    }

    async function deleteItem(id) {
        const { error } = await supabase.from('menu_items').delete().eq('id', id);
        if (!error) {
            setMenuItems(prev => prev.filter(i => i.id !== id));
        }
        setConfirmDelete(null);
    }

    function getCategoryName(catId) {
        const cat = categories.find(c => c.id === catId);
        return cat ? cat.name : '—';
    }

    return (
        <div className="kitchen-page">
            {/* Header */}
            <div className="kitchen-header">
                <div className="kitchen-header-left">
                    <h2>📋 Manage Menu</h2>
                    <span className="cafe-badge">Shree Radhe Cafe</span>
                </div>
                <div className="admin-nav-links">
                    <Link to="/admin/kitchen" className="admin-nav-link">Kitchen</Link>
                    <Link to="/admin/manage" className="admin-nav-link active">Manage</Link>
                    <Link to="/admin/reports" className="admin-nav-link">Reports</Link>
                </div>
            </div>

            {/* Tab Switch */}
            <div className="manage-tabs">
                <button className={`manage-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
                    📁 Categories ({categories.length})
                </button>
                <button className={`manage-tab ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>
                    🍽️ Menu Items ({menuItems.length})
                </button>
            </div>

            <div className="manage-content">
                {loading ? (
                    <div className="kitchen-empty">
                        <div className="empty-icon">⏳</div>
                        <h3>Loading...</h3>
                    </div>
                ) : activeTab === 'categories' ? (
                    /* ── Categories Tab ─────────────── */
                    <div className="manage-section">
                        {/* Add/Edit Form */}
                        <form className="manage-form" onSubmit={handleSaveCategory}>
                            <div className="manage-form-row">
                                <input
                                    type="text"
                                    placeholder="Category name"
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                    className="manage-input"
                                />
                                <input
                                    type="number"
                                    placeholder="Sort order"
                                    value={catSort}
                                    onChange={(e) => setCatSort(e.target.value)}
                                    className="manage-input sort-input"
                                />
                                <button type="submit" className="manage-btn save">
                                    {editingCat ? '✓ Update' : '+ Add'}
                                </button>
                                {editingCat && (
                                    <button type="button" className="manage-btn cancel" onClick={() => { setEditingCat(null); setCatName(''); setCatSort(0); }}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Categories Table */}
                        <div className="manage-table-wrap">
                            <table className="manage-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Sort Order</th>
                                        <th>Items</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map(cat => (
                                        <tr key={cat.id}>
                                            <td className="td-name">{cat.name}</td>
                                            <td>{cat.sort_order}</td>
                                            <td>{menuItems.filter(i => i.category_id === cat.id).length}</td>
                                            <td className="td-actions">
                                                <button className="action-btn edit" onClick={() => startEditCategory(cat)}>✏️</button>
                                                <button className="action-btn delete" onClick={() => setConfirmDelete({ type: 'category', id: cat.id, name: cat.name })}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr><td colSpan="4" className="td-empty">No categories yet. Add one above.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* ── Menu Items Tab ─────────────── */
                    <div className="manage-section">
                        <div className="manage-actions-bar">
                            <button className="manage-btn save" onClick={() => openItemForm()}>+ Add Item</button>
                        </div>

                        <div className="manage-table-wrap">
                            <table className="manage-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Category</th>
                                        <th>Available</th>
                                        <th>Daily Special</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {menuItems.map(item => (
                                        <tr key={item.id}>
                                            <td className="td-name">
                                                <div>
                                                    <strong>{item.name}</strong>
                                                    {item.description && <small className="td-desc">{item.description}</small>}
                                                </div>
                                            </td>
                                            <td>₹{Number(item.price).toFixed(2)}</td>
                                            <td><span className="cat-badge">{getCategoryName(item.category_id)}</span></td>
                                            <td>
                                                <button
                                                    className={`toggle-btn ${item.is_available ? 'on' : 'off'}`}
                                                    onClick={() => toggleItemField(item, 'is_available')}
                                                >
                                                    {item.is_available ? 'Yes' : 'No'}
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                    className={`toggle-btn special ${item.is_daily_special ? 'on' : 'off'}`}
                                                    onClick={() => toggleItemField(item, 'is_daily_special')}
                                                >
                                                    {item.is_daily_special ? '⭐ Yes' : 'No'}
                                                </button>
                                            </td>
                                            <td className="td-actions">
                                                <button className="action-btn edit" onClick={() => openItemForm(item)}>✏️</button>
                                                <button className="action-btn delete" onClick={() => setConfirmDelete({ type: 'item', id: item.id, name: item.name })}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {menuItems.length === 0 && (
                                        <tr><td colSpan="6" className="td-empty">No menu items yet. Add one above.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Item Form Modal */}
            {showItemForm && (
                <div className="modal-overlay" onClick={() => setShowItemForm(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                        <form onSubmit={handleSaveItem}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input className="form-input" type="text" value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Item name" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-input form-textarea" value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Brief description" />
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label className="form-label">Price (₹)</label>
                                    <input className="form-input" type="number" step="0.01" value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} placeholder="0.00" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select className="form-input" value={itemForm.category_id} onChange={e => setItemForm({ ...itemForm, category_id: e.target.value })}>
                                        <option value="">No Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-toggles">
                                <label className="toggle-label">
                                    <input type="checkbox" checked={itemForm.is_available} onChange={e => setItemForm({ ...itemForm, is_available: e.target.checked })} />
                                    <span>Available</span>
                                </label>
                                <label className="toggle-label">
                                    <input type="checkbox" checked={itemForm.is_daily_special} onChange={e => setItemForm({ ...itemForm, is_daily_special: e.target.checked })} />
                                    <span>⭐ Daily Special</span>
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="manage-btn cancel" onClick={() => setShowItemForm(false)}>Cancel</button>
                                <button type="submit" className="manage-btn save">{editingItem ? '✓ Update' : '+ Add Item'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {confirmDelete && (
                <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="modal-card confirm-modal" onClick={e => e.stopPropagation()}>
                        <div className="confirm-icon">⚠️</div>
                        <h3>Delete {confirmDelete.type}?</h3>
                        <p>Are you sure you want to delete <strong>"{confirmDelete.name}"</strong>? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="manage-btn cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="manage-btn delete" onClick={() => confirmDelete.type === 'category' ? deleteCategory(confirmDelete.id) : deleteItem(confirmDelete.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
