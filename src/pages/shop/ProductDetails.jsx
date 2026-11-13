import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/cartSlice";
import { getProductById } from "../../services/productService";
import { formatCurrency } from "../../utils/formatters";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
import Toast from "../../components/Toast";

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  const cartItem = useSelector((s) => s.cart.items.find((i) => String(i.productId || i.id) === String(id)));

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupKey, setPopupKey] = useState(0);

  const alreadyInCart = cartItem?.quantity || 0;

  useEffect(() => {
    let active = true;
    getProductById(id)
      .then((data) => active && setProduct(data))
      .catch(() => active && setError("Product not found."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="product-details-status">Loading product...</div>;
  if (error || !product) {
    return (
      <div className="product-details-status">
        <h2>{error || "Product not found."}</h2>
        <Link to="/" className="back-to-shop">← Back to Shop</Link>
      </div>
    );
  }

  const stock = Math.max(0, Number(product.stock) || 0);
  const remaining = Math.max(0, stock - alreadyInCart);

  const handleAddToCart = () => {
    if (quantity < 1 || quantity > remaining) return;
    if (!isAuth) return navigate("/login", { state: { from: location } });

    dispatch(addToCart({ ...product, quantity }));
    setPopupKey((k) => k + 1);
    setShowPopup(true);
  };

  return (
    <main className="product-details-page">
      <Link to="/" className="back-to-shop"> ← Back to Shop</Link>

      <section className="product-details-layout">
        <div className="product-details-image-wrap">
          <img src={publicAssetUrl(product.image)} alt={product.name} className="product-details-image" />
        </div>

        <div className="product-details-info">
          <p className="product-category">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="product-details-description">{product.detailedDescription || product.description}</p>

          {product.benefits?.length > 0 && (
            <div className="product-short-benefits">
              <h3>Why you'll like it</h3>
              <ul>
                {product.benefits.slice(0, 3).map((b, idx) => <li key={idx}>{b}</li>)}
              </ul>
            </div>
          )}

          <p className="product-details-price">{formatCurrency(product.price)}</p>

          <div className="details-stock-status-wrap">
            <span
              className={`details-stock-badge ${
                stock === 0 ? "out-of-stock" : remaining <= 3 ? "low-stock" : "in-stock"
              }`}
            >
              <span className="details-stock-dot" aria-hidden="true" />
              <span>
                {stock === 0
                  ? "Out of Stock"
                  : remaining <= 0
                  ? "Stock limit reached in cart"
                  : remaining <= 3
                  ? `Only ${remaining} left in stock`
                  : `In Stock (${remaining} available)`}
              </span>
            </span>
          </div>

          <div className="details-purchase-row">
            <div className="quantity-selector">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
              <span>{quantity}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((q) => Math.min(remaining, q + 1))} disabled={quantity >= remaining}>+</button>
            </div>

            <button type="button" className="add-to-cart-btn details-add-btn" onClick={handleAddToCart} disabled={remaining <= 0 || quantity > remaining}>
              {remaining <= 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>

          {showPopup &&
            createPortal(
              <Toast
                key={popupKey}
                message="Added to cart."
                action={
                  <Link to="/cart" className="toast-action-link" onClick={() => setShowPopup(false)}>
                    View cart
                  </Link>
                }
                onClose={() => setShowPopup(false)}
              />,
              document.body,
            )}
        </div>
      </section>
    </main>
  );
}
