
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Smartphone, CreditCard, Landmark, Wallet, Banknote } from "lucide-react";
import { removeFromCart } from "../redux/cartSlice";
import "./Checkout.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((state) => state.cart.items);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [emailVerification, setEmailVerification] = useState({ status: "idle", message: "" });

  const paymentMethods = [
    { id: "upi", label: "UPI", detail: "Pay using any UPI app", Icon: Smartphone },
    { id: "card", label: "Credit / Debit Card", detail: "Visa, Mastercard and RuPay", Icon: CreditCard },
    { id: "netbanking", label: "Net Banking", detail: "Pay through your bank", Icon: Landmark },
    { id: "wallet", label: "Wallet", detail: "Use a supported digital wallet", Icon: Wallet },
    { id: "cod", label: "Cash on Delivery", detail: "Pay when your order arrives", Icon: Banknote },
  ];

  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "email") {
      setEmailVerification({ status: "idle", message: "" });
    }
  };

  const verifyAccountEmail = async (email) => {
    const userId = localStorage.getItem("userId");
    const normalizedEmail = email.trim().toLowerCase();

    if (!userId || !normalizedEmail) {
      const message = "Enter the email address linked to your account.";
      setEmailVerification({ status: "invalid", message });
      return { valid: false, message };
    }

    setEmailVerification({ status: "checking", message: "Checking your account…" });

    try {
      const response = await axios.get(
        `${API_URL}/users/${encodeURIComponent(userId)}`
      );
      const registeredEmail = String(response.data.email || "").trim().toLowerCase();

      if (!registeredEmail || registeredEmail !== normalizedEmail) {
        const message = "This email does not match your account. Use your registered email to continue.";
        setEmailVerification({ status: "invalid", message });
        return { valid: false, message };
      }

      const message = "Account confirmed.";
      setEmailVerification({ status: "valid", message });
      return { valid: true, message };
    } catch {
      const message = "We couldn't find your account. Please sign in again.";
      setEmailVerification({ status: "invalid", message });
      return { valid: false, message };
    }
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  const userId = localStorage.getItem("userId");

  if (!userId) {
    navigate("/login");
    return;
  }

  if (items.length === 0) {
    setError("Your cart is empty.");
    return;
  }

  setLoading(true);

  const accountCheck = await verifyAccountEmail(form.email);
  if (!accountCheck.valid) {
    setError(accountCheck.message);
    setLoading(false);
    return;
  }

  const updatedProducts = [];
  let orderSaved = false;

  try {
    // 1. Fetch the latest product data from JSON Server
    const checkedProducts = await Promise.all(
      items.map(async (item) => {
        const response = await axios.get(
          `${API_URL}/products/${encodeURIComponent(item.id)}`
        );

        return {
          cartItem: item,
          product: response.data,
        };
      })
    );

    // 2. Validate stock for every cart item
    for (const { cartItem, product } of checkedProducts) {
      const availableStock = Number(product.stock ?? 0);

      if (
        !Number.isInteger(Number(cartItem.quantity)) ||
        Number(cartItem.quantity) < 1
      ) {
        throw new Error(
          `Invalid quantity for ${product.name}.`
        );
      }

      if (Number(cartItem.quantity) > availableStock) {
        throw new Error(
          `${product.name}: only ${availableStock} item(s) available. Please update your cart.`
        );
      }
    }

    // 3. Deduct stock from JSON Server
    for (const { cartItem, product } of checkedProducts) {
      const oldStock = Number(product.stock ?? 0);
      const newStock = oldStock - Number(cartItem.quantity);

      const response = await axios.patch(
        `${API_URL}/products/${encodeURIComponent(product.id)}`,
        { stock: newStock }
      );

      updatedProducts.push({
        id: product.id,
        stock: oldStock,
        updatedStock: response.data.stock,
      });
    }

    // 4. Prepare the order using the verified products
    const verifiedItems = checkedProducts.map(
      ({ cartItem, product }) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: Number(cartItem.quantity),
      })
    );

    const verifiedTotal = verifiedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = {
      userId: String(userId),
      customer: form,
      items: verifiedItems,
      total: verifiedTotal,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pay_on_delivery" : "payment_pending",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // 5. Save the order
    const response = await axios.post(
      `${API_URL}/orders`,
      order
    );

    orderSaved = true;
    setOrderId(response.data.id);

    // 6. Clear the cart only after successful order placement
    items.forEach((item) => {
      dispatch(removeFromCart(item.id));
    });

    setSuccess(true);
  } catch (err) {
    console.error("Checkout error:", err);

    // Restore stock if an update succeeded but the order failed
    if (!orderSaved) {
      for (const updated of [...updatedProducts].reverse()) {
        try {
          // Avoid overwriting a stock value changed by someone else
          const current = await axios.get(
            `${API_URL}/products/${encodeURIComponent(updated.id)}`
          );

          if (
            Number(current.data.stock) ===
            Number(updated.updatedStock)
          ) {
            await axios.patch(
              `${API_URL}/products/${encodeURIComponent(updated.id)}`,
              { stock: updated.stock }
            );
          }
        } catch (rollbackError) {
          console.error(
            "Could not restore product stock:",
            updated.id,
            rollbackError
          );
        }
      }
    }

    setError(
      err.response?.status === 404
        ? "A product could not be found. Please refresh your cart."
        : err.message?.includes("available") ||
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
        <button onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate("/")}>
          Browse Products
        </button>
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

        <h1>Checkout</h1>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <section className="checkout-step">
              <h2><span>1</span> Contact Information</h2>

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
                      onBlur={(event) => {
                        if (event.target.value.trim()) {
                          verifyAccountEmail(event.target.value);
                        }
                      }}
                    />
                  </label>

                  {emailVerification.message && (
                    <p
                      className={`checkout-email-feedback ${emailVerification.status}`}
                      role={emailVerification.status === "invalid" ? "alert" : "status"}
                    >
                      {emailVerification.message}
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
                    title="Enter a 10-digit mobile number"
                  />
                </label>
              </div>
            </section>

            <section className="checkout-step">
              <h2><span>2</span> Shipping Address</h2>
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
                    title="Enter a 6-digit PIN code"
                  />
                </label>
              </div>
            </section>

            <section className="checkout-step checkout-payment-step">
              <h2><span>3</span> Delivery Option</h2>
              <p className="checkout-delivery-note">
                Your order will be delivered to the address provided above.
              </p>
            </section>

            <section className="checkout-step checkout-payment-step">
              <h2><span>4</span> Payment</h2>
              <div className="payment-method-options">
                {paymentMethods.map((method) => (
                  <label
                    className={`payment-method-option ${paymentMethod === method.id ? "selected" : ""}`}
                    key={method.id}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                    />
                    <method.Icon className="payment-method-icon" size={18} strokeWidth={1.6} aria-hidden="true" />
                    <span className="payment-method-copy">
                      <strong>{method.label}</strong>
                      <small>{method.detail}</small>
                    </span>
                  </label>
                ))}
              </div>
              <p className="checkout-payment-note">
                {paymentMethod === "cod"
                  ? "Pay the order total when your delivery arrives."
                  : "Online payment processing is not connected yet. Your selected method will be saved with the order."}
              </p>
            </section>

            {error && (
              <p className="checkout-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="place-order-btn"
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>

          </form>

          <aside className="checkout-summary">
            <h2>Your Order <span>({items.reduce((count, item) => count + item.quantity, 0)})</span></h2>

            <div className="checkout-order-images">
              {items.map((item) => (
                <div className="checkout-order-image" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <span>{item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="checkout-order-items">
              {items.map((item) => (
                <div className="checkout-item" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <span>
                    ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="checkout-total-row">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="checkout-total checkout-grand-total">
                <span>Total</span>
                <strong>₹{total.toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
