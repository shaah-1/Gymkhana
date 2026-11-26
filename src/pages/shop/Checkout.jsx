import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { storage as localStorage } from "../../utils/storage";
import { Link, useNavigate } from "react-router-dom";
import { Banknote } from "lucide-react";

import { clearCart, fetchCart } from "../../redux/cartSlice";
import { logout } from "../../redux/authSlice";
import { getUserById, signOutUser } from "../../services/authService";
import { getProductById } from "../../services/productService";
import { createOrder } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatters";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", detail: "Pay when your order arrives", Icon: Banknote },
];

const STEPS = [
  { id: 1, label: "Contact Information", shortLabel: "Contact" },
  { id: 2, label: "Shipping Address", shortLabel: "Shipping" },
  { id: 3, label: "Delivery Option", shortLabel: "Delivery" },
  { id: 4, label: "Payment Method", shortLabel: "Payment" },
];

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const cartLoading = useSelector((s) => s.cart.loading);
  const cartLoaded = useSelector((s) => s.cart.loaded);
  const cartError = useSelector((s) => s.cart.error);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const authUser = useSelector((s) => s.auth.user);

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    fullName: authUser?.name || authUser?.fullName || "",
    email: authUser?.email || "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [emailCheck, setEmailCheck] = useState({ status: "idle", message: "" });

  useEffect(() => {
    if (isAuthenticated && !cartLoaded && !cartLoading) {
      dispatch(fetchCart());
    }
  }, [cartLoaded, cartLoading, dispatch, isAuthenticated]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    getUserById(userId)
      .then(async (u) => {
        if (!u) return;
        if (u.blocked) {
          try {
            await signOutUser();
          } catch (signOutError) {
            console.error("Could not sign out a blocked account:", signOutError);
          }
          dispatch(logout());
          navigate("/login", {
            replace: true,
            state: {
              error: "Your account has been suspended by an administrator.",
              message: "Your account has been suspended by an administrator.",
            },
          });
          return;
        }
        setForm((prev) => ({
          ...prev,
          fullName: prev.fullName || u.name || u.fullName || "",
          email: prev.email || u.email || "",
        }));
      })
      .catch((profileError) => {
        setError(profileError.message || "Unable to verify your account.");
      });
  }, [dispatch, navigate]);

  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "email") setEmailCheck({ status: "idle", message: "" });
  };

  const verifyAccountEmail = async (email) => {
    const userId = localStorage.getItem("userId");
    const normalized = email.trim().toLowerCase();
    if (!userId || !normalized) return { valid: false, message: "Enter the email address linked to your account." };

    setEmailCheck({ status: "checking", message: "Checking your account…" });
    try {
      const user = await getUserById(userId);
      if (user?.blocked) {
        try {
          await signOutUser();
        } catch (signOutError) {
          console.error("Could not sign out a blocked account:", signOutError);
        }
        dispatch(logout());
        navigate("/login", {
          replace: true,
          state: {
            error: "Your account has been suspended by an administrator.",
            message: "Your account has been suspended by an administrator.",
          },
        });
        return { valid: false, message: "Your account has been suspended by an administrator." };
      }

      const registered = String(user?.email || "").trim().toLowerCase();
      if (!registered || registered !== normalized) {
        const msg = "This email does not match your account. Use your registered email to continue.";
        setEmailCheck({ status: "invalid", message: msg });
        return { valid: false, message: msg };
      }
      setEmailCheck({ status: "valid", message: "Account confirmed." });
      return { valid: true };
    } catch {
      const msg = "We couldn't find your account. Please sign in again.";
      setEmailCheck({ status: "invalid", message: msg });
      return { valid: false, message: msg };
    }
  };

  const handleNextFromContact = async () => {
    setError("");
    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    const emailRes = await verifyAccountEmail(form.email);
    if (!emailRes.valid) {
      setError(emailRes.message || "Please provide a valid account email.");
      return;
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setCurrentStep(2);
  };

  const handleNextFromShipping = () => {
    setError("");
    if (!form.address.trim()) {
      setError("Please enter your delivery address.");
      return;
    }
    if (!form.city.trim()) {
      setError("Please enter your city.");
      return;
    }
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }
    setCurrentStep(3);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      handleNextFromContact();
    } else if (currentStep === 2) {
      handleNextFromShipping();
    } else if (currentStep === 3) {
      setError("");
      setCurrentStep(4);
    } else {
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    const userId = localStorage.getItem("userId");
    if (!userId) return navigate("/login");
    if (items.length === 0) return setError("Your cart is empty.");

    setLoading(true);
    const check = await verifyAccountEmail(form.email);
    if (!check.valid) {
      setError(check.message);
      setLoading(false);
      return;
    }

    try {
      const checked = await Promise.all(
        items.map(async (cartItem) => ({
          cartItem,
          product: await getProductById(cartItem.productId || cartItem.id),
        }))
      );

      for (const { cartItem, product } of checked) {
        const stock = Number(product.stock ?? 0);
        const qty = Number(cartItem.quantity);
        if (!Number.isInteger(qty) || qty < 1) throw new Error(`Invalid quantity for ${product.name}.`);
        if (qty > stock) throw new Error(`${product.name}: only ${stock} item(s) available. Please update your cart.`);
      }

      const verifiedItems = checked.map(({ cartItem, product }) => ({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image || cartItem.image || "",
        quantity: Number(cartItem.quantity),
      }));

      const saved = await createOrder({
        customer: form,
        items: verifiedItems,
        paymentMethod,
      });

      setOrderId(saved.id);
      dispatch(clearCart());
      setSuccess(true);
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err.status === 404
          ? "A product could not be found. Please refresh your cart."
          : err.message?.includes("stock") ||
              err.message?.includes("available") ||
              err.message?.includes("Invalid quantity")
            ? err.message
            : "Unable to complete your order. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-success">
        <div className="checkout-success-icon">✓</div>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for shopping with GYMKHANA Nutrition.</p>
        <p>Order ID: {orderId}</p>
        <button type="button" onClick={() => navigate("/")}>Continue Shopping</button>
      </div>
    );
  }

  if (cartLoading || !cartLoaded) {
    return (
      <div className="checkout-empty" role="status">
        <h2>Loading your cart…</h2>
      </div>
    );
  }

  if (cartError && items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart couldn’t be loaded</h2>
        <p className="checkout-error" role="alert">{cartError}</p>
        <button type="button" onClick={() => dispatch(fetchCart())}>Try Again</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <button type="button" onClick={() => navigate("/")}>Browse Products</button>
      </div>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-content">
        <nav className="checkout-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/cart">Cart</Link>
          <span>/</span>
          <span aria-current="page">Checkout</span>
        </nav>

        {/* Top Progress Stepper Line (1 Contact -> 2 Shipping -> 3 Delivery -> 4 Payment) */}
        <div className="checkout-stepper-container" aria-label="Checkout Progress">
          <div className="checkout-stepper-bar">
            {STEPS.map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              const isNavigable = step.id < currentStep;

              return (
                <div key={step.id} className="checkout-stepper-item">
                  {idx > 0 && (
                    <div
                      className={`checkout-stepper-connector ${currentStep >= step.id ? "filled" : ""}`}
                      aria-hidden="true"
                    />
                  )}
                  <button
                    type="button"
                    className={`checkout-stepper-step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""} ${isNavigable ? "navigable" : ""}`}
                    onClick={() => {
                      if (isNavigable) {
                        setError("");
                        setCurrentStep(step.id);
                      }
                    }}
                    disabled={!isNavigable}
                    aria-current={isActive ? "step" : undefined}
                    title={isNavigable ? `Return to ${step.label}` : step.label}
                  >
                    <span className="checkout-stepper-label">
                      <span className="checkout-stepper-text-full">{step.label}</span>
                      <span className="checkout-stepper-text-short">{step.shortLabel}</span>
                    </span>
                    <span className="checkout-stepper-dot" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <h1>Checkout</h1>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleFormSubmit}>
            {/* Step 1: Contact Information */}
            {currentStep === 1 && (
              <section className="checkout-step">
                <h2>Contact Information</h2>
                <div className="checkout-fields-row">
                  <label>
                    Full Name
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      placeholder="Enter your full name"
                    />
                  </label>
                  <div className="checkout-email-field">
                    <label>
                      Email
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        onBlur={(e) => e.target.value.trim() && verifyAccountEmail(e.target.value)}
                      />
                    </label>
                    {emailCheck.message && (
                      <p
                        className={`checkout-email-feedback ${emailCheck.status}`}
                        role={emailCheck.status === "invalid" ? "alert" : "status"}
                      >
                        {emailCheck.message}
                      </p>
                    )}
                  </div>
                  <label>
                    Phone Number
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      autoComplete="tel"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                    />
                  </label>
                </div>

                {error && <p className="checkout-error" role="alert">{error}</p>}

                <div className="checkout-step-actions">
                  <button
                    type="button"
                    className="place-order-btn checkout-next-btn"
                    onClick={handleNextFromContact}
                  >
                    Continue to Shipping Address
                  </button>
                </div>
              </section>
            )}

            {/* Step 2: Shipping Address */}
            {currentStep === 2 && (
              <section className="checkout-step">
                <h2>Shipping Address</h2>
                <label>
                  Delivery Address
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    autoComplete="street-address"
                    placeholder="House number, street, area"
                    rows={2}
                  />
                </label>
                <div className="checkout-fields-row">
                  <label>
                    City
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      autoComplete="address-level2"
                      placeholder="City"
                    />
                  </label>
                  <label>
                    PIN Code
                    <input
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{6}"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="6-digit PIN"
                    />
                  </label>
                </div>

                {error && <p className="checkout-error" role="alert">{error}</p>}

                <div className="checkout-step-actions checkout-step-actions-split">
                  <button
                    type="button"
                    className="checkout-back-btn"
                    onClick={() => {
                      setError("");
                      setCurrentStep(1);
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="place-order-btn checkout-next-btn"
                    onClick={handleNextFromShipping}
                  >
                    Continue to Delivery Option
                  </button>
                </div>
              </section>
            )}

            {/* Step 3: Delivery Option */}
            {currentStep === 3 && (
              <section className="checkout-step checkout-payment-step">
                <h2>Delivery Option</h2>
                <p className="checkout-delivery-note">Your order will be delivered to the address provided above.</p>

                {error && <p className="checkout-error" role="alert">{error}</p>}

                <div className="checkout-step-actions checkout-step-actions-split">
                  <button
                    type="button"
                    className="checkout-back-btn"
                    onClick={() => {
                      setError("");
                      setCurrentStep(2);
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="place-order-btn checkout-next-btn"
                    onClick={() => {
                      setError("");
                      setCurrentStep(4);
                    }}
                  >
                    Continue to Payment Method
                  </button>
                </div>
              </section>
            )}

            {/* Step 4: Payment Method */}
            {currentStep === 4 && (
              <section className="checkout-step checkout-payment-step">
                <h2>Payment Method</h2>
                <div className="payment-method-options">
                  {PAYMENT_METHODS.map((m) => (
                    <label key={m.id} className={`payment-method-option ${paymentMethod === m.id ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={m.id}
                        checked={paymentMethod === m.id}
                        onChange={() => setPaymentMethod(m.id)}
                      />
                      <m.Icon className="payment-method-icon" size={18} strokeWidth={1.6} aria-hidden="true" />
                      <span className="payment-method-copy">
                        <strong>{m.label}</strong>
                        <small>{m.detail}</small>
                      </span>
                    </label>
                  ))}
                </div>

                <p className="checkout-payment-note">
                  Online payments are not connected yet. Only cash on delivery is available; this checkout will not collect card or UPI details.
                </p>

                {error && <p className="checkout-error" role="alert">{error}</p>}

                <div className="checkout-step-actions checkout-step-actions-split">
                  <button
                    type="button"
                    className="checkout-back-btn"
                    onClick={() => {
                      setError("");
                      setCurrentStep(3);
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="place-order-btn"
                    disabled={loading}
                  >
                    {loading ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </section>
            )}
          </form>

          {/* Right Column: Original Order Summary */}
          <aside className="checkout-summary">
            <h2>Your Order <span>({items.reduce((c, i) => c + i.quantity, 0)})</span></h2>
            <div className="checkout-order-images">
              {items.map((i) => (
                <div className="checkout-order-image" key={i.id}>
                  <img src={publicAssetUrl(i.image)} alt={i.name} />
                  <span>{i.quantity}</span>
                </div>
              ))}
            </div>

            <div className="checkout-order-items">
              {items.map((i) => (
                <div className="checkout-item" key={i.id}>
                  <div>
                    <strong>{i.name}</strong>
                    <p>Quantity: {i.quantity}</p>
                  </div>
                  <span>{formatCurrency(Number(i.price) * i.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="checkout-total-row">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="checkout-total checkout-grand-total">
                <span>Total</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
