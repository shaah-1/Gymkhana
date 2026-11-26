import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/cartSlice";
import { getProductById } from "../../services/productService";
import { formatCurrency } from "../../utils/formatters";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
import Toast from "../../components/Toast";

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  const cartItem = useSelector((s) => s.cart.items.find((i) => String(i.productId || i.id) === String(id)));

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupKey, setPopupKey] = useState(0);

  const alreadyInCart = cartItem?.quantity || 0;

  useEffect(() => {
    let active = true;
    getProductById(id)
      .then((data) => active && setProduct(data))
      .catch(() => active && setError("Product not found."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const backLinkClass =
    "mb-8 inline-flex items-center gap-[6px] font-[Arial,sans-serif] text-[11px] font-bold tracking-[0.14em] text-[#71737d] uppercase no-underline transition-colors duration-150 hover:text-[#121214]";

  if (loading) {
    return (
      <div className="mx-auto my-20 max-w-[700px] p-6 text-center text-[#121214]">
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto my-20 max-w-[700px] p-6 text-center text-[#121214]">
        <h2>{error || "Product not found."}</h2>
        <Link to="/" className={backLinkClass}>
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const stock = Math.max(0, Number(product.stock) || 0);
  const remaining = Math.max(0, stock - alreadyInCart);

  const handleAddToCart = async () => {
    if (quantity < 1 || quantity > remaining) return;
    if (!isAuth) return navigate("/login", { state: { from: location } });

    setAddingToCart(true);
    setCartError("");
    try {
      await dispatch(addToCart({ ...product, quantity })).unwrap();
      setPopupKey((k) => k + 1);
      setShowPopup(true);
    } catch (err) {
      setCartError(
        typeof err === "string"
          ? err
          : err?.message || "Unable to add this product to your cart.",
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const stockBadgeClass =
    stock === 0
      ? "border-[#f1c5c5] bg-[#fdf2f2] text-[#7e2424]"
      : remaining <= 3
        ? "border-[#f2dfba] bg-[#fff9ed] text-[#7c5a1a]"
        : "border-[#c2e2cb] bg-[#f1f8f3] text-[#1e4620]";

  const stockDotClass =
    stock === 0
      ? "bg-[#cf1322]"
      : remaining <= 3
        ? "bg-[#d48806]"
        : "bg-[#2e7d32]";

  return (
    <main className="mx-auto max-w-[1200px] bg-white px-[clamp(20px,4vw,48px)] pt-9 pb-[88px] text-[#121214] max-[768px]:px-[18px] max-[768px]:pt-6 max-[768px]:pb-14 max-[480px]:px-[14px] max-[480px]:pt-[18px] max-[480px]:pb-12">
      <Link to="/" className={backLinkClass}>
        ← Back to Shop
      </Link>

      <section className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-start gap-[clamp(36px,5vw,68px)] max-[768px]:grid-cols-1 max-[768px]:gap-8">
        <div className="box-border flex items-center justify-center overflow-hidden rounded-none border border-[#ebebef] bg-[#f7f7f9] p-6 max-[480px]:p-4">
          <img
            src={publicAssetUrl(product.image)}
            alt={product.name}
            className="block aspect-square w-full rounded-none bg-transparent object-contain"
          />
        </div>

        <div className="flex flex-col">
          <p className="m-0 mb-[10px] text-[10.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
            {product.category}
          </p>
          <h1 className="m-0 mb-4 font-[Arial,sans-serif] text-[clamp(28px,3.5vw,42px)] leading-[1.15] font-bold tracking-[-0.02em] text-[#121214] max-[768px]:text-[28px] max-[480px]:mb-3 max-[480px]:text-2xl">
            {product.name}
          </h1>
          <p className="m-0 mb-5 text-[14.5px] leading-[1.8] whitespace-pre-line text-[#55575e]">
            {product.detailedDescription || product.description}
          </p>

          {product.benefits?.length > 0 && (
            <div className="my-[18px] mb-6 border-y border-[#ebebef] py-[18px]">
              <h3 className="m-0 mb-[10px] font-[Arial,sans-serif] text-[11px] font-bold tracking-[0.14em] text-[#121214] uppercase">
                Why you&apos;ll like it
              </h3>
              <ul className="m-0 list-disc pl-[18px] text-[13.5px] leading-[1.75] text-[#55575e]">
                {product.benefits.slice(0, 3).map((b, idx) => (
                  <li key={idx} className="mb-1">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-[10px] mb-3 font-[Arial,sans-serif] text-[30px] font-bold text-[#121214] tabular-nums max-[480px]:my-2 max-[480px]:mb-[10px] max-[480px]:text-2xl">
            {formatCurrency(product.price)}
          </p>

          <div className="mt-1 mb-6">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-[14px] py-[6px] font-[Arial,sans-serif] text-[11px] font-bold tracking-[0.05em] uppercase tabular-nums ${stockBadgeClass}`}
            >
              <span
                className={`h-[7px] w-[7px] shrink-0 rounded-full ${stockDotClass}`}
                aria-hidden="true"
              />
              <span>
                {stock === 0
                  ? "Out of Stock"
                  : remaining <= 0
                    ? "Stock limit reached in cart"
                    : remaining <= 3
                      ? `Only ${remaining} left in stock`
                      : `In Stock (${remaining} available)`}
              </span>
            </span>
          </div>

          <div className="mt-1 flex items-center gap-[14px] max-[768px]:gap-[10px] max-[480px]:flex-col max-[480px]:items-stretch">
            <div className="box-border inline-flex h-12 w-[120px] min-w-[120px] items-center justify-between overflow-hidden rounded-none border border-[#ebebef] bg-white max-[480px]:w-full max-[480px]:min-w-0">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="h-full w-[38px] cursor-pointer border-0 bg-transparent text-[18px] font-medium text-[#121214] transition-colors duration-150 hover:not-disabled:bg-[#f7f7f9] disabled:cursor-not-allowed disabled:opacity-30"
              >
                −
              </button>
              <span className="min-w-6 text-center font-[Arial,sans-serif] text-sm font-bold text-[#121214] tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(remaining, q + 1))}
                disabled={quantity >= remaining}
                className="h-full w-[38px] cursor-pointer border-0 bg-transparent text-[18px] font-medium text-[#121214] transition-colors duration-150 hover:not-disabled:bg-[#f7f7f9] disabled:cursor-not-allowed disabled:opacity-30"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="min-h-12 flex-1 cursor-pointer rounded-none border border-[#121214] bg-[#121214] px-6 py-3 font-[Arial,sans-serif] text-[11.5px] font-bold tracking-[0.16em] text-white uppercase transition-[background,opacity] duration-200 hover:not-disabled:border-[#2b2b30] hover:not-disabled:bg-[#2b2b30] disabled:cursor-not-allowed disabled:border-[#e6e6ea] disabled:bg-[#e6e6ea] disabled:text-[#8c8f96] max-[480px]:min-h-11 max-[480px]:w-full max-[480px]:px-[18px] max-[480px]:py-[11px] max-[480px]:text-[11px]"
              onClick={handleAddToCart}
              disabled={remaining <= 0 || quantity > remaining || addingToCart}
            >
              {addingToCart ? "Adding…" : remaining <= 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>

          {cartError && (
            <p className="mt-[10px] mb-0 text-xs leading-[1.5] text-[#b91c1c]" role="alert">
              {cartError}
            </p>
          )}

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
        </div>
      </section>
    </main>
  );
}
