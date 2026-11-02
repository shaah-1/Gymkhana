import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { increaseQuantity, decreaseQuantity, removeFromCart } from "../../redux/cartSlice";
import { formatCurrency } from "../../utils/formatters";
import "./Cart.css";

export default function Cart() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.cart.items);
  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  if (items.length === 0) {
    return (
      <main className="aesop-cart-page">
        <div className="aesop-empty-cart">
          <span className="aesop-eyebrow">YOUR SELECTIONS</span>
          <h1 className="aesop-empty-title">Your shopping bag is empty.</h1>
          <p className="aesop-empty-desc">
            There are currently no items in your bag. Explore our collection of premium sports nutrition, recovery formulas, and gym essentials.
          </p>
          <Link to="/" className="aesop-btn-primary aesop-empty-cta">
            <span>Explore the Collection</span>
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="aesop-cart-page">
      <div className="aesop-cart-container">
        {/* Editorial Aesop Header */}
        <header className="aesop-cart-header">
          <div>
            <span className="aesop-eyebrow">YOUR SELECTIONS</span>
            <h1 className="aesop-cart-title">
              Shopping Bag
              <span className="aesop-item-count">
                ({items.length} {items.length === 1 ? "product" : "products"})
              </span>
            </h1>
          </div>
          <div className="aesop-shipping-badge">
            <span className="badge-dot" aria-hidden="true" />
            <span>Complimentary carbon-neutral delivery included</span>
          </div>
        </header>

        <div className="aesop-cart-layout">
          {/* Products List Section */}
          <section className="aesop-cart-items-section" aria-label="Selected products">
            <div className="aesop-items-table-header" aria-hidden="true">
              <span className="th-product">Item</span>
              <span className="th-qty">Quantity</span>
              <span className="th-total">Total</span>
            </div>

            <div className="aesop-items-list">
              {items.map((item) => {
                const stock = Number(item.stock ?? 0);
                const lineTotal = Number(item.price) * item.quantity;
                return (
                  <article className="aesop-cart-row" key={item.id}>
                    {/* Floating Product Image */}
                    <Link to={`/products/${item.id}`} className="aesop-item-image-wrap" tabIndex={-1}>
                      <img src={item.image} alt={item.name} className="aesop-item-image" loading="lazy" />
                    </Link>

                    {/* Product Details */}
                    <div className="aesop-item-details">
                      <span className="aesop-item-category">{item.category}</span>
                      <h2 className="aesop-item-name">
                        <Link to={`/products/${item.id}`}>{item.name}</Link>
                      </h2>
                      <span className="aesop-item-unit-price">{formatCurrency(item.price)} each</span>

                      {stock > 0 && stock <= 3 && (
                        <span className="aesop-low-stock">Only {stock} remaining in stock</span>
                      )}

                      {/* Mobile Stepper & Actions */}
                      <div className="aesop-row-actions-mobile">
                        <div className="aesop-stepper" role="group" aria-label={`Quantity for ${item.name}`}>
                          <button
                            type="button"
                            className="aesop-stepper-btn"
                            aria-label={`Decrease ${item.name} quantity`}
                            onClick={() => dispatch(decreaseQuantity(item.id))}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="aesop-stepper-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="aesop-stepper-btn"
                            aria-label={`Increase ${item.name} quantity`}
                            onClick={() => dispatch(increaseQuantity(item.id))}
                            disabled={stock > 0 && item.quantity >= stock}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="aesop-remove-link"
                          onClick={() => dispatch(removeFromCart(item.id))}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Desktop Stepper */}
                    <div className="aesop-row-qty-col">
                      <div className="aesop-stepper" role="group" aria-label={`Quantity for ${item.name}`}>
                        <button
                          type="button"
                          className="aesop-stepper-btn"
                          aria-label={`Decrease ${item.name} quantity`}
                          onClick={() => dispatch(decreaseQuantity(item.id))}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="aesop-stepper-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="aesop-stepper-btn"
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() => dispatch(increaseQuantity(item.id))}
                          disabled={stock > 0 && item.quantity >= stock}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="aesop-remove-link"
                        onClick={() => dispatch(removeFromCart(item.id))}
                      >
                        Remove
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="aesop-row-total-col">
                      <span className="aesop-line-total">{formatCurrency(lineTotal)}</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="aesop-cart-footer-nav">
              <Link to="/" className="aesop-back-link">
                <ArrowLeft size={14} strokeWidth={2} />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </section>

          {/* Right Column: Order Summary Ledger */}
          <aside className="aesop-cart-summary-section">
            <div className="aesop-summary-card">
              <h2 className="aesop-summary-heading">Order Summary</h2>

              <dl className="aesop-ledger">
                <div className="aesop-ledger-row">
                  <dt>Subtotal</dt>
                  <dd>{formatCurrency(subtotal)}</dd>
                </div>
                <div className="aesop-ledger-row">
                  <dt>Delivery</dt>
                  <dd className="aesop-shipping-highlight">Complimentary</dd>
                </div>
                <div className="aesop-ledger-row">
                  <dt>Taxes & GST</dt>
                  <dd>Calculated at checkout</dd>
                </div>

                <div className="aesop-ledger-divider" />

                <div className="aesop-ledger-row aesop-ledger-total">
                  <dt>Estimated Total</dt>
                  <dd className="aesop-total-amount">{formatCurrency(subtotal)}</dd>
                </div>
              </dl>

              <Link to="/checkout" className="aesop-btn-primary">
                <span>Proceed to Checkout</span>
                <ArrowRight size={15} strokeWidth={2} />
              </Link>

              {/* Aesop Brand Guarantees */}
              <div className="aesop-pledge">
                <div className="aesop-pledge-item">
                  <span className="pledge-icon" aria-hidden="true">✓</span>
                  <div>
                    <strong>Pure Lab-Tested Formulations</strong>
                    <p>100% genuine ingredients without hidden fillers or banned substances.</p>
                  </div>
                </div>
                <div className="aesop-pledge-item">
                  <span className="pledge-icon" aria-hidden="true">✓</span>
                  <div>
                    <strong>Complimentary Express Delivery</strong>
                    <p>Dispatched within 24 hours in discreet, climate-conscious packaging.</p>
                  </div>
                </div>
                <div className="aesop-pledge-item">
                  <span className="pledge-icon" aria-hidden="true">✓</span>
                  <div>
                    <strong>Hassle-Free Returns</strong>
                    <p>30-day satisfaction guarantee on every single purchase.</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
