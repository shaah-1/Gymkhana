import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Star } from "lucide-react";

import { toggleWishlist } from "../redux/wishlistSlice";
import { addToCart } from "../redux/cartSlice";
import { formatCurrency } from "../utils/formatters";
import { publicAssetUrl } from "../utils/publicAssetUrl";
import Toast from "./Toast";
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
  if (
    cat.includes("recovery") ||
    name.includes("bcaa") ||
    name.includes("amino")
  ) {
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
  const name = String(product?.name || "").toLowerCase();
  const cat = String(product?.category || "").toLowerCase();

  // Hand grips, gloves, wrist straps, lifting belts
  if (
    name.includes("grip") ||
    name.includes("glove") ||
    name.includes("strap") ||
    name.includes("belt")
  ) {
    return ["S / M", "L / XL"];
  }

  // Bags, duffels, backpacks
  if (
    name.includes("bag") ||
    name.includes("duffel") ||
    name.includes("backpack")
  ) {
    return ["Standard", "Large"];
  }

  // Shakers, bottles, sippers
  if (
    name.includes("shaker") ||
    name.includes("bottle") ||
    name.includes("sipper")
  ) {
    return ["500ml", "750ml"];
  }

  // Bars, cookies, snacks
  if (
    name.includes("bar") ||
    name.includes("snack") ||
    name.includes("cookie") ||
    cat.includes("snack")
  ) {
    return ["Pack of 6", "Pack of 12"];
  }

  // Softgels, capsules, tablets (Fish Oil, Multivitamins, Zinc, Magnesium, D3)
  if (
    name.includes("fish oil") ||
    name.includes("omega") ||
    name.includes("vitamin") ||
    name.includes("multi") ||
    name.includes("magnesium") ||
    name.includes("zinc") ||
    name.includes("capsule") ||
    name.includes("tablet") ||
    name.includes("softgel") ||
    cat.includes("vitamin") ||
    cat.includes("capsule") ||
    (cat.includes("supplement") &&
      !name.includes("powder") &&
      !name.includes("glutamine") &&
      !name.includes("electrolyte"))
  ) {
    return ["60 Caps", "120 Caps"];
  }

  // Protein & Mass Gainers
  if (
    cat.includes("protein") ||
    cat.includes("gainer") ||
    name.includes("protein") ||
    name.includes("gainer")
  ) {
    return ["1kg", "2kg"];
  }

  // Creatine, Pre-workout, BCAA, Electrolyte powder, Glutamine
  if (
    cat.includes("creatine") ||
    cat.includes("pre-workout") ||
    cat.includes("recovery") ||
    name.includes("creatine") ||
    name.includes("pre-workout") ||
    name.includes("pre workout") ||
    name.includes("bcaa") ||
    name.includes("electrolyte") ||
    name.includes("glutamine") ||
    name.includes("powder")
  ) {
    return ["250g", "500g"];
  }

  // Accessories fallback
  if (cat.includes("accessor")) {
    return ["Standard", "Large"];
  }

  return ["Standard", "Large"];
}

export default function ProductCard({
  product,
  showBadge = false,
  variant = "default",
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPopup, setShowPopup] = useState(false);
  const [popupKey, setPopupKey] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState("");

  const availableSizes = useMemo(() => getProductSizes(product), [product]);
  const [selectedSizeState, setSelectedSizeState] = useState(null);
  const selectedSize =
    selectedSizeState && availableSizes.includes(selectedSizeState)
      ? selectedSizeState
      : availableSizes[0] || "Standard";

  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  const cartItem = useSelector((s) =>
    s.cart.items.find(
      (i) => String(i.productId || i.id) === String(product.id),
    ),
  );
  const isFavorite = useSelector((s) =>
    (s.wishlist?.items || []).some(
      (i) => String(i.productId || i.id) === String(product.id),
    ),
  );

  const stock = Math.max(0, Number(product.stock) || 0);
  const cartQty = Number(cartItem?.quantity) || 0;
  const availableToAdd = Math.max(0, stock - cartQty);

  // Scaled pricing according to size variant
  const basePrice = Number(product.price) || 0;
  const isFitSize = availableSizes.some(
    (s) =>
      s.includes("S / M") ||
      s.includes("L / XL") ||
      s === "S" ||
      s === "M" ||
      s === "L",
  );
  const isSecondSize = selectedSize === availableSizes[1];
  const currentPrice =
    isSecondSize && !isFitSize ? Math.round(basePrice * 1.8) : basePrice;
  const originalPrice = product.originalPrice
    ? isSecondSize && !isFitSize
      ? Math.round(Number(product.originalPrice) * 1.8)
      : Number(product.originalPrice)
    : Math.round(currentPrice * 1.15);

  const handleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuth) return navigate("/login", { state: { from: location } });
    dispatch(toggleWishlist(product));
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (availableToAdd <= 0) return;
    if (!isAuth) return navigate("/login", { state: { from: location } });
    setAddingToCart(true);
    setCartError("");
    try {
      await dispatch(
        addToCart({ ...product, size: selectedSize, price: currentPrice }),
      ).unwrap();
      setPopupKey((k) => k + 1);
      setShowPopup(true);
    } catch (error) {
      setCartError(
        typeof error === "string"
          ? error
          : error?.message || "Unable to add this product to your cart.",
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const subtitleText = getProductSubtitle(product);

  return (
    <article className="product-card">
      {/* 1. IMAGE STAGE (WITH BEST SELLER BADGE & WISHLIST) */}
      <div className="product-card-stage">
        {/* Best Seller Pill Badge (shown only when showBadge is enabled, e.g. in Best Sellers section) */}
        {showBadge && (
          <span className="product-card-badge">
            {typeof showBadge === "string"
              ? showBadge
              : product.badge || "Best Seller"}
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

        {/* Hover Add to Cart Overlay (for imageOnly variant) */}
        {variant === "imageOnly" && (
          <div className="product-card-hover-overlay">
            <div className="product-card-hover-info">
              <p className="product-card-hover-title">{product.name}</p>
              <p className="product-card-hover-price">
                {formatCurrency(currentPrice)}
              </p>
            </div>
            <button
              type="button"
              className="product-card-hover-add-btn"
              onClick={handleAddToCart}
              disabled={availableToAdd <= 0 || addingToCart}
            >
              {addingToCart
                ? "Adding…"
                : stock === 0
                ? "Out of stock"
                : availableToAdd === 0
                  ? "Stock limit reached"
                  : "Add to cart"}
            </button>
          </div>
        )}
      </div>

      {/* 2. PRODUCT BODY CONTENT (Hidden in imageOnly mode) */}
      {variant !== "imageOnly" && (
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
          <div
            className="product-card-rating"
            aria-label="Rated 4 out of 5 stars"
          >
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
            <span className="product-card-current-price">
              {formatCurrency(currentPrice)}
            </span>
            <span className="product-card-original-price">
              {formatCurrency(originalPrice)}
            </span>
          </div>

          {/* Size Variant Selector Pills */}
          <div
            className="product-card-sizes"
            role="group"
            aria-label="Select product size"
          >
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
            <p className="product-card-limit-msg">
              Maximum available quantity added
            </p>
          )}

          {/* Full-width Black "Add to cart" Button */}
          <button
            type="button"
            className="product-card-add-btn"
            onClick={handleAddToCart}
            disabled={availableToAdd <= 0 || addingToCart}
          >
            {addingToCart
              ? "Adding…"
              : stock === 0
              ? "Out of stock"
              : availableToAdd === 0
                ? "Stock limit reached"
                : "Add to cart"}
          </button>
        </div>
      )}

      {cartError && <p className="product-card-cart-error" role="alert">{cartError}</p>}

      {/* Cart Added Toast */}
      {showPopup &&
        createPortal(
          <Toast
            key={popupKey}
            message="Added to cart."
            action={
              <Link to="/cart" className="toast-action-link" onClick={() => setShowPopup(false)}>
                View cart
              </Link>
            }
            onClose={() => setShowPopup(false)}
          />,
          document.body,
        )}
    </article>
  );
}
