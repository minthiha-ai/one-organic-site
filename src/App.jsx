import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Contact from './pages/Contact.jsx';

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
