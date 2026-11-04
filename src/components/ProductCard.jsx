import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, ChevronLeft, ChevronRight, Star } from "lucide-react";

import { toggleWishlist } from "../redux/wishlistSlice";
import { addToCart } from "../redux/cartSlice";
import { publicAssetUrl } from "../utils/publicAssetUrl";
import "./ProductCard.css";

const TOTAL_SLIDES = 6;

function formatRupee(val) {
  return "₹ " + Number(val || 0).toLocaleString("en-IN");
}

function getProductSubtitle(product) {
  if (product?.subtitle) return product.subtitle;
  const name = String(product?.name || "").toLowerCase();
  const cat = String(product?.category || "").toLowerCase();

  if (name.includes("isolate")) {
    return "Ultra-Pure Isolate, Zero Lactose & Fast Synthesis";
  }
  if (cat.includes("protein") || name.includes("whey")) {
    return "Muscle Recovery, Cold-Filtered & Bioavailable";
  }
  if (cat.includes("creatine") || name.includes("creatine")) {
    return "Cellular ATP, Peak Strength & Explosive Power";
  }
  if (cat.includes("pre-workout") || name.includes("pre workout")) {
    return "Cognitive Drive, Blood Flow & Endurance";
  }
  if (cat.includes("recovery") || name.includes("bcaa") || name.includes("amino")) {
    return "Fermented Aminos, Cellular Hydration & Repair";
  }
  if (name.includes("fish oil") || name.includes("omega")) {
    return "EPA & DHA Omega-3, Heart & Joint Mobility";
  }
  if (name.includes("multi") || cat.includes("vitamin")) {
    return "Essential Micronutrients, Immune & Daily Vitality";
  }
  if (Array.isArray(product?.benefits) && product.benefits.length > 0) {
    return product.benefits.slice(0, 2).join(", ");
  }
  return product?.description || "Precision Engineered Sports Nutrition";
}

function getProductSizes(product) {
  if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
    return product.sizes;
  }
  const cat = String(product?.category || "").toLowerCase();
  if (cat.includes("protein") || cat.includes("gainer")) {
    return ["1kg", "2kg"];
  }
  if (cat.includes("creatine") || cat.includes("pre-workout") || cat.includes("recovery")) {
    return ["250g", "500g"];
  }
  if (cat.includes("vitamin") || cat.includes("oil") || cat.includes("capsule")) {
    return ["60 Caps", "120 Caps"];
  }
  return ["50g", "100g"];
}

export default function ProductCard({ product, showBadge = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPopup, setShowPopup] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const availableSizes = useMemo(() => getProductSizes(product), [product]);
  const [selectedSizeState, setSelectedSizeState] = useState(null);
  const selectedSize =
    selectedSizeState && availableSizes.includes(selectedSizeState)
      ? selectedSizeState
      : availableSizes[0] || "50g";

  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  const cartItem = useSelector((s) => s.cart.items.find((i) => String(i.productId || i.id) === String(product.id)));
  const isFavorite = useSelector((s) => s.wishlist.items.some((i) => String(i.productId || i.id) === String(product.id)));

  useEffect(() => {
    if (!showPopup) return;
    const t = setTimeout(() => setShowPopup(false), 1000);
    return () => clearTimeout(t);
  }, [showPopup]);

  const stock = Math.max(0, Number(product.stock) || 0);
  const cartQty = Number(cartItem?.quantity) || 0;
  const availableToAdd = Math.max(0, stock - cartQty);

  // Scaled pricing according to size variant
  const basePrice = Number(product.price) || 0;
  const isSecondSize = selectedSize === availableSizes[1];
  const currentPrice = isSecondSize ? Math.round(basePrice * 1.8) : basePrice;
  const originalPrice = product.originalPrice
    ? (isSecondSize ? Math.round(Number(product.originalPrice) * 1.8) : Number(product.originalPrice))
    : Math.round(currentPrice * 1.15);

  const handleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuth) return navigate("/login", { state: { from: location } });
    dispatch(toggleWishlist(product));
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (availableToAdd <= 0) return;
    if (!isAuth) return navigate("/login", { state: { from: location } });
    dispatch(addToCart({ ...product, size: selectedSize, price: currentPrice }));
    setShowPopup(true);
  };

  const handlePrevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSlide((prev) => (prev === 0 ? TOTAL_SLIDES - 1 : prev - 1));
  };

  const handleNextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSlide((prev) => (prev === TOTAL_SLIDES - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (idx, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSlide(idx);
  };

  const subtitleText = getProductSubtitle(product);

  return (
    <article className="product-card">
      {/* 1. IMAGE STAGE (WITH BEST SELLER BADGE, ARROWS, AND DOTS) */}
      <div className="product-card-stage">
        {/* Best Seller Pill Badge (shown only when showBadge is enabled, e.g. in Best Sellers section) */}
        {showBadge && (
          <span className="product-card-badge">
            {typeof showBadge === "string" ? showBadge : product.badge || "Best Seller"}
          </span>
        )}

        {/* Wishlist Button (Subtle Circle) */}
        <button
          type="button"
          className="product-card-wishlist"
          onClick={handleWishlist}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isFavorite}
        >
          <Heart
            size={15}
            strokeWidth={1.8}
            fill={isFavorite ? "#111111" : "none"}
            color="#111111"
          />
        </button>

        {/* Carousel Nav Arrows */}
        <button
          type="button"
          className="product-card-arrow product-card-arrow-left"
          onClick={handlePrevSlide}
          aria-label="Previous product view"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>

        <button
          type="button"
          className="product-card-arrow product-card-arrow-right"
          onClick={handleNextSlide}
          aria-label="Next product view"
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>

        {/* Main Product Image (Clickable Link) */}
        <Link
          to={`/products/${product.id}`}
          className="product-card-image-link"
          aria-label={`View ${product.name}`}
        >
          <img
            src={publicAssetUrl(product.image)}
            alt={product.name}
            className="product-card-img"
            loading="lazy"
          />
        </Link>

        {/* Carousel Pagination Dots */}
        <div className="product-card-dots" role="tablist" aria-label="Product image slides">
          {[...Array(TOTAL_SLIDES)].map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`product-card-dot ${activeSlide === idx ? "active" : ""}`}
              onClick={(e) => handleDotClick(idx, e)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. PRODUCT BODY CONTENT */}
      <div className="product-card-body">
        {/* Title */}
        <h3 className="product-card-title">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        {/* Subtitle / Skin-type Descriptor */}
        <p className="product-card-subtitle" title={subtitleText}>
          {subtitleText}
        </p>

        {/* 5-Star Rating (4 filled black stars, 1 empty black outline) */}
        <div className="product-card-rating" aria-label="Rated 4 out of 5 stars">
          {[1, 2, 3, 4, 5].map((starIndex) => {
            const isFilled = starIndex <= 4;
            return (
              <Star
                key={starIndex}
                size={15}
                strokeWidth={1.8}
                fill={isFilled ? "#111111" : "none"}
                color="#111111"
              />
            );
          })}
        </div>

        {/* Price Row: Current Price + Strikethrough Original Price */}
        <div className="product-card-prices">
          <span className="product-card-current-price">{formatRupee(currentPrice)}</span>
          <span className="product-card-original-price">{formatRupee(originalPrice)}</span>
        </div>

        {/* Size Variant Selector Pills */}
        <div className="product-card-sizes" role="group" aria-label="Select product size">
          {availableSizes.map((size) => (
            <button
              key={size}
              type="button"
              className={`product-size-pill ${selectedSize === size ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedSizeState(size);
              }}
            >
              {size}
            </button>
          ))}
        </div>

        {stock > 0 && availableToAdd === 0 && (
          <p className="product-card-limit-msg">Maximum available quantity added</p>
        )}

        {/* Full-width Black "Add to cart" Button */}
        <button
          type="button"
          className="product-card-add-btn"
          onClick={handleAddToCart}
          disabled={availableToAdd <= 0}
        >
          {stock === 0 ? "Out of stock" : availableToAdd === 0 ? "Stock limit reached" : "Add to cart"}
        </button>
      </div>

      {/* Cart Added Toast Modal */}
      {showPopup &&
        createPortal(
          <div className="popup-overlay">
            <div
              className="cart-added-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`cart-added-title-${product.id}`}
            >
              <button
                type="button"
                className="cart-added-close"
                aria-label="Close"
                onClick={() => setShowPopup(false)}
              >
                ×
              </button>
              <div className="cart-added-check" aria-hidden="true">✓</div>
              <p className="cart-added-eyebrow">Added to cart</p>
              <h2 id={`cart-added-title-${product.id}`}>{product.name} ({selectedSize})</h2>
              <Link to="/cart" className="cart-added-link">View cart</Link>
            </div>
          </div>,
          document.body
        )}
    </article>
  );
}
