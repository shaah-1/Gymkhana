import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, X } from "lucide-react";
import { fetchWishlist, toggleWishlist } from "../../redux/wishlistSlice";
import { addToCart } from "../../redux/cartSlice";
import { formatCurrency } from "../../utils/formatters";
import { publicAssetUrl } from "../../utils/publicAssetUrl";

export default function Wishlist() {
  const dispatch = useDispatch();
  const { items = [], loading = false, error = null } = useSelector((s) => s.wishlist || {});
  const userId = useSelector((s) => s.auth?.userId);

  const [addedMap, setAddedMap] = useState({});

  useEffect(() => {
    if (userId && items.length === 0) {
      dispatch(fetchWishlist(userId));
    }
  }, [dispatch, userId, items.length]);

  const handleAddToCart = (product) => {
    const stock = Number(product.stock ?? 10);
    if (stock <= 0) return;

    const prodId = product.productId || product.id;
    dispatch(addToCart(product));
    setAddedMap((prev) => ({ ...prev, [prodId]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [prodId]: false }));
    }, 1400);
  };

  const handleRemove = (product) => {
    dispatch(toggleWishlist(product));
  };

  return (
    <main className="box-border min-h-[calc(100vh-80px)] bg-white px-[clamp(20px,4vw,56px)] pt-12 pb-[100px] font-[Arial,sans-serif] text-[#121214] max-[768px]:px-4 max-[768px]:pt-8 max-[768px]:pb-[70px] max-[480px]:px-3 max-[480px]:pt-6 max-[480px]:pb-[60px]">
      <div className="mx-auto max-w-[1320px]">
        {/* Header */}
        <header className="mb-9 flex flex-wrap items-end justify-between gap-6 border-b border-[#ebebef] pb-6 max-[768px]:mb-6 max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-4">
          <div>
            <span className="mb-2 block font-[Arial,sans-serif] text-[10.5px] font-bold tracking-[0.2em] text-[#71737d] uppercase">
              YOUR COLLECTION
            </span>
            <h1 className="m-0 font-[Arial,sans-serif] text-[clamp(28px,3.4vw,40px)] leading-[1.15] font-bold tracking-[-0.02em] text-[#121214]">
              My Wishlist
              {items.length > 0 && (
                <span className="ml-2 align-middle text-[0.55em] font-bold tracking-[0.05em] text-[#71737d]">
                  ({items.length})
                </span>
              )}
            </h1>
            <p className="mt-2 mb-0 text-sm leading-[1.5] text-[#52525b]">
              Your curated selection of precision performance and health formulations.
            </p>
          </div>
          <Link
            to="/shop"
            className="border-b border-[#121214] pb-[3px] text-[11.5px] font-bold tracking-[0.12em] text-[#121214] uppercase no-underline transition-colors duration-150 hover:border-[#71737d] hover:text-[#71737d]"
          >
            Explore All Formulations &rarr;
          </Link>
        </header>

        {/* Loading State */}
        {loading && items.length === 0 && (
          <div
            className="mt-6 flex flex-col items-center justify-center border border-[#ebebef] bg-[#fafaf8] px-6 py-20 text-center"
            role="status"
          >
            <p className="mb-4 text-sm text-[#71737d]">Loading your saved formulations...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && items.length === 0 && (
          <div
            className="mt-6 flex flex-col items-center justify-center border border-[#ebebef] bg-[#fafaf8] px-6 py-20 text-center"
            role="alert"
          >
            <p className="mb-4 text-sm text-[#71737d]">
              {error || "Unable to load wishlist formulations."}
            </p>
            <button
              type="button"
              className="h-[38px] cursor-pointer border-0 bg-[#121214] px-5 font-[Arial,sans-serif] text-[11px] font-bold tracking-[0.14em] text-white uppercase transition-colors duration-200 hover:bg-[#27272a]"
              onClick={() => userId && dispatch(fetchWishlist(userId))}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="mx-auto mt-8 box-border max-w-[600px] border border-[#ebebef] bg-white px-6 py-20 text-center max-[480px]:px-[14px] max-[480px]:py-[50px]">
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#ebebef] bg-[#f7f7f9] text-[#71737d]"
              aria-hidden="true"
            >
              <Heart size={26} strokeWidth={1.5} />
            </div>
            <h2 className="m-0 mb-[10px] text-[22px] font-bold tracking-[-0.01em] text-[#121214]">
              Your wishlist is empty
            </h2>
            <p className="mx-auto mb-7 max-w-[420px] text-sm leading-[1.6] text-[#71737d]">
              Explore our nutritional architectures and click the heart icon on any formulation to save it here for easy reference and checkout.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center bg-[#121214] px-8 py-[14px] font-[Arial,sans-serif] text-[11.5px] font-bold tracking-[0.16em] text-white uppercase no-underline transition-[background,transform] duration-200 hover:-translate-y-px hover:bg-[#27272a]"
            >
              Explore Formulations &rarr;
            </Link>
          </div>
        )}

        {/* Wishlist Product Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-4 gap-6 max-[1100px]:grid-cols-3 max-[1100px]:gap-5 max-[768px]:grid-cols-2 max-[768px]:gap-[14px] max-[480px]:gap-[10px] max-[360px]:grid-cols-1 max-[360px]:gap-[14px]">
            {items.map((product) => {
              const prodId = product.productId || product.id;
              const isAdded = Boolean(addedMap[prodId]);
              const stock = Number(product.stock ?? 10);
              const isOutOfStock = stock <= 0;

              return (
                <article
                  className="group relative box-border flex flex-col border border-[#ebebef] bg-white transition-[border-color,box-shadow] duration-200 hover:border-[#121214] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
                  key={product.id || prodId}
                >
                  {/* Remove Button */}
                  <button
                    type="button"
                    className="absolute top-3 right-3 z-[2] flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#e4e4e7] bg-white/92 p-0 text-[#71737d] transition-all duration-150 hover:scale-[1.08] hover:border-[#dc2626] hover:bg-white hover:text-[#dc2626]"
                    aria-label={`Remove ${product.name} from wishlist`}
                    title="Remove from wishlist"
                    onClick={() => handleRemove(product)}
                  >
                    <X size={15} strokeWidth={2} />
                  </button>

                  {/* Stage Image */}
                  <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden border-b border-[#ebebef] bg-[#f0f1f3]">
                    <Link
                      to={`/products/${prodId}`}
                      aria-label={`View ${product.name}`}
                      className="flex h-full w-full items-center justify-center no-underline"
                    >
                      <img
                        src={publicAssetUrl(product.image)}
                        alt={product.name}
                        className="max-h-[80%] max-w-[80%] object-contain transition-transform duration-250 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col px-[18px] pt-5 pb-[18px] max-[768px]:px-3 max-[768px]:py-[14px] max-[480px]:px-2 max-[480px]:pt-[10px] max-[480px]:pb-3">
                    {product.category && (
                      <p className="m-0 mb-[6px] text-[10.5px] font-bold tracking-[0.14em] text-[#71737d] uppercase">
                        {product.category}
                      </p>
                    )}

                    <h3 className="m-0 mb-2 text-[14.5px] leading-[1.35] font-bold text-[#121214] max-[768px]:text-[13.5px] max-[480px]:mb-1 max-[480px]:text-xs">
                      <Link
                        to={`/products/${prodId}`}
                        className="text-inherit no-underline transition-colors duration-150 hover:text-[#52525b]"
                      >
                        {product.name}
                      </Link>
                    </h3>

                    <div className="mb-3 flex items-baseline gap-2">
                      <span className="m-0 text-base font-bold tracking-[0.02em] text-[#121214] tabular-nums max-[480px]:text-[13.5px]">
                        {formatCurrency(product.price)}
                      </span>
                    </div>

                    <div
                      className={`mb-4 inline-flex items-center gap-[5px] text-[11px] font-semibold ${
                        isOutOfStock ? "text-[#b91c1c]" : "text-[#15803d]"
                      }`}
                    >
                      <span className="h-[6px] w-[6px] rounded-full bg-current" aria-hidden="true" />
                      <span>{isOutOfStock ? "Out of Stock" : "In Stock"}</span>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex flex-col gap-2">
                      <button
                        type="button"
                        className={`flex h-[42px] w-full cursor-pointer items-center justify-center gap-[6px] border font-[Arial,sans-serif] text-[11.5px] font-bold tracking-[0.14em] uppercase transition-[background,border-color,color] duration-200 disabled:cursor-not-allowed disabled:border-[#e4e4e7] disabled:bg-[#f4f4f5] disabled:text-[#a1a1aa] ${
                          isAdded
                            ? "border-[#15803d] bg-[#15803d] text-white"
                            : "border-[#121214] bg-[#121214] text-white hover:not-disabled:border-[#27272a] hover:not-disabled:bg-[#27272a]"
                        }`}
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                      >
                        {isAdded ? "Added ✓" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>

                      <Link
                        to={`/products/${prodId}`}
                        className="box-border flex h-9 w-full items-center justify-center border border-[#d5d7dc] bg-transparent font-[Arial,sans-serif] text-[11px] font-semibold tracking-[0.12em] text-[#121214] uppercase no-underline transition-[border-color,background] duration-200 hover:border-[#121214] hover:bg-[#f7f7f9]"
                      >
                        View Formulation
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
