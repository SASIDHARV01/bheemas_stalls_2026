import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StallList from './pages/StallList';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage'; // 1. Added this line!
import GlobalCart from './components/GlobalCart';
import VerifyPage from './pages/VerifyPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-neutral-950 text-white relative font-sans">
        <GlobalCart />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/stalls" element={<StallList />} />
          <Route path="/menu/:stallId" element={<MenuPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/admin/verify/:orderId" element={<VerifyPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;