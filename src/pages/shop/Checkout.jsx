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

const labelClass =
  "mb-[18px] flex flex-col gap-2 font-[Arial,sans-serif] text-[10.5px] font-bold tracking-[0.14em] text-[#8b8e96] uppercase";

const rowLabelClass =
  "mb-0 flex flex-col gap-2 font-[Arial,sans-serif] text-[10.5px] font-bold tracking-[0.14em] text-[#8b8e96] uppercase";

const inputClass =
  "box-border w-full rounded-none border border-[#ebebef] bg-white px-[14px] py-3 font-[Arial,sans-serif] text-[13.5px] font-normal tracking-normal text-[#121214] normal-case outline-none transition-colors duration-150 placeholder:text-[#a1a1aa] focus:border-[#121214]";

const primaryBtnClass =
  "block w-full cursor-pointer rounded-none border border-[#121214] bg-[#121214] px-6 py-[15px] font-[Arial,sans-serif] text-[11px] font-bold tracking-[0.18em] text-white uppercase transition-[background,opacity] duration-150 hover:not-disabled:border-[#2b2b30] hover:not-disabled:bg-[#2b2b30] disabled:cursor-not-allowed disabled:opacity-60 max-[480px]:box-border max-[480px]:w-full max-[480px]:px-5 max-[480px]:py-[13px] max-[480px]:text-center";

const backBtnClass =
  "inline-flex cursor-pointer items-center justify-center rounded-none border border-[#ebebef] bg-white px-7 py-[15px] font-[Arial,sans-serif] text-[11px] font-bold tracking-[0.16em] whitespace-nowrap text-[#121214] uppercase transition-all duration-150 hover:border-[#121214] hover:bg-[#f7f7f9] max-[480px]:box-border max-[480px]:w-full max-[480px]:px-5 max-[480px]:py-[13px] max-[480px]:text-center";

const errorBoxClass =
  "my-[18px] border border-[#fecaca] bg-[#fef2f2] px-[14px] py-3 text-[12.5px] font-semibold text-[#b91c1c]";

const stateCardClass =
  "mx-auto my-20 box-border max-w-[580px] border border-[#ebebef] bg-[#fbfbfd] px-10 py-[60px] text-center max-[640px]:my-10 max-[640px]:px-5 max-[640px]:py-10";

const stateBtnClass =
  "mt-6 inline-flex cursor-pointer items-center justify-center rounded-none border border-[#121214] bg-[#121214] px-8 py-[14px] font-[Arial,sans-serif] text-[11px] font-bold tracking-[0.18em] text-white uppercase transition-colors duration-150 hover:border-[#2b2b30] hover:bg-[#2b2b30]";

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
      <div className={stateCardClass}>
        <div className="mb-6 inline-flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#15803d] text-[26px] font-bold text-white">
          ✓
        </div>
        <h1 className="m-0 mb-3 font-['DM_Sans',sans-serif] text-[clamp(26px,3.2vw,36px)] font-semibold tracking-[-0.02em] text-[#121214]">
          Order Placed Successfully!
        </h1>
        <p className="m-0 mb-2 text-sm leading-[1.6] text-[#55575e]">
          Thank you for shopping with GYMKHANA Nutrition.
        </p>
        <p className="m-0 mb-2 text-sm leading-[1.6] text-[#55575e]">
          Order ID: {orderId}
        </p>
        <button type="button" className={stateBtnClass} onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  if (cartLoading || !cartLoaded) {
    return (
      <div className={stateCardClass} role="status">
        <h2 className="m-0 mb-6 font-['DM_Sans',sans-serif] text-[clamp(24px,3vw,32px)] font-semibold tracking-[-0.02em] text-[#121214]">
          Loading your cart…
        </h2>
      </div>
    );
  }

  if (cartError && items.length === 0) {
    return (
      <div className={stateCardClass}>
        <h2 className="m-0 mb-6 font-['DM_Sans',sans-serif] text-[clamp(24px,3vw,32px)] font-semibold tracking-[-0.02em] text-[#121214]">
          Your cart couldn&rsquo;t be loaded
        </h2>
        <p className={errorBoxClass} role="alert">
          {cartError}
        </p>
        <button type="button" className={stateBtnClass} onClick={() => dispatch(fetchCart())}>
          Try Again
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={stateCardClass}>
        <h2 className="m-0 mb-6 font-['DM_Sans',sans-serif] text-[clamp(24px,3vw,32px)] font-semibold tracking-[-0.02em] text-[#121214]">
          Your cart is empty
        </h2>
        <button type="button" className={stateBtnClass} onClick={() => navigate("/")}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <main className="box-border min-h-[calc(100vh-80px)] w-full bg-white px-[clamp(20px,5vw,64px)] pt-12 pb-[100px] font-[Arial,sans-serif] text-[#121214] max-[640px]:px-4 max-[640px]:pt-7 max-[640px]:pb-[60px] max-[480px]:px-[14px] max-[480px]:pt-5 max-[480px]:pb-12">
      <div className="mx-auto max-w-[1240px]">
        <nav
          className="mb-7 flex items-center gap-2 font-[Arial,sans-serif] text-[10.5px] font-bold tracking-[0.16em] text-[#8b8e96] uppercase max-[360px]:text-[9.5px] max-[360px]:tracking-[0.12em]"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="text-[#8b8e96] no-underline transition-colors duration-150 hover:text-[#121214]">
            Home
          </Link>
          <span className="text-[#d1d1d6]">/</span>
          <Link to="/cart" className="text-[#8b8e96] no-underline transition-colors duration-150 hover:text-[#121214]">
            Cart
          </Link>
          <span className="text-[#d1d1d6]">/</span>
          <span aria-current="page" className="text-[#121214]">
            Checkout
          </span>
        </nav>

        {/* Top Progress Stepper Line (1 Contact -> 2 Shipping -> 3 Delivery -> 4 Payment) */}
        <div
          className="mb-11 flex items-center justify-center pt-2 max-[640px]:mb-[30px] max-[480px]:mb-6 max-[480px]:pt-1"
          aria-label="Checkout Progress"
        >
          <div className="flex w-full max-w-[640px] items-end">
            {STEPS.map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              const isNavigable = step.id < currentStep;

              return (
                <div
                  key={step.id}
                  className={`flex items-end ${idx > 0 ? "flex-1" : ""}`}
                >
                  {idx > 0 && (
                    <div
                      className={`mb-1 h-[1.5px] flex-1 transition-[background] duration-250 ${
                        currentStep >= step.id ? "bg-[#121214]" : "bg-[#e5e7eb]"
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  <button
                    type="button"
                    className={`m-0 flex shrink-0 flex-col items-center gap-2 border-0 bg-transparent p-0 ${
                      isNavigable ? "cursor-pointer" : "cursor-default"
                    }`}
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
                    <span
                      className={`flex items-center gap-[5px] font-[Arial,sans-serif] text-xs tracking-[0.02em] whitespace-nowrap transition-[color,font-weight] duration-200 max-[640px]:gap-[3px] max-[640px]:text-[10.5px] max-[480px]:gap-[2px] max-[480px]:text-[9.5px] max-[360px]:text-[8.5px] ${
                        isActive
                          ? "font-bold text-[#121214]"
                          : isCompleted
                            ? "font-semibold text-[#121214]"
                            : "font-medium text-[#8b8e96]"
                      }`}
                    >
                      <span className="max-[640px]:hidden">{step.label}</span>
                      <span className="hidden max-[640px]:inline">{step.shortLabel}</span>
                    </span>
                    <span
                      className={`box-border h-[9px] w-[9px] rounded-full transition-all duration-200 ${
                        isActive
                          ? "border-[2.5px] border-[#121214] bg-white"
                          : isCompleted
                            ? "border-[1.5px] border-[#121214] bg-[#121214]"
                            : "border-[1.5px] border-[#d1d5db] bg-white"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <h1 className="m-0 mb-10 font-['DM_Sans',sans-serif] text-[clamp(32px,4vw,44px)] leading-[1.15] font-semibold tracking-[-0.02em] text-[#121214] max-[480px]:mb-6 max-[480px]:text-[26px]">
          Checkout
        </h1>

        <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(320px,420px)] items-start gap-[clamp(32px,4.5vw,56px)] max-[960px]:grid-cols-1 max-[960px]:gap-12">
          <form className="flex flex-col" onSubmit={handleFormSubmit}>
            {/* Step 1: Contact Information */}
            {currentStep === 1 && (
              <section className="mb-4 pb-2">
                <h2 className="m-0 mb-[22px] flex items-center gap-[10px] font-['DM_Sans',sans-serif] text-[15px] font-semibold tracking-[0.1em] text-[#121214] uppercase">
                  Contact Information
                </h2>
                <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1 max-[640px]:gap-4">
                  <label className={rowLabelClass}>
                    Full Name
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      placeholder="Enter your full name"
                      className={inputClass}
                    />
                  </label>
                  <div className="flex flex-col">
                    <label className={rowLabelClass}>
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
                        className={inputClass}
                      />
                    </label>
                    {emailCheck.message && (
                      <p
                        className={`mt-[6px] mb-0 text-[11.5px] font-semibold tracking-[0.02em] ${
                          emailCheck.status === "valid"
                            ? "text-[#15803d]"
                            : emailCheck.status === "invalid"
                              ? "text-[#b91c1c]"
                              : "text-[#71737d]"
                        }`}
                        role={emailCheck.status === "invalid" ? "alert" : "status"}
                      >
                        {emailCheck.message}
                      </p>
                    )}
                  </div>
                  <label className={rowLabelClass}>
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
                      className={inputClass}
                    />
                  </label>
                </div>

                {error && (
                  <p className={errorBoxClass} role="alert">
                    {error}
                  </p>
                )}

                <div className="mt-6">
                  <button
                    type="button"
                    className={primaryBtnClass}
                    onClick={handleNextFromContact}
                  >
                    Continue to Shipping Address
                  </button>
                </div>
              </section>
            )}

            {/* Step 2: Shipping Address */}
            {currentStep === 2 && (
              <section className="mb-4 pb-2">
                <h2 className="m-0 mb-[22px] flex items-center gap-[10px] font-['DM_Sans',sans-serif] text-[15px] font-semibold tracking-[0.1em] text-[#121214] uppercase">
                  Shipping Address
                </h2>
                <label className={labelClass}>
                  Delivery Address
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    autoComplete="street-address"
                    placeholder="House number, street, area"
                    rows={2}
                    className={`${inputClass} min-h-[70px] resize-y`}
                  />
                </label>
                <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1 max-[640px]:gap-4">
                  <label className={rowLabelClass}>
                    City
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      autoComplete="address-level2"
                      placeholder="City"
                      className={inputClass}
                    />
                  </label>
                  <label className={rowLabelClass}>
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
                      className={inputClass}
                    />
                  </label>
                </div>

                {error && (
                  <p className={errorBoxClass} role="alert">
                    {error}
                  </p>
                )}

                <div className="mt-6 flex items-center gap-[14px] max-[480px]:flex-col-reverse max-[480px]:items-stretch max-[480px]:gap-[10px]">
                  <button
                    type="button"
                    className={backBtnClass}
                    onClick={() => {
                      setError("");
                      setCurrentStep(1);
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className={`${primaryBtnClass} flex-1`}
                    onClick={handleNextFromShipping}
                  >
                    Continue to Delivery Option
                  </button>
                </div>
              </section>
            )}

            {/* Step 3: Delivery Option */}
            {currentStep === 3 && (
              <section className="mb-4 pb-2">
                <h2 className="m-0 mb-[22px] flex items-center gap-[10px] font-['DM_Sans',sans-serif] text-[15px] font-semibold tracking-[0.1em] text-[#121214] uppercase">
                  Delivery Option
                </h2>
                <p className="m-0 text-[13.5px] leading-[1.6] text-[#55575e]">
                  Your order will be delivered to the address provided above.
                </p>

                {error && (
                  <p className={errorBoxClass} role="alert">
                    {error}
                  </p>
                )}

                <div className="mt-6 flex items-center gap-[14px] max-[480px]:flex-col-reverse max-[480px]:items-stretch max-[480px]:gap-[10px]">
                  <button
                    type="button"
                    className={backBtnClass}
                    onClick={() => {
                      setError("");
                      setCurrentStep(2);
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className={`${primaryBtnClass} flex-1`}
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
              <section className="mb-4 pb-2">
                <h2 className="m-0 mb-[22px] flex items-center gap-[10px] font-['DM_Sans',sans-serif] text-[15px] font-semibold tracking-[0.1em] text-[#121214] uppercase">
                  Payment Method
                </h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 max-[640px]:grid-cols-1">
                  {PAYMENT_METHODS.map((m) => {
                    const isSelected = paymentMethod === m.id;
                    return (
                      <label
                        key={m.id}
                        className={`mb-0 flex cursor-pointer flex-row items-start gap-3 rounded-none border px-4 py-[14px] tracking-normal normal-case transition-[border-color,background] duration-150 hover:border-[#121214] ${
                          isSelected
                            ? "border-[#121214] bg-[#fbfbfd]"
                            : "border-[#ebebef] bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={m.id}
                          checked={isSelected}
                          onChange={() => setPaymentMethod(m.id)}
                          className="mt-[2px] h-4 w-4 cursor-pointer accent-[#121214]"
                        />
                        <m.Icon
                          className="mt-px shrink-0 text-[#121214]"
                          size={18}
                          strokeWidth={1.6}
                          aria-hidden="true"
                        />
                        <span className="flex flex-col gap-[3px]">
                          <strong className="font-[Arial,sans-serif] text-[13px] font-bold text-[#121214]">
                            {m.label}
                          </strong>
                          <small className="font-[Arial,sans-serif] text-[11.5px] font-normal text-[#71737d]">
                            {m.detail}
                          </small>
                        </span>
                      </label>
                    );
                  })}
                </div>

                <p className="mt-4 mb-0 text-[12.5px] leading-[1.5] text-[#71737d]">
                  Online payments are not connected yet. Only cash on delivery is available; this checkout will not collect card or UPI details.
                </p>

                {error && (
                  <p className={errorBoxClass} role="alert">
                    {error}
                  </p>
                )}

                <div className="mt-6 flex items-center gap-[14px] max-[480px]:flex-col-reverse max-[480px]:items-stretch max-[480px]:gap-[10px]">
                  <button
                    type="button"
                    className={backBtnClass}
                    onClick={() => {
                      setError("");
                      setCurrentStep(3);
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className={`${primaryBtnClass} flex-1`}
                    disabled={loading}
                  >
                    {loading ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </section>
            )}
          </form>

          {/* Right Column: Original Order Summary */}
          <aside className="static box-border w-full border border-[#ebebef] bg-[#fbfbfd] px-6 py-[26px] max-[640px]:px-[18px] max-[640px]:py-6 max-[480px]:px-[14px] max-[480px]:py-5">
            <h2 className="m-0 mb-4 flex items-baseline justify-between border-b border-[#ebebef] pb-[14px] font-['DM_Sans',sans-serif] text-[14.5px] font-semibold tracking-[0.08em] text-[#121214] uppercase">
              Your Order{" "}
              <span className="font-[Arial,sans-serif] text-[11.5px] font-bold text-[#8b8e96]">
                ({items.reduce((c, i) => c + i.quantity, 0)})
              </span>
            </h2>
            <div className="mb-[18px] grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] gap-[10px] border-b border-[#ebebef] pb-4">
              {items.map((i) => (
                <div
                  className="relative box-border flex aspect-square items-center justify-center overflow-hidden rounded-none border border-[#ebebef] bg-[#f7f7f9] p-[5px]"
                  key={i.id}
                >
                  <img
                    src={publicAssetUrl(i.image)}
                    alt={i.name}
                    className="max-h-full max-w-full object-contain"
                  />
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#121214] px-[3px] font-[Arial,sans-serif] text-[9.5px] font-bold text-white">
                    {i.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-[18px] flex flex-col">
              {items.map((i) => (
                <div
                  className="flex items-center justify-between gap-[14px] border-b border-[#ebebef] py-3"
                  key={i.id}
                >
                  <div>
                    <strong className="block font-[Arial,sans-serif] text-[13px] leading-[1.35] font-semibold text-[#121214]">
                      {i.name}
                    </strong>
                    <p className="mt-[3px] mb-0 font-[Arial,sans-serif] text-[11.5px] text-[#71737d]">
                      Quantity: {i.quantity}
                    </p>
                  </div>
                  <span className="font-[Arial,sans-serif] text-[13px] font-bold whitespace-nowrap text-[#121214] tabular-nums">
                    {formatCurrency(Number(i.price) * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-[10px]">
              <div className="flex items-center justify-between text-[13px] text-[#55575e]">
                <span>Subtotal</span>
                <span className="font-[Arial,sans-serif] font-semibold text-[#121214] tabular-nums">
                  {formatCurrency(total)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px] text-[#55575e]">
                <span>Shipping</span>
                <span className="font-[Arial,sans-serif] font-semibold text-[#121214] tabular-nums">
                  Calculated at checkout
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between border-t border-[#ebebef] pt-3 text-sm text-[#121214]">
                <span className="font-[Arial,sans-serif] font-bold tracking-[0.08em] uppercase">
                  Total
                </span>
                <strong className="font-[Arial,sans-serif] text-xl font-extrabold text-[#121214] tabular-nums">
                  {formatCurrency(total)}
                </strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
