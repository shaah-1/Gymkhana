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
  compact = false,
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
  const isCompactStage = compact || variant === "imageOnly";

  return (
    <article
      className={`group relative box-border flex h-full min-w-0 flex-col border-0 bg-transparent p-0 font-[Arial,sans-serif] shadow-none ${
        isCompactStage
          ? "mx-auto w-full max-w-[275px] max-[600px]:max-w-full max-[360px]:max-w-[280px]"
          : ""
      }`}
    >
      {/* 1. IMAGE STAGE (WITH BEST SELLER BADGE & WISHLIST) */}
      <div
        className={`relative box-border flex w-full items-center justify-center overflow-hidden bg-[#f0f1f3] ${
          isCompactStage
            ? "aspect-[1/1.18] rounded-none transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)]"
            : "aspect-[4/5] rounded-[4px]"
        }`}
      >
        {/* Best Seller Pill Badge (shown only when showBadge is enabled) */}
        {showBadge && variant !== "imageOnly" && (
          <span className="pointer-events-none absolute top-[14px] right-[14px] z-[4] rounded-full bg-black px-3 py-[6px] font-[Arial,sans-serif] text-[11.5px] font-bold leading-none tracking-[0.02em] text-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            {typeof showBadge === "string"
              ? showBadge
              : product.badge || "Best Seller"}
          </span>
        )}

        {/* Wishlist Button (Subtle Circle) */}
        <button
          type="button"
          className="absolute top-[14px] left-[14px] z-[4] flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-white p-0 shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-[transform,background-color] duration-150 hover:scale-[1.08] hover:bg-[#fafafa]"
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
          className={`box-border flex h-full w-full cursor-pointer items-center justify-center no-underline ${
            variant === "imageOnly"
              ? "p-[clamp(14px,1.8vw,20px)]"
              : compact
                ? "p-[clamp(12px,1.5vw,18px)]"
                : "px-5 py-6"
          }`}
          aria-label={`View ${product.name}`}
        >
          <img
            src={publicAssetUrl(product.image)}
            alt={product.name}
            className={`h-full w-full object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.07)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] ${
              variant === "imageOnly"
                ? "max-h-[230px] max-[600px]:max-h-[180px]"
                : compact
                  ? "max-h-[200px]"
                  : "max-h-[290px]"
            }`}
            loading="lazy"
          />
        </Link>

        {/* Hover Add to Cart Overlay (for imageOnly variant) */}
        {variant === "imageOnly" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] box-border flex translate-y-[14px] flex-col gap-[10px] bg-[linear-gradient(to_top,rgba(18,18,20,0.94)_0%,rgba(18,18,20,0.72)_65%,transparent_100%)] px-4 pt-5 pb-4 opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:translate-y-0 [@media(hover:none)]:bg-[linear-gradient(to_top,rgba(18,18,20,0.92)_0%,rgba(18,18,20,0.6)_80%,transparent_100%)] [@media(hover:none)]:px-[10px] [@media(hover:none)]:py-3 [@media(hover:none)]:opacity-100">
            <div className="flex items-baseline justify-between gap-2">
              <p className="m-0 flex-1 overflow-hidden font-[Arial,sans-serif] text-[12.5px] font-semibold tracking-[0.04em] text-ellipsis whitespace-nowrap text-white uppercase">
                {product.name}
              </p>
              <p className="m-0 shrink-0 font-[Arial,sans-serif] text-[13px] font-bold tracking-[-0.01em] text-white tabular-nums">
                {formatCurrency(currentPrice)}
              </p>
            </div>
            <button
              type="button"
              className="box-border flex min-h-[42px] w-full cursor-pointer items-center justify-center rounded-none border-0 bg-white px-4 py-[10px] font-[Arial,sans-serif] text-[11px] font-bold tracking-[0.18em] text-[#111113] uppercase shadow-[0_4px_14px_rgba(0,0,0,0.2)] transition-[background,color,transform] duration-200 hover:not-disabled:bg-[#111113] hover:not-disabled:text-white hover:not-disabled:outline hover:not-disabled:outline-1 hover:not-disabled:outline-white disabled:cursor-not-allowed disabled:opacity-50 [@media(hover:none)]:min-h-9 [@media(hover:none)]:px-[10px] [@media(hover:none)]:py-2 [@media(hover:none)]:text-[10.5px]"
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
        <div
          className={`box-border flex flex-col ${
            compact ? "flex-1 pt-3" : "pt-4"
          }`}
        >
          {/* Title */}
          <h3
            className={`m-0 font-[Arial,sans-serif] font-bold tracking-[-0.01em] ${
              compact
                ? "mb-[3px] text-[14px] leading-[1.3] max-[480px]:mb-[2px] max-[480px]:text-[12.5px]"
                : "mb-[6px] text-[17.5px] leading-[1.25] max-[640px]:text-[15.5px] max-[380px]:text-[14px]"
            }`}
          >
            <Link
              to={`/products/${product.id}`}
              className="text-[#111111] no-underline transition-colors duration-150 hover:text-[#55575e]"
            >
              {product.name}
            </Link>
          </h3>

          {/* Subtitle / Skin-type Descriptor */}
          <p
            className={`m-0 overflow-hidden font-[Arial,sans-serif] font-normal text-ellipsis whitespace-nowrap text-[#71717a] ${
              compact
                ? "mb-[6px] text-[11.5px] leading-[1.35] max-[480px]:mb-1 max-[480px]:text-[10.5px]"
                : "mb-[10px] text-[13.5px] leading-[1.4] max-[640px]:text-[12.5px] max-[380px]:text-[11.5px]"
            }`}
            title={subtitleText}
          >
            {subtitleText}
          </p>

          {/* 5-Star Rating (4 filled black stars, 1 empty black outline) */}
          <div
            className={`m-0 flex items-center ${
              compact
                ? "mb-2 gap-[2px] max-[480px]:mb-[6px]"
                : "mb-3 gap-[3px]"
            }`}
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
                  className={`shrink-0 ${
                    compact
                      ? "h-[13px] w-[13px] max-[480px]:h-[11px] max-[480px]:w-[11px]"
                      : ""
                  }`}
                />
              );
            })}
          </div>

          {/* Price Row: Current Price + Strikethrough Original Price */}
          <div
            className={`m-0 flex items-baseline ${
              compact
                ? "mb-[10px] gap-2 max-[480px]:mb-2 max-[480px]:gap-[6px]"
                : "mb-[14px] gap-[10px]"
            }`}
          >
            <span
              className={`font-[Arial,sans-serif] font-bold tracking-[-0.01em] text-[#111111] tabular-nums ${
                compact
                  ? "text-[15px] max-[480px]:text-[13.5px]"
                  : "text-[17.5px] max-[640px]:text-[16px] max-[380px]:text-[15px]"
              }`}
            >
              {formatCurrency(currentPrice)}
            </span>
            <span
              className={`font-[Arial,sans-serif] font-normal text-[#71717a] line-through tabular-nums ${
                compact
                  ? "text-[12.5px] max-[480px]:text-[11px]"
                  : "text-[14.5px]"
              }`}
            >
              {formatCurrency(originalPrice)}
            </span>
          </div>

          {/* Size Variant Selector Pills */}
          <div
            className={`m-0 flex flex-wrap items-center ${
              compact
                ? "mb-3 gap-[6px] max-[480px]:mb-[10px] max-[480px]:gap-1"
                : "mb-4 gap-[10px]"
            }`}
            role="group"
            aria-label="Select product size"
          >
            {availableSizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  className={`box-border inline-flex cursor-pointer items-center justify-center rounded-full border font-[Arial,sans-serif] font-medium transition-all duration-150 ${
                    compact
                      ? "h-[26px] min-w-12 px-[10px] text-[11px] max-[480px]:h-6 max-[480px]:min-w-[38px] max-[480px]:px-[6px] max-[480px]:text-[10px]"
                      : "h-8 min-w-[68px] px-[18px] text-[13px] max-[640px]:h-[30px] max-[640px]:min-w-[58px] max-[640px]:px-[14px] max-[640px]:text-xs max-[380px]:h-7 max-[380px]:min-w-12 max-[380px]:px-[10px] max-[380px]:text-[11px]"
                  } ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : "border-[#d4d4d8] bg-white text-[#111111] hover:border-[#111111]"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSizeState(size);
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {stock > 0 && availableToAdd === 0 && (
            <p className="m-0 mb-2 text-[11px] font-semibold text-[#b45309]">
              Maximum available quantity added
            </p>
          )}

          {/* Full-width Black "Add to cart" Button */}
          <button
            type="button"
            className={`box-border flex w-full cursor-pointer items-center justify-center rounded-none border-0 bg-black font-[Arial,sans-serif] font-medium text-white normal-case transition-colors duration-200 hover:not-disabled:bg-[#27272a] disabled:cursor-not-allowed disabled:opacity-45 ${
              compact
                ? "mt-auto min-h-[38px] px-[14px] py-[9px] text-xs max-[480px]:min-h-[34px] max-[480px]:px-[10px] max-[480px]:py-[7px] max-[480px]:text-[11px] max-[480px]:tracking-[0.14em]"
                : "min-h-12 px-5 py-[14px] text-[15px] tracking-[0.01em] max-[640px]:min-h-11 max-[640px]:text-sm max-[380px]:min-h-10 max-[380px]:px-[14px] max-[380px]:py-[10px] max-[380px]:text-[13px]"
            }`}
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

      {cartError && (
        <p className="mt-2 mb-0 text-xs leading-[1.4] text-[#b91c1c]" role="alert">
          {cartError}
        </p>
      )}

      {/* Cart Added Toast */}
      {showPopup &&
        createPortal(
          <Toast
            key={popupKey}
            message="Added to cart."
            action={
              <Link
                to="/cart"
                className="text-[12px] font-medium whitespace-nowrap text-white underline decoration-1 underline-offset-[3px] opacity-[.88] transition-opacity hover:opacity-100"
                onClick={() => setShowPopup(false)}
              >
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
