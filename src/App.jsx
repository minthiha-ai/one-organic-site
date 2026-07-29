import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Contact from './pages/Contact.jsx';
import LayoutA from './drafts/a/LayoutA.jsx';
import HomeA from './drafts/a/HomeA.jsx';
import LayoutB from './drafts/b/LayoutB.jsx';
import HomeB from './drafts/b/HomeB.jsx';
import ShopB from './drafts/b/ShopB.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
        <Route path="/draft-a" element={<LayoutA />}>
          <Route index element={<HomeA />} />
          <Route path="shop" element={<Shop />} />
        </Route>
        <Route path="/draft-b" element={<LayoutB />}>
          <Route index element={<HomeB />} />
          <Route path="shop" element={<ShopB />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
