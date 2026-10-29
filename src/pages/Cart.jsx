
import { useDispatch, useSelector } from "react-redux";
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from "../redux/cartSlice";
import { Link } from "react-router-dom";

export default function Cart() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);

  const subtotal = items.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  const formatPrice = (price) =>
    `₹${Number(price).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <p className="eyebrow">YOUR SHOPPING BAG</p>
          <h1>Your cart is empty</h1>
          <p>
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/" className="checkout-btn">
            Explore Collection →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <div>
          <p className="eyebrow">YOUR SHOPPING BAG</p>
          <h1>Shopping Cart</h1>
        </div>

        <span>{items.length} products</span>
      </div>

      <div className="cart-layout">
        <section className="cart-items">
          {items.map((item) => (
            <article className="cart-item" key={item.id}>
              <img
                src={item.image}
                alt={item.name}
                className="cart-item-image"
              />

              <div className="cart-item-details">
                <p className="product-category">
                  {item.category}
                </p>

                <h3>{item.name}</h3>

                <p className="cart-item-price">
                  {formatPrice(item.price)}
                </p>

                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button
                      type="button"
                      aria-label={`Decrease ${item.name} quantity`}
                      onClick={() =>
                        dispatch(decreaseQuantity(item.id))
                      }
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      aria-label={`Increase ${item.name} quantity`}
                      onClick={() =>
                        dispatch(increaseQuantity(item.id))
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="remove-item"
                    onClick={() =>
                      dispatch(removeFromCart(item.id))
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>

              <strong className="cart-line-total">
                {formatPrice(
                  Number(item.price) * item.quantity
                )}
              </strong>
            </article>
          ))}
        </section>

        <aside className="cart-summary">
          <p className="eyebrow">ORDER SUMMARY</p>
          <h2>Order details</h2>

          <div className="summary-row">
            <span>Items</span>
            <span>
              {items.reduce(
                (total, item) => total + item.quantity,
                0
              )}
            </span>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <p className="cart-note">
            Shipping charges, if applicable, will be confirmed
            during checkout.
          </p>

          <Link to="/checkout" className="checkout-btn">
            Proceed to Checkout →
          </Link>

          <Link to="/" className="continue-shopping">
            ← Continue Shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
