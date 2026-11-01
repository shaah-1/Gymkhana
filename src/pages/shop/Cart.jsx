import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { increaseQuantity, decreaseQuantity, removeFromCart } from "../../redux/cartSlice";
import { formatCurrency } from "../../utils/formatters";

export default function Cart() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.cart.items);
  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <p className="eyebrow">YOUR SHOPPING BAG</p>
          <h1>Your cart is empty</h1>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="checkout-btn">Explore the Collection →</Link>
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
          {items.map((item) => {
            const stock = Number(item.stock ?? 0);
            return (
              <article className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <p className="product-category">{item.category}</p>
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">{formatCurrency(item.price)}</p>

                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => dispatch(decreaseQuantity(item.id))} disabled={item.quantity <= 1}>−</button>
                      <span>{item.quantity}</span>
                      <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => dispatch(increaseQuantity(item.id))} disabled={stock > 0 && item.quantity >= stock}>+</button>
                    </div>
                    <button type="button" className="remove-btn" onClick={() => dispatch(removeFromCart(item.id))}>Remove</button>
                  </div>
                </div>

                <div className="cart-item-total">
                  <p className="item-total-price">{formatCurrency(Number(item.price) * item.quantity)}</p>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="summary-row"><span>Shipping</span><span className="free-shipping">FREE</span></div>
          <div className="summary-divider" />
          <div className="summary-row total-row"><span>Total</span><span className="total-price">{formatCurrency(subtotal)}</span></div>

          <Link to="/checkout" className="checkout-btn">Proceed to Checkout →</Link>
          <Link to="/" className="continue-shopping">Continue Shopping</Link>
        </aside>
      </div>
    </main>
  );
}
