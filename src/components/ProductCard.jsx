
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { toggleWishlist } from "../redux/wishlistSlice";
import { addToCart } from "../redux/cartSlice";

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [showPopup, setShowPopup] = useState(false);

  // Find this product in the cart
  const cartItem = useSelector((state) =>
    state.cart.items.find(
      (item) => String(item.id) === String(product.id)
    )
  );

  // Check if this product is in the wishlist
  const isFavorite = useSelector((state) =>
    state.wishlist.items.some(
      (item) => String(item.id) === String(product.id)
    )
  );

  // Stock and cart quantity
  const stock = Math.max(0, Number(product.stock) || 0);
  const cartQuantity = Number(cartItem?.quantity) || 0;
  const availableToAdd = Math.max(0, stock - cartQuantity);

  const stockStatus =
    stock === 0
      ? "out-of-stock"
      : stock <= 3
        ? "low-stock"
        : "in-stock";

  const stockLabel =
    stock === 0
      ? "Out of Stock"
      : stock <= 3
        ? `Only ${stock} left`
        : "In Stock";

  // Toggle wishlist
  const handleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(toggleWishlist(product));
  };

  // Add product to cart
  const handleAddToCart = () => {
    if (availableToAdd <= 0) return;

    dispatch(addToCart(product));
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 1800);
  };

  return (
    <div className="product-card">
      <button
        type="button"
        className={`wishlist-button ${isFavorite ? "active" : ""}`}
        onClick={handleWishlist}
        aria-label={
          isFavorite
            ? "Remove from wishlist"
            : "Add to wishlist"
        }
        aria-pressed={isFavorite}
      >
        <Heart
          size={15}
          strokeWidth={1.8}
          fill={isFavorite ? "currentColor" : "none"}
        />
      </button>

      <img
        src={product.image}
        alt={product.name}
        className="product-image"
        loading="lazy"
      />

      <div className="product-info">
        <p className="product-category">
          {product.category}
        </p>

        <h3>{product.name}</h3>

        <p className="product-description">
          {product.description}
        </p>

        <p className="product-price">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </p>

        <div className={`stock-badge ${stockStatus}`}>
          <span className="stock-dot" />
          {stockLabel}
        </div>

        {stock > 0 && availableToAdd === 0 && (
          <p className="stock-limit-message">
            Maximum available quantity added
          </p>
        )}

        <Link
          to={`/products/${product.id}`}
          className="view-details-btn"
        >
          View Details →
        </Link>

        <button
          type="button"
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={availableToAdd <= 0}
        >
          {stock === 0
            ? "Out of Stock"
            : availableToAdd === 0
              ? "Stock Limit Reached"
              : "Add to Cart"}
        </button>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="success-popup">
            <div className="success-icon">✓</div>
            <h3>Item added successfully</h3>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
