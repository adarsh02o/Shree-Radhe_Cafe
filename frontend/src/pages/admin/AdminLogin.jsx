import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import '../../styles/admin.css';

// ─── Admin Credentials ─────────────────────────────────────
// Change these to update admin login credentials
const ADMIN_EMAIL = 'agrawaladarsh303@gmail.com';
const ADMIN_PASSWORD = 'Cafe@#123';
// ────────────────────────────────────────────────────────────

export default function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleLogin(e) {
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
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
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
