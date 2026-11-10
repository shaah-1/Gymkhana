import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { increaseQuantity, decreaseQuantity, removeFromCart } from "../../redux/cartSlice";
import { formatCurrency } from "../../utils/formatters";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
import "./Cart.css";

export default function Cart() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.cart.items);
  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-empty-cart">
          <span className="cart-eyebrow">YOUR SELECTIONS</span>
          <h1 className="cart-empty-title">Your shopping bag is empty.</h1>
          <p className="cart-empty-desc">
            There are currently no items in your bag. Explore our collection of premium sports nutrition, recovery formulas, and gym essentials.
          </p>
          <Link to="/" className="cart-btn-primary cart-empty-cta">
            <span>Explore the Collection</span>
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-container">
        {/* Editorial Cart Header */}
        <header className="cart-header">
          <div>
            <span className="cart-eyebrow">YOUR SELECTIONS</span>
            <h1 className="cart-title">
              Shopping Bag
              <span className="cart-item-count">
                ({items.length} {items.length === 1 ? "product" : "products"})
              </span>
            </h1>
          </div>
          <div className="cart-shipping-badge">
            <span className="badge-dot" aria-hidden="true" />
            <span>Complimentary carbon-neutral delivery included</span>
          </div>
        </header>

        <div className="cart-layout">
          {/* Products List Section */}
          <section className="cart-items-section" aria-label="Selected products">
            <div className="cart-items-table-header" aria-hidden="true">
              <span className="th-product">Item</span>
              <span className="th-qty">Quantity</span>
              <span className="th-total">Total</span>
            </div>

            <div className="cart-items-list">
              {items.map((item) => {
                const stock = Number(item.stock ?? 0);
                const lineTotal = Number(item.price) * item.quantity;
                return (
                  <article className="cart-row" key={item.id}>
                    {/* Floating Product Image */}
                    <Link to={`/products/${item.productId || item.id}`} className="cart-item-image-wrap" tabIndex={-1}>
                      <img src={publicAssetUrl(item.image)} alt={item.name} className="cart-item-image" loading="lazy" />
                    </Link>

                    {/* Product Details */}
                    <div className="cart-item-details">
                      <span className="cart-item-category">{item.category}</span>
                      <h2 className="cart-item-name">
                        <Link to={`/products/${item.productId || item.id}`}>{item.name}</Link>
                      </h2>
                      <span className="cart-item-unit-price">{formatCurrency(item.price)} each</span>

                      {stock > 0 && stock <= 3 && (
                        <span className="cart-low-stock">Only {stock} remaining in stock</span>
                      )}

                      {/* Mobile Stepper & Actions */}
                      <div className="cart-row-actions-mobile">
                        <div className="cart-stepper" role="group" aria-label={`Quantity for ${item.name}`}>
                          <button
                            type="button"
                            className="cart-stepper-btn"
                            aria-label={`Decrease ${item.name} quantity`}
                            onClick={() => dispatch(decreaseQuantity(item.id))}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="cart-stepper-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="cart-stepper-btn"
                            aria-label={`Increase ${item.name} quantity`}
                            onClick={() => dispatch(increaseQuantity(item.id))}
                            disabled={stock <= 0 || item.quantity >= stock}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="cart-remove-link"
                          onClick={() => dispatch(removeFromCart(item.id))}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Desktop Stepper */}
                    <div className="cart-row-qty-col">
                      <div className="cart-stepper" role="group" aria-label={`Quantity for ${item.name}`}>
                        <button
                          type="button"
                          className="cart-stepper-btn"
                          aria-label={`Decrease ${item.name} quantity`}
                          onClick={() => dispatch(decreaseQuantity(item.id))}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="cart-stepper-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="cart-stepper-btn"
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() => dispatch(increaseQuantity(item.id))}
                          disabled={stock <= 0 || item.quantity >= stock}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="cart-remove-link"
                        onClick={() => dispatch(removeFromCart(item.id))}
                      >
                        Remove
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="cart-row-total-col">
                      <span className="cart-line-total">{formatCurrency(lineTotal)}</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="cart-footer-nav">
              <Link to="/" className="cart-back-link">
                <ArrowLeft size={14} strokeWidth={2} />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </section>

          {/* Right Column: Order Summary Ledger */}
          <aside className="cart-summary-section">
            <div className="cart-summary-card">
              <h2 className="cart-summary-heading">Order Summary</h2>

              <dl className="cart-ledger">
                <div className="cart-ledger-row">
                  <dt>Subtotal</dt>
                  <dd>{formatCurrency(subtotal)}</dd>
                </div>
                <div className="cart-ledger-row">
                  <dt>Delivery</dt>
                  <dd className="cart-shipping-highlight">Complimentary</dd>
                </div>
                <div className="cart-ledger-row">
                  <dt>Taxes & GST</dt>
                  <dd>Calculated at checkout</dd>
                </div>

                <div className="cart-ledger-divider" />

                <div className="cart-ledger-row cart-ledger-total">
                  <dt>Estimated Total</dt>
                  <dd className="cart-total-amount">{formatCurrency(subtotal)}</dd>
                </div>
              </dl>

              <Link to="/checkout" className="cart-btn-primary">
                <span>Proceed to Checkout</span>
                <ArrowRight size={15} strokeWidth={2} />
              </Link>

              {/* Brand Guarantees */}
              <div className="cart-pledge">
                <div className="cart-pledge-item">
                  <span className="pledge-icon" aria-hidden="true">✓</span>
                  <div>
                    <strong>Pure Lab-Tested Formulations</strong>
                    <p>100% genuine ingredients without hidden fillers or banned substances.</p>
                  </div>
                </div>
                <div className="cart-pledge-item">
                  <span className="pledge-icon" aria-hidden="true">✓</span>
                  <div>
                    <strong>Complimentary Express Delivery</strong>
                    <p>Dispatched within 24 hours in discreet, climate-conscious packaging.</p>
                  </div>
                </div>
                <div className="cart-pledge-item">
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
