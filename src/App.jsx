import { useState } from "react";
import { products } from "./data/products";
import ProductCard from "./components/ProductCard";
import "./App.css";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [filterCategory, setFilterCategory] = useState("Semua");

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const checkoutViaWhatsApp = () => {
    if (cart.length === 0) return;
    const phoneNumber = "6281319807138"; 
    let message = "Halo, saya ingin memesan/bertanya tentang barang berikut dari katalog:\n\n";
    
    cart.forEach((item) => {
      message += `- ${item.name} (${item.quantity}x)\n`;
    });
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  const categories = [...new Set(products.map((item) => item.category))];

  let processedProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filterCategory !== "Semua") {
    processedProducts = processedProducts.filter(item => item.category === filterCategory);
  }

  return (
    <div className="app-container">
      <header className="hero">
        <div className="hero-overlay"></div>
      
        <div className="hero-content">
          <div className="hero-text">
            <h3>PT. Mitra Milionic Makmur</h3>
            <h1>Toko Besi Cahaya Milionic</h1>
            <h5>Toko besi dengan catalogue terlengkap di seluruh Indonesia!</h5>
            <h5>Hubungi +62 813-1980-7138 untuk informasi lebih lanjut</h5>
          </div>

          <div className="hero-map">
            <p>Anda bisa berkunjung ke toko kami di sini!</p>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.5447472755036!2d107.32246727452807!3d-6.323366493666136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69764d520ba531%3A0xf819aefabf6f2db1!2sTB%20Cahaya%20Milionic!5e0!3m2!1sen!2sid!4v1791173845009!5m2!1sen!2sid" 
              width="100%" 
              height="200" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>

        <div className="hero-search">
          <input
            type="text"
            placeholder="Cari alat atau perkakas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </header>

      <button className="floating-cart-btn" onClick={() => setIsCartOpen(true)}>
        🛒 Keranjang ({totalItems})
      </button>

      <div className="main-layout">
        <div className="filter-sort-bar">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)} 
            className="control-select"
          >
            <option value="Semua">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <main className="product-grid">
          {processedProducts.length > 0 ? (
            processedProducts.map((product) => (
              <ProductCard key={product.id} onAddToCart={addToCart} product={product}/>
            ))
          ) : (
            <p className="no-results">Produk tidak ditemukan.</p>
          )}
        </main>
      </div>

      <aside className={`cart-sidebar ${isCartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>Daftar Pesanan</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>✖</button>
        </div>

        {cart.length === 0 ? (
          <p>Daftar pesanan masih kosong.</p>
        ) : (
          <div className="cart-content">
            <div className="cart-table-header">
              <span>Produk</span>
              <span className="center-text">Qty</span>
            </div>

            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-table-row">
                  <span className="cart-item-name">{item.name}</span>
                  
                  <div className="cart-quantity-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <input 
                      type="number" 
                      min="0"
                      value={item.quantity} 
                      onChange={(e) => {
                        const newQty = parseInt(e.target.value, 10) || 0;
                        updateQuantity(item.id, newQty);
                      }}
                      className="cart-qty-input"
                    />
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={checkoutViaWhatsApp} className="checkout-btn">
              Pesan via WhatsApp
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}