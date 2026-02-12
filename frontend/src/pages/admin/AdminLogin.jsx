import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import '../../styles/admin.css';

// ─── Admin Credentials ─────────────────────────────────────
// Credentials are now loaded from .env file for security
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@cafe.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
// ────────────────────────────────────────────────────────────

export default function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleLogin(e) {
        // ... (function body remains same)
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            if (data.session) {
                navigate('/admin/kitchen');
            }
        } catch (err) {
            console.error('Login error:', err);
            // Fallback — validate against hardcoded credentials
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                sessionStorage.setItem('adminLoggedIn', 'true');
                navigate('/admin/kitchen');
            } else {
                setError('Invalid email or password.');
            }
        }
        setLoading(false);
    }

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <div className="admin-icon">👨‍🍳</div>
                    <h1>Admin Login</h1>
                    <p>Shree Radhe Cafe Kitchen Panel</p>
                </div>

                <form className="admin-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="admin@shreeradhecafe.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="password-input-wrapper" style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    padding: '0',
                                    color: '#6B7280'
                                }}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "👁️" : "🙈"}
                            </button>
                        </div>
                    </div>

                    {error && <p className="error-msg">{error}</p>}

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ marginTop: '16px' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'} →
                    </button>
                </form>
            </div>
        </div>
    );
}
