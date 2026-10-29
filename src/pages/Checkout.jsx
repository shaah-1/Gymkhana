
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      <h1>Checkout</h1>
      <p className="checkout-subtitle">
        Complete your delivery details below.
      </p>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Delivery Information</h2>

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
            />
          </label>

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

          <label>
            Delivery Address
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              autoComplete="street-address"
              placeholder="House number, street, area"
              rows={3}
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

          <p className="checkout-payment-note">
            Payment integration will be added later.
          </p>
        </form>

        <aside className="checkout-summary">
          <h2>Your Order</h2>

          {items.map((item) => (
            <div className="checkout-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <p>Quantity: {item.quantity}</p>
              </div>
              <span>
                ₹{(
                  Number(item.price) * item.quantity
                ).toLocaleString("en-IN")}
              </span>
            </div>
          ))}

          <div className="checkout-total">
            <span>Total</span>
            <strong>₹{total.toLocaleString("en-IN")}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;
