import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart } from "lucide-react";

import { toggleWishlist } from "../redux/wishlistSlice";
import { addToCart } from "../redux/cartSlice";
import { formatCurrency } from "../utils/formatters";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPopup, setShowPopup] = useState(false);
  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  const cartItem = useSelector((s) => s.cart.items.find((i) => String(i.id) === String(product.id)));
  const isFavorite = useSelector((s) => s.wishlist.items.some((i) => String(i.id) === String(product.id)));

  useEffect(() => {
    if (!showPopup) return;
    const t = setTimeout(() => setShowPopup(false), 1000);
    return () => clearTimeout(t);
  }, [showPopup]);

  const stock = Math.max(0, Number(product.stock) || 0);
  const cartQty = Number(cartItem?.quantity) || 0;
  const availableToAdd = Math.max(0, stock - cartQty);

  const stockStatus = stock === 0 ? "out-of-stock" : stock <= 3 ? "low-stock" : "in-stock";
  const stockLabel = stock === 0 ? "Out of Stock" : stock <= 3 ? `Only ${stock} left` : "In Stock";

  const handleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuth) return navigate("/login", { state: { from: location } });
    dispatch(toggleWishlist(product));
  };

  const handleAddToCart = () => {
    if (availableToAdd <= 0) return;
    if (!isAuth) return navigate("/login", { state: { from: location } });
    dispatch(addToCart(product));
    setShowPopup(true);
  };

  return (
    <div className="product-card">
      <button
        type="button"
        className={`wishlist-button ${isFavorite ? "active" : ""}`}
        onClick={handleWishlist}
        aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={isFavorite}
      >
        <Heart size={15} strokeWidth={1.8} fill={isFavorite ? "currentColor" : "none"} />
      </button>

      <img src={product.image} alt={product.name} className="product-image" loading="lazy" />

      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <p className="product-price">{formatCurrency(product.price)}</p>

        <div className={`stock-badge ${stockStatus}`}>
          <span className="stock-dot" />
          {stockLabel}
        </div>

        {stock > 0 && availableToAdd === 0 && (
          <p className="stock-limit-message">Maximum available quantity added</p>
        )}

        <Link to={`/products/${product.id}`} className="view-details-btn">
          View Details →
        </Link>

        <button
          type="button"
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={availableToAdd <= 0}
        >
          {stock === 0 ? "Out of Stock" : availableToAdd === 0 ? "Stock Limit Reached" : "Add to Cart"}
        </button>
      </div>

      {showPopup &&
        createPortal(
          <div className="popup-overlay">
            <div className="cart-added-modal" role="dialog" aria-modal="true" aria-labelledby={`cart-added-title-${product.id}`}>
              <button type="button" className="cart-added-close" aria-label="Close" onClick={() => setShowPopup(false)}>×</button>
              <div className="cart-added-check" aria-hidden="true">✓</div>
              <p className="cart-added-eyebrow">Added to cart</p>
              <h2 id={`cart-added-title-${product.id}`}>{product.name}</h2>
              <Link to="/cart" className="cart-added-link">View cart</Link>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
