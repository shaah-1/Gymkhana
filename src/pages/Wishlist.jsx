
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart } from "lucide-react";
import { toggleWishlist } from "../redux/wishlistSlice";
import { storefrontCopy } from "../copy/storefrontCopy";

export default function Wishlist() {
  const dispatch = useDispatch();

  const items = useSelector((state) => state.wishlist.items);

  return (
    <main className="wishlist-page">
      <p className="eyebrow">YOUR COLLECTION</p>
      <h1>
        My Wishlist <Heart size={20} strokeWidth={1.8} className="wishlist-heading-icon" />
      </h1>
      <p className="wishlist-subtitle">
        Your favorite picks, all in one place.
      </p>

      {items.length === 0 ? (
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon-wrap">
            <Heart size={44} strokeWidth={1.3} className="wishlist-empty-heart" />
          </div>
          <h2>Your wishlist is waiting.</h2>
          <p>Save products you love and find them here.</p>
          <Link to="/" className="hero-button">
            {storefrontCopy.collectionLink}
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {items.map((product) => (
            <article className="wishlist-card" key={product.id}>
              <Link to={`/products/${product.id}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="wishlist-image"
                />
              </Link>

              <p className="product-category">{product.category}</p>
              <h3>{product.name}</h3>
              <p className="wishlist-price">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </p>

              <div className="wishlist-actions">
                <Link
                  to={`/products/${product.id}`}
                  className="view-details-btn"
                >
                  View Product
                </Link>

                <button
                  type="button"
                  className="wishlist-remove"
                  onClick={() => dispatch(toggleWishlist(product))}
                >
                  <Heart size={13} strokeWidth={1.8} fill="currentColor" />
                  <span>Remove</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
