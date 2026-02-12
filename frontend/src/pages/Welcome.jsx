import { Link } from 'react-router-dom';
import '../styles/welcome.css';

export default function Welcome() {
    return (
        <div className="welcome-page">
            <div className="welcome-hero">
                {/* Floating decorations */}
                <div className="welcome-decoration d1"></div>
                <div className="welcome-decoration d2"></div>
                <div className="welcome-decoration d3"></div>

                <div className="welcome-card">
                    <div className="welcome-icon">🍴</div>
                    <h1>Shree Radhe Cafe</h1>
                    <p>
                        Experience authentic flavors crafted with love. Your premium cafe experience begins here.
                    </p>
                    <Link to="/menu" className="btn-primary">
                        View Menu <span>→</span>
                    </Link>
                    <div className="welcome-dots">
                        <span className="dot active"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
