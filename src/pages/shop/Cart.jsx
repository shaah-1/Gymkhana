import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  decreaseQuantity,
  fetchCart,
  increaseQuantity,
  removeFromCart,
} from "../../redux/cartSlice";
import { formatCurrency } from "../../utils/formatters";
import { publicAssetUrl } from "../../utils/publicAssetUrl";

const primaryBtnClass =
  "group box-border flex w-full cursor-pointer items-center justify-between rounded-none border border-[#121214] bg-[#121214] px-[22px] py-[17px] font-[Arial,sans-serif] text-[11px] font-bold tracking-[0.2em] text-white uppercase no-underline transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-px hover:border-[#2b2b30] hover:bg-[#2b2b30] hover:text-white";

const stepperBtnClass =
  "flex h-[34px] w-[34px] cursor-pointer items-center justify-center border-0 bg-transparent text-[15px] font-normal text-[#121214] transition-[background,color] duration-150 hover:not-disabled:bg-[#f7f7f9] hover:not-disabled:text-[#121214] disabled:cursor-not-allowed disabled:opacity-25 max-[768px]:h-7 max-[768px]:w-7 max-[768px]:text-sm max-[480px]:h-[26px] max-[480px]:w-[26px] max-[480px]:text-[13px]";

const removeLinkClass =
  "cursor-pointer border-0 bg-transparent px-0 py-[2px] text-[10.5px] font-semibold tracking-[0.1em] text-[#8b8e96] uppercase underline decoration-[#ebebef] underline-offset-[3px] transition-colors duration-200 hover:text-[#b91c1c] hover:decoration-[#b91c1c]";

export default function Cart() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.cart.items);
  const loading = useSelector((s) => s.cart.loading);
  const loaded = useSelector((s) => s.cart.loaded);
  const error = useSelector((s) => s.cart.error);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  useEffect(() => {
    if (isAuthenticated && !loading && !loaded) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated, loaded, loading]);

  const pageShellClass =
    "box-border min-h-[calc(100vh-80px)] bg-white px-[4%] pt-[60px] pb-[100px] text-[#121214] max-[768px]:px-[4%] max-[768px]:pt-[35px] max-[768px]:pb-[60px] max-[550px]:px-[4%] max-[550px]:pt-[35px] max-[550px]:pb-[55px] max-[480px]:px-[14px] max-[480px]:pt-6 max-[480px]:pb-[50px]";

  const emptyBoxClass =
    "mx-auto my-20 max-w-[620px] rounded-none border border-[#ebebef] bg-[#fbfbfd] px-10 py-[60px] text-center max-[480px]:px-5 max-[480px]:py-10";

  const eyebrowClass =
    "mb-2 block font-[Arial,sans-serif] text-[10px] font-bold tracking-[0.22em] text-[#8b8e96] uppercase";

  if (loading || !loaded) {
    return (
      <main className={pageShellClass}>
        <div className={emptyBoxClass} role="status">
          <span className={eyebrowClass}>YOUR SELECTIONS</span>
          <h1 className="mt-3 mb-4 font-[Arial,sans-serif] text-[clamp(26px,3.2vw,36px)] font-bold tracking-[-0.02em] text-[#121214]">
            Loading your shopping bag…
          </h1>
        </div>
      </main>
    );
  }

  if (error && items.length === 0) {
    return (
      <main className={pageShellClass}>
        <div className={emptyBoxClass}>
          <span className={eyebrowClass}>YOUR SELECTIONS</span>
          <h1 className="mt-3 mb-4 font-[Arial,sans-serif] text-[clamp(26px,3.2vw,36px)] font-bold tracking-[-0.02em] text-[#121214]">
            Your shopping bag couldn&rsquo;t be loaded.
          </h1>
          <p className="mx-auto mb-8 max-w-[460px] text-[14.5px] leading-[1.7] text-[#55575e]" role="alert">
            {error}
          </p>
          <button
            type="button"
            className={`${primaryBtnClass} mx-auto max-w-[300px]`}
            onClick={() => dispatch(fetchCart())}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className={pageShellClass}>
        <div className={emptyBoxClass}>
          <span className={eyebrowClass}>YOUR SELECTIONS</span>
          <h1 className="mt-3 mb-4 font-[Arial,sans-serif] text-[clamp(26px,3.2vw,36px)] font-bold tracking-[-0.02em] text-[#121214]">
            Your shopping bag is empty.
          </h1>
          <p className="mx-auto mb-8 max-w-[460px] text-[14.5px] leading-[1.7] text-[#55575e]">
            There are currently no items in your bag. Explore our collection of premium sports nutrition, recovery formulas, and gym essentials.
          </p>
          <Link to="/" className={`${primaryBtnClass} mx-auto max-w-[300px]`}>
            <span>Explore the Collection</span>
            <ArrowRight size={15} strokeWidth={2} className="transition-transform duration-250 group-hover:translate-x-1" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={pageShellClass}>
      <div className="mx-auto max-w-[1320px]">
        {/* Editorial Cart Header */}
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-[#ebebef] pb-7 max-[768px]:mb-7 max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-4">
          <div>
            <span className={eyebrowClass}>YOUR SELECTIONS</span>
            <h1 className="m-0 font-[Arial,sans-serif] text-[clamp(28px,3.4vw,42px)] leading-[1.15] font-bold tracking-[-0.02em] text-[#121214]">
              Shopping Bag
              <span className="ml-2 align-middle font-[Arial,sans-serif] text-[0.5em] font-bold tracking-[0.05em] text-[#71737d]">
                ({items.length} {items.length === 1 ? "product" : "products"})
              </span>
            </h1>
          </div>
          <div className="inline-flex items-center gap-[10px] rounded-none border border-[#ebebef] bg-[#fbfbfd] px-[14px] py-2 text-xs tracking-[0.04em] text-[#55575e]">
            <span
              className="h-[6px] w-[6px] rounded-full bg-[#15803d] shadow-[0_0_6px_rgba(21,128,61,0.35)]"
              aria-hidden="true"
            />
            <span>Complimentary carbon-neutral delivery included</span>
          </div>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)_400px] items-start gap-14 max-[1024px]:grid-cols-1 max-[1024px]:gap-12">
          {/* Products List Section */}
          <section aria-label="Selected products">
            <div
              className="grid grid-cols-[minmax(0,1fr)_140px_110px] border-b border-[#ebebef] pb-[14px] font-[Arial,sans-serif] text-[10.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase max-[768px]:hidden"
              aria-hidden="true"
            >
              <span>Item</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Total</span>
            </div>

            <div className="flex flex-col">
              {items.map((item) => {
                const stock = Number(item.stock ?? 0);
                const lineTotal = Number(item.price) * item.quantity;
                return (
                  <article
                    className="grid grid-cols-[120px_minmax(0,1fr)_140px_110px] items-center gap-6 border-b border-[#ebebef] py-7 transition-colors duration-200 hover:bg-[#fafafc] max-[768px]:grid-cols-[90px_minmax(0,1fr)_auto] max-[768px]:gap-4 max-[768px]:py-5 max-[480px]:grid-cols-[74px_minmax(0,1fr)_auto] max-[480px]:gap-3 max-[480px]:py-4 max-[360px]:grid-cols-[60px_minmax(0,1fr)]"
                    key={item.id}
                  >
                    {/* Floating Product Image */}
                    <Link
                      to={`/products/${item.productId || item.id}`}
                      className="group box-border flex h-[130px] w-[120px] items-center justify-center rounded-none border border-[#ebebef] bg-[#f7f7f9] p-[10px] no-underline transition-[border-color,background] duration-250 hover:border-[#121214] hover:bg-[#f0f0f4] max-[768px]:h-[100px] max-[768px]:w-[90px] max-[480px]:h-[84px] max-[480px]:w-[74px] max-[360px]:h-[70px] max-[360px]:w-[60px]"
                      tabIndex={-1}
                    >
                      <img
                        src={publicAssetUrl(item.image)}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-250 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex min-w-0 flex-col gap-[5px]">
                      <span className="font-[Arial,sans-serif] text-[10px] font-bold tracking-[0.16em] text-[#8b8e96] uppercase">
                        {item.category}
                      </span>
                      <h2 className="mt-[2px] mb-1 font-[Arial,sans-serif] text-base leading-[1.35] font-semibold max-[768px]:text-[15px] max-[480px]:text-[13.5px]">
                        <Link
                          to={`/products/${item.productId || item.id}`}
                          className="text-[#121214] no-underline transition-colors duration-200 hover:text-[#55575e]"
                        >
                          {item.name}
                        </Link>
                      </h2>
                      <span className="font-[Arial,sans-serif] text-[13px] text-[#71737d] tabular-nums">
                        {formatCurrency(item.price)} each
                      </span>

                      {stock > 0 && stock <= 3 && (
                        <span className="mt-1 font-[Arial,sans-serif] text-[11px] font-semibold tracking-[0.04em] text-[#b45309]">
                          Only {stock} remaining in stock
                        </span>
                      )}

                      {/* Mobile Stepper & Actions */}
                      <div className="mt-[10px] hidden items-center gap-[14px] max-[768px]:flex">
                        <div
                          className="inline-flex items-center overflow-hidden rounded-none border border-[#ebebef] bg-white"
                          role="group"
                          aria-label={`Quantity for ${item.name}`}
                        >
                          <button
                            type="button"
                            className={stepperBtnClass}
                            aria-label={`Decrease ${item.name} quantity`}
                            onClick={() => dispatch(decreaseQuantity(item.id))}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="min-w-[26px] text-center font-[Arial,sans-serif] text-xs font-bold text-[#121214] tabular-nums max-[480px]:min-w-[22px] max-[480px]:text-[11.5px]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className={stepperBtnClass}
                            aria-label={`Increase ${item.name} quantity`}
                            onClick={() => dispatch(increaseQuantity(item.id))}
                            disabled={stock <= 0 || item.quantity >= stock}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className={removeLinkClass}
                          onClick={() => dispatch(removeFromCart(item.id))}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Desktop Stepper */}
                    <div className="flex flex-col items-center gap-[10px] max-[768px]:hidden">
                      <div
                        className="inline-flex items-center overflow-hidden rounded-none border border-[#ebebef] bg-white"
                        role="group"
                        aria-label={`Quantity for ${item.name}`}
                      >
                        <button
                          type="button"
                          className={stepperBtnClass}
                          aria-label={`Decrease ${item.name} quantity`}
                          onClick={() => dispatch(decreaseQuantity(item.id))}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center font-[Arial,sans-serif] text-[13px] font-bold text-[#121214] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className={stepperBtnClass}
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() => dispatch(increaseQuantity(item.id))}
                          disabled={stock <= 0 || item.quantity >= stock}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className={removeLinkClass}
                        onClick={() => dispatch(removeFromCart(item.id))}
                      >
                        Remove
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right max-[768px]:self-start max-[768px]:pt-1 max-[360px]:col-start-2 max-[360px]:mt-[6px] max-[360px]:pt-0 max-[360px]:text-left">
                      <span className="font-[Arial,sans-serif] text-base font-bold text-[#121214] tabular-nums max-[768px]:text-[15px] max-[480px]:text-sm">
                        {formatCurrency(lineTotal)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="pt-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 font-[Arial,sans-serif] text-[11px] font-bold tracking-[0.14em] text-[#55575e] uppercase no-underline transition-[color,transform] duration-200 hover:-translate-x-[3px] hover:text-[#121214]"
              >
                <ArrowLeft size={14} strokeWidth={2} />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </section>

          {/* Right Column: Order Summary Ledger */}
          <aside className="sticky top-[90px] max-[1024px]:static">
            <div className="rounded-none border border-[#ebebef] bg-[#fbfbfd] px-[30px] py-[34px] max-[768px]:px-5 max-[768px]:py-6 max-[480px]:px-[14px] max-[480px]:py-5">
              <h2 className="m-0 mb-6 border-b border-[#ebebef] pb-[18px] font-[Arial,sans-serif] text-sm font-bold tracking-[0.12em] text-[#121214] uppercase">
                Order Summary
              </h2>

              <dl className="m-0 mb-[26px] flex flex-col gap-[14px] p-0">
                <div className="flex items-baseline justify-between text-[13.5px] text-[#55575e]">
                  <dt className="text-[#55575e]">Subtotal</dt>
                  <dd className="m-0 font-[Arial,sans-serif] font-semibold text-[#121214] tabular-nums">
                    {formatCurrency(subtotal)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between text-[13.5px] text-[#55575e]">
                  <dt className="text-[#55575e]">Delivery</dt>
                  <dd className="m-0 font-[Arial,sans-serif] font-semibold text-[#15803d] tabular-nums">
                    Complimentary
                  </dd>
                </div>
                <div className="flex items-baseline justify-between text-[13.5px] text-[#55575e]">
                  <dt className="text-[#55575e]">Taxes &amp; GST</dt>
                  <dd className="m-0 font-[Arial,sans-serif] font-semibold text-[#121214] tabular-nums">
                    Calculated at checkout
                  </dd>
                </div>

                <div className="my-2 h-px bg-[#ebebef]" />

                <div className="flex items-baseline justify-between pt-[6px] text-[15px] text-[#121214]">
                  <dt className="font-[Arial,sans-serif] font-bold tracking-[0.08em] text-[#121214] uppercase">
                    Estimated Total
                  </dt>
                  <dd className="m-0 font-[Arial,sans-serif] text-2xl font-extrabold text-[#121214] tabular-nums">
                    {formatCurrency(subtotal)}
                  </dd>
                </div>
              </dl>

              <Link to="/checkout" className={primaryBtnClass}>
                <span>Proceed to Checkout</span>
                <ArrowRight
                  size={15}
                  strokeWidth={2}
                  className="transition-transform duration-250 group-hover:translate-x-1"
                />
              </Link>

              {/* Brand Guarantees */}
              <div className="mt-[30px] flex flex-col gap-[18px] border-t border-[#ebebef] pt-6">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#f0f0f3] text-[10px] font-bold text-[#121214]"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <div>
                    <strong className="mb-[2px] block text-xs font-semibold tracking-[0.02em] text-[#121214]">
                      Pure Lab-Tested Formulations
                    </strong>
                    <p className="m-0 text-xs leading-[1.55] text-[#55575e]">
                      100% genuine ingredients without hidden fillers or banned substances.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span
                    className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#f0f0f3] text-[10px] font-bold text-[#121214]"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <div>
                    <strong className="mb-[2px] block text-xs font-semibold tracking-[0.02em] text-[#121214]">
                      Complimentary Express Delivery
                    </strong>
                    <p className="m-0 text-xs leading-[1.55] text-[#55575e]">
                      Dispatched within 24 hours in discreet, climate-conscious packaging.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span
                    className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#f0f0f3] text-[10px] font-bold text-[#121214]"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <div>
                    <strong className="mb-[2px] block text-xs font-semibold tracking-[0.02em] text-[#121214]">
                      Hassle-Free Returns
                    </strong>
                    <p className="m-0 text-xs leading-[1.55] text-[#55575e]">
                      30-day satisfaction guarantee on every single purchase.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
