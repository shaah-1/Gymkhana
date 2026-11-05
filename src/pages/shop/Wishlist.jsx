import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, X } from "lucide-react";
import { fetchWishlist, toggleWishlist } from "../../redux/wishlistSlice";
import { addToCart } from "../../redux/cartSlice";
import { formatCurrency } from "../../utils/formatters";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
import "./Wishlist.css";

export default function Wishlist() {
  const dispatch = useDispatch();
  const { items = [], loading = false, error = null } = useSelector((s) => s.wishlist || {});
  const userId = useSelector((s) => s.auth?.userId);

  const [addedMap, setAddedMap] = useState({});

  useEffect(() => {
    if (userId && items.length === 0) {
      dispatch(fetchWishlist(userId));
    }
  }, [dispatch, userId, items.length]);

  const handleAddToCart = (product) => {
    const stock = Number(product.stock ?? 10);
    if (stock <= 0) return;

    const prodId = product.productId || product.id;
    dispatch(addToCart(product));
    setAddedMap((prev) => ({ ...prev, [prodId]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [prodId]: false }));
    }, 1400);
  };

  const handleRemove = (product) => {
    dispatch(toggleWishlist(product));
  };

  return (
    <main className="wishlist-page">
      <div className="wishlist-container">
        {/* Header */}
        <header className="wishlist-header">
          <div>
            <span className="wishlist-eyebrow">YOUR COLLECTION</span>
            <h1 className="wishlist-title">
              My Wishlist
              {items.length > 0 && (
                <span className="wishlist-count-badge">({items.length})</span>
              )}
            </h1>
            <p className="wishlist-subtitle">
              Your curated selection of precision performance and health formulations.
            </p>
          </div>
          <Link to="/shop" className="wishlist-header-link">
            Explore All Formulations &rarr;
          </Link>
        </header>

        {/* Loading State */}
        {loading && items.length === 0 && (
          <div className="wishlist-status-state" role="status">
            <p>Loading your saved formulations...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && items.length === 0 && (
          <div className="wishlist-status-state" role="alert">
            <p>{error || "Unable to load wishlist formulations."}</p>
            <button
              type="button"
              className="wishlist-retry-btn"
              onClick={() => userId && dispatch(fetchWishlist(userId))}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="wishlist-empty-box">
            <div className="wishlist-empty-icon" aria-hidden="true">
              <Heart size={26} strokeWidth={1.5} />
            </div>
            <h2 className="wishlist-empty-title">Your wishlist is empty</h2>
            <p className="wishlist-empty-desc">
              Explore our nutritional architectures and click the heart icon on any formulation to save it here for easy reference and checkout.
            </p>
            <Link to="/shop" className="wishlist-empty-btn">
              Explore Formulations &rarr;
            </Link>
          </div>
        )}

        {/* Wishlist Product Grid */}
        {items.length > 0 && (
          <div className="wishlist-grid">
            {items.map((product) => {
              const prodId = product.productId || product.id;
              const isAdded = Boolean(addedMap[prodId]);
              const stock = Number(product.stock ?? 10);
              const isOutOfStock = stock <= 0;

              return (
                <article className="wishlist-product-card" key={product.id || prodId}>
                  {/* Remove Button */}
                  <button
                    type="button"
                    className="wishlist-card-remove-btn"
                    aria-label={`Remove ${product.name} from wishlist`}
                    title="Remove from wishlist"
                    onClick={() => handleRemove(product)}
                  >
                    <X size={15} strokeWidth={2} />
                  </button>

                  {/* Stage Image */}
                  <div className="wishlist-card-stage">
                    <Link to={`/products/${prodId}`} aria-label={`View ${product.name}`}>
                      <img
                        src={publicAssetUrl(product.image)}
                        alt={product.name}
                        className="wishlist-card-img"
                        loading="lazy"
                      />
                    </Link>
                  </div>

                  {/* Card Content */}
                  <div className="wishlist-card-content">
                    {product.category && (
                      <p className="wishlist-card-category">{product.category}</p>
                    )}

                    <h3 className="wishlist-card-name">
                      <Link to={`/products/${prodId}`}>{product.name}</Link>
                    </h3>

                    <div className="wishlist-card-pricing">
                      <span className="wishlist-card-price">
                        {formatCurrency(product.price)}
                      </span>
                    </div>

                    <div className={`wishlist-stock-tag ${isOutOfStock ? "out" : ""}`}>
                      <span className="wishlist-stock-dot" aria-hidden="true" />
                      <span>{isOutOfStock ? "Out of Stock" : "In Stock"}</span>
                    </div>

                    {/* Actions */}
                    <div className="wishlist-card-actions">
                      <button
                        type="button"
                        className={`wishlist-add-cart-btn ${isAdded ? "added" : ""}`}
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                      >
                        {isAdded ? "Added ✓" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>

                      <Link to={`/products/${prodId}`} className="wishlist-view-btn">
                        View Formulation
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
