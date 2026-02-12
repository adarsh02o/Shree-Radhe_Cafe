import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Welcome from './pages/Welcome';
import Menu from './pages/Menu';
import ReviewOrder from './pages/ReviewOrder';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import AdminLogin from './pages/admin/AdminLogin';
import Kitchen from './pages/admin/Kitchen';
import ManageMenu from './pages/admin/ManageMenu';
import './styles/global.css';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className={isAdmin ? '' : 'app-container'}>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/review" element={<ReviewOrder />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmation" element={<OrderConfirmation />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/kitchen" element={<Kitchen />} />
        <Route path="/admin/manage" element={<ManageMenu />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
