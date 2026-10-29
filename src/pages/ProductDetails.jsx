
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { addToCart } from "../redux/cartSlice";

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const cartItem = useSelector((state) =>
    state.cart.items.find((item) => String(item.id) === String(id))
  );

  const alreadyInCart = cartItem?.quantity || 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setQuantity(1);

        const response = await axios.get(
          `http://localhost:3000/products/${id}`
        );

        setProduct(response.data);
      } catch {
        setError("Product not found.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="product-details-status">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="product-details-status">
        <h2>{error || "Product not found."}</h2>
        <Link to="/" className="back-to-shop">← Back to Shop</Link>
      </div>
    );
  }

  const stock = Math.max(0, Number(product.stock) || 0);
  const remainingStock = Math.max(0, stock - alreadyInCart);

  const handleAddToCart = () => {
    if (quantity < 1 || quantity > remainingStock) return;

    // Add the selected quantity using the existing cart reducer.
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(product));
    }

    setShowPopup(true);
  };

  return (
    <main className="product-details-page">
      <Link to="/" className="back-to-shop">
        ← Back to Shop
      </Link>

      <section className="product-details-layout">
        <div className="product-details-image-wrap">
          <img
            src={product.image}
            alt={product.name}
            className="product-details-image"
          />
        </div>

        <div className="product-details-info">
          <p className="product-category">{product.category}</p>

          <h1>{product.name}</h1>

          <p className="product-details-description">
            {product.detailedDescription || product.description}
          </p>

          {product.benefits?.length > 0 && (
            <div className="product-short-benefits">
              <h3>Why you'll like it</h3>
              <ul>
                {product.benefits.slice(0, 3).map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="product-details-price">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </p>

          <p className={remainingStock > 0 ? "details-in-stock" : "details-out-stock"}>
            {stock === 0
              ? "Out of Stock"
              : remainingStock > 0
                ? `${remainingStock} available`
                : "Stock limit reached"}
          </p>

          <div className="details-purchase-row">
            <div className="quantity-selector">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() =>
                  setQuantity((q) => Math.min(remainingStock, q + 1))
                }
                disabled={quantity >= remainingStock}
              >
                +
              </button>
            </div>

            <button
              className="add-to-cart-btn details-add-btn"
              onClick={handleAddToCart}
              disabled={remainingStock <= 0 || quantity > remainingStock}
            >
              {remainingStock <= 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>

          {showPopup && (
            <div className="details-added-message" role="status">
              ✓ {quantity} {quantity === 1 ? "item" : "items"} added to cart
              <Link to="/cart">View Cart →</Link>
              <button onClick={() => setShowPopup(false)}>×</button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
