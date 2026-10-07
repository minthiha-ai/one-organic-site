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
import { NoIndex } from './components/Seo.jsx';
import NotFound from './pages/NotFound.jsx';

// The route table on its own, so the prerender (src/entry-server.jsx) can
// render it inside a StaticRouter while the browser uses BrowserRouter.
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout className="v2-page" homeTo="/" shopTo="/shop" />}>
        <Route index element={<Home2 />} />
      </Route>
      <Route element={<Layout />}>
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<NoIndex title="Cart"><Cart /></NoIndex>} />
        <Route path="/checkout" element={<NoIndex title="Checkout"><Checkout /></NoIndex>} />
        <Route path="/order/:orderNumber" element={<NoIndex title="Order confirmation"><OrderConfirmation /></NoIndex>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/login" element={<NoIndex title="Log in"><GuestOnly><Login /></GuestOnly></NoIndex>} />
        <Route path="/register" element={<NoIndex title="Create account"><GuestOnly><Register /></GuestOnly></NoIndex>} />
        <Route path="/account" element={<NoIndex title="My account"><RequireAuth><Account /></RequireAuth></NoIndex>} />
        <Route path="/account/orders/:orderNumber" element={<NoIndex title="Order details"><RequireAuth><OrderDetail /></RequireAuth></NoIndex>} />
        <Route path="/account/addresses" element={<NoIndex title="Saved addresses"><RequireAuth><Addresses /></RequireAuth></NoIndex>} />
        <Route path="*" element={<NotFound />} />
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
        <Route index element={<NoIndex title="Design preview"><Home /></NoIndex>} />
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
        <Route index element={<NoIndex title="Design preview"><Home /></NoIndex>} />
        <Route path="shop" element={<Shop />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
