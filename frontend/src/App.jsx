import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Home2 from './pages/Home2.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import Contact from './pages/Contact.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
import RefundPolicy from './pages/RefundPolicy.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Account from './pages/Account.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Addresses from './pages/Addresses.jsx';
import RequireAuth, { GuestOnly } from './components/RequireAuth.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout className="v2-page" homeTo="/" shopTo="/shop" />}>
          <Route index element={<Home2 />} />
        </Route>
        <Route element={<Layout />}>
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
          <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
          <Route path="/account/orders/:orderNumber" element={<RequireAuth><OrderDetail /></RequireAuth>} />
          <Route path="/account/addresses" element={<RequireAuth><Addresses /></RequireAuth>} />
        </Route>
        <Route path="/v2" element={<Navigate to="/" replace />} />
        <Route
          path="/preview-white"
          element={
            <Layout
              bgOverride="#FFFFFF"
              homeTo="/preview-white"
              shopTo="/preview-white/shop"
              switchTo="/preview-cream"
              switchLabel="Cream bg"
            />
          }
        >
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
        </Route>
        <Route
          path="/preview-cream"
          element={
            <Layout
              bgOverride="#FCFAF7"
              homeTo="/preview-cream"
              shopTo="/preview-cream/shop"
              switchTo="/preview-white"
              switchLabel="White bg"
            />
          }
        >
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
