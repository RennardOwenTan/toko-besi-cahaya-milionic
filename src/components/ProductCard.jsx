import { useState } from "react";

export default function ProductCard({ product, onAddToCart }) {
  const [imgError, setImgError] = useState(false);
  
  // By default, select the first variant in the dropdown if variants exist
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : ""
  );

  const handleAddToCart = () => {
    // If a variant is selected, attach it to the name and ID for the cart
    const cartItem = {
      ...product,
      id: selectedVariant ? `${product.id}-${selectedVariant}` : product.id,
      name: selectedVariant ? `${product.name} ${selectedVariant}` : product.name
    };
    onAddToCart(cartItem);
  };

  return (
    <div className="product-card">
      {!imgError ? (
        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy" 
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="image-placeholder">
          <span className="placeholder-icon">🛠️</span>
          <span className="placeholder-text">Gambar belum tersedia</span>
        </div>
      )}

      <div className="card-body">
        <span className="badge">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="desc">{product.description}</p>
        
        {/* Render the dropdown ONLY if the item has variations */}
        {product.variants && product.variants.length > 0 && (
          <select 
            className="variant-select"
            value={selectedVariant} 
            onChange={(e) => setSelectedVariant(e.target.value)}
          >
            {product.variants.map((variant, index) => (
              <option key={index} value={variant}>{variant}</option>
            ))}
          </select>
        )}

        <button onClick={handleAddToCart} className="order-btn">
          Tambah ke Keranjang
        </button>
      </div>
    </div>
  );
}