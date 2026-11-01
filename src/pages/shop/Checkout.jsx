import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Smartphone, CreditCard, Landmark, Wallet, Banknote } from "lucide-react";

import { clearCart } from "../../redux/cartSlice";
import { getUserById } from "../../services/authService";
import { getProductById, updateProductStock } from "../../services/productService";
import { createOrder } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatters";
import "./Checkout.css";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", detail: "Pay using any UPI app", Icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", detail: "Visa, Mastercard and RuPay", Icon: CreditCard },
  { id: "netbanking", label: "Net Banking", detail: "Pay through your bank", Icon: Landmark },
  { id: "wallet", label: "Wallet", detail: "Use a supported digital wallet", Icon: Wallet },
  { id: "cod", label: "Cash on Delivery", detail: "Pay when your order arrives", Icon: Banknote },
];

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);

  const [form, setForm] = useState({ fullName: "", email: "", phone: "", address: "", city: "", pincode: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [emailCheck, setEmailCheck] = useState({ status: "idle", message: "" });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    const updatedProducts = [];
    let orderSaved = false;

    try {
      const checked = await Promise.all(
        items.map(async (cartItem) => ({ cartItem, product: await getProductById(cartItem.id) }))
      );

      for (const { cartItem, product } of checked) {
        const stock = Number(product.stock ?? 0);
        const qty = Number(cartItem.quantity);
        if (!Number.isInteger(qty) || qty < 1) throw new Error(`Invalid quantity for ${product.name}.`);
        if (qty > stock) throw new Error(`${product.name}: only ${stock} item(s) available. Please update your cart.`);
      }

      for (const { cartItem, product } of checked) {
        const oldStock = Number(product.stock ?? 0);
        const updated = await updateProductStock(product.id, oldStock - Number(cartItem.quantity));
        updatedProducts.push({ id: product.id, stock: oldStock, updatedStock: updated.stock });
      }

      const verifiedItems = checked.map(({ cartItem, product }) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: Number(cartItem.quantity),
      }));

      const verifiedTotal = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

      const saved = await createOrder({
        userId: String(userId),
        customer: form,
        items: verifiedItems,
        total: verifiedTotal,
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pay_on_delivery" : "payment_pending",
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      orderSaved = true;
      setOrderId(saved.id);
      dispatch(clearCart());
      setSuccess(true);
    } catch (err) {
      console.error("Checkout error:", err);
      if (!orderSaved) {
        for (const item of [...updatedProducts].reverse()) {
          try {
            const cur = await getProductById(item.id);
            if (Number(cur.stock) === Number(item.updatedStock)) await updateProductStock(item.id, item.stock);
          } catch (rErr) { console.error("Rollback failed:", rErr); }
        }
      }
      setError(
        err.response?.status === 404
          ? "A product could not be found. Please refresh your cart."
          : err.message?.includes("available") || err.message?.includes("Invalid quantity")
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
          <Link to="/">Home</Link><span>/</span>
          <Link to="/cart">Cart</Link><span>/</span>
          <span aria-current="page">Checkout</span>
        </nav>

        <h1>Checkout</h1>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <section className="checkout-step">
              <h2><span>1</span> Contact Information</h2>
              <div className="checkout-fields-row">
                <label>Full Name<input name="fullName" value={form.fullName} onChange={handleChange} required autoComplete="name" placeholder="Enter your full name" /></label>
                <div className="checkout-email-field">
                  <label>Email<input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" placeholder="you@example.com" onBlur={(e) => e.target.value.trim() && verifyAccountEmail(e.target.value)} /></label>
                  {emailCheck.message && <p className={`checkout-email-feedback ${emailCheck.status}`} role={emailCheck.status === "invalid" ? "alert" : "status"}>{emailCheck.message}</p>}
                </div>
                <label>Phone Number<input type="tel" name="phone" value={form.phone} onChange={handleChange} required autoComplete="tel" pattern="[0-9]{10}" maxLength={10} inputMode="numeric" placeholder="10-digit mobile number" /></label>
              </div>
            </section>

            <section className="checkout-step">
              <h2><span>2</span> Shipping Address</h2>
              <label>Delivery Address<textarea name="address" value={form.address} onChange={handleChange} required autoComplete="street-address" placeholder="House number, street, area" rows={2} /></label>
              <div className="checkout-fields-row">
                <label>City<input name="city" value={form.city} onChange={handleChange} required autoComplete="address-level2" placeholder="City" /></label>
                <label>PIN Code<input name="pincode" value={form.pincode} onChange={handleChange} required pattern="[0-9]{6}" maxLength={6} inputMode="numeric" autoComplete="postal-code" placeholder="6-digit PIN" /></label>
              </div>
            </section>

            <section className="checkout-step checkout-payment-step">
              <h2><span>3</span> Delivery Option</h2>
              <p className="checkout-delivery-note">Your order will be delivered to the address provided above.</p>
            </section>

            <section className="checkout-step checkout-payment-step">
              <h2><span>4</span> Payment</h2>
              <div className="payment-method-options">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.id} className={`payment-method-option ${paymentMethod === m.id ? "selected" : ""}`}>
                    <input type="radio" name="paymentMethod" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} />
                    <m.Icon className="payment-method-icon" size={18} strokeWidth={1.6} aria-hidden="true" />
                    <span className="payment-method-copy"><strong>{m.label}</strong><small>{m.detail}</small></span>
                  </label>
                ))}
              </div>
              <p className="checkout-payment-note">
                {paymentMethod === "cod" ? "Pay the order total when your delivery arrives." : "Online payment processing is not connected yet. Your selected method will be saved with the order."}
              </p>
            </section>

            {error && <p className="checkout-error" role="alert">{error}</p>}
            <button type="submit" className="place-order-btn" disabled={loading}>{loading ? "Placing Order..." : "Place Order"}</button>
          </form>

          <aside className="checkout-summary">
            <h2>Your Order <span>({items.reduce((c, i) => c + i.quantity, 0)})</span></h2>
            <div className="checkout-order-images">
              {items.map((i) => <div className="checkout-order-image" key={i.id}><img src={i.image} alt={i.name} /><span>{i.quantity}</span></div>)}
            </div>

            <div className="checkout-order-items">
              {items.map((i) => (
                <div className="checkout-item" key={i.id}>
                  <div><strong>{i.name}</strong><p>Quantity: {i.quantity}</p></div>
                  <span>{formatCurrency(Number(i.price) * i.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="checkout-totals">
              <div className="checkout-total-row"><span>Subtotal</span><span>{formatCurrency(total)}</span></div>
              <div className="checkout-total-row"><span>Shipping</span><span>Calculated at checkout</span></div>
              <div className="checkout-total checkout-grand-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
