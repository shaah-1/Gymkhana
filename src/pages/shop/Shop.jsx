import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Search, X } from "lucide-react";

import { getProducts } from "../../services/productService";
import ProductCard from "../../components/ProductCard";

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "low-high", label: "Price: Low to high" },
  { value: "high-low", label: "Price: High to low" },
  { value: "name", label: "Name: A to Z" },
];

const selectClass =
  "h-8 cursor-pointer appearance-none rounded-none border border-[#d5d7dc] bg-transparent pr-[26px] pl-[10px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[10.5px] font-semibold tracking-[0.12em] text-[#121214] uppercase outline-none transition-colors duration-200 hover:border-[#121214] focus:border-[#121214] max-[768px]:w-full";

export default function Shop() {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: items = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const search = queryParams.get("search") || "";
  const category = queryParams.get("category") || "all";
  const [sort, setSort] = useState("default");

  // Distinct available categories derived from products with primary disciplines ordered
  const availableCategories = useMemo(() => {
    const cats = new Set();
    const priority = ["Protein", "Creatine", "Pre-Workout", "Recovery", "Weight Gain", "Snacks", "Accessories"];
    priority.forEach((c) => cats.add(c));
    (items || []).forEach((p) => {
      if (p.category && typeof p.category === "string" && p.category.trim()) {
        cats.add(p.category.trim());
      }
    });
    return Array.from(cats);
  }, [items]);

  // Filtered & sorted products by search query and category
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cat = category.trim().toLowerCase();

    const list = items.filter((p) => {
      const matchQ =
        !q ||
        `${p.name} ${p.description || ""} ${p.category || ""}`
          .toLowerCase()
          .includes(q);

      const pCat = (p.category || "").toLowerCase();
      const matchCat =
        cat === "all" ||
        pCat === cat ||
        (cat === "protein" && pCat.includes("protein")) ||
        (cat === "creatine" && pCat.includes("creatine")) ||
        (cat === "pre-workout" && (pCat.includes("pre-workout") || pCat.includes("preworkout"))) ||
        (cat === "recovery" && pCat.includes("recovery")) ||
        (cat === "accessories" && pCat.includes("accessories"));

      return matchQ && matchCat;
    });

    if (sort === "low-high") list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === "high-low") list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [items, search, sort, category]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const params = new URLSearchParams(location.search);
    if (val.trim()) {
      params.set("search", val);
    } else {
      params.delete("search");
    }
    navigate({ pathname: "/shop", search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    const params = new URLSearchParams(location.search);
    if (val && val !== "all") {
      params.set("category", val);
    } else {
      params.delete("category");
    }
    navigate({ pathname: "/shop", search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
  };

  const clearFilters = () => {
    setSort("default");
    navigate("/shop", { replace: true });
  };

  return (
    <main className="mx-auto box-border w-full max-w-[1360px] bg-white px-[clamp(20px,4vw,64px)] pt-[clamp(52px,6.5vw,96px)] pb-[120px] text-[#121214] max-[768px]:px-4 max-[768px]:pt-8 max-[768px]:pb-[72px] max-[480px]:px-3 max-[480px]:pt-6 max-[480px]:pb-[60px]">
      {/* Editorial Catalog Header */}
      <header className="mb-[clamp(60px,7.5vw,104px)] w-full text-center max-[768px]:mb-9">
        <h1 className="mx-auto my-0 max-w-[860px] font-['Cormorant_Garamond','Didot','Bodoni_MT','Playfair_Display',Georgia,serif] text-[clamp(24px,3.2vw,38px)] leading-[1.32] font-medium tracking-[0.06em] text-[#121214] uppercase max-[480px]:mb-[6px] max-[480px]:text-[clamp(28px,8vw,38px)]">
          FORMULATIONS ENGINEERED FOR PURITY.
          <br />
          AND BUILT FOR HOW YOU PERFORM.
        </h1>

        <div className="mx-auto mt-[clamp(36px,4.5vw,56px)] grid max-w-[920px] grid-cols-2 gap-[clamp(32px,5vw,84px)] text-left max-[860px]:gap-8 max-[768px]:mt-6 max-[768px]:grid-cols-1 max-[768px]:gap-5">
          <p className="m-0 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[clamp(12.5px,0.98vw,13.5px)] leading-[1.74] text-[#4a4d55]">
            GYMKHANA was created for those who refuse the noise of commercial nutrition. This is not synthetic hype &mdash; it is bioavailable fuel in its purest physiological form. Every formulation is engineered from clinical isolates, transparent active dosages, and uncompromised raw compounds, designed to integrate seamlessly into your metabolic rhythm and support cellular output. Unlike commercial blends, GYMKHANA contains zero redundant fillers.
          </p>
          <p className="m-0 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[clamp(12.5px,0.98vw,13.5px)] leading-[1.74] text-[#4a4d55]">
            It does not substitute for hard work &mdash; it honors it. A clean, disciplined regimen that works with your body long after the session ends. The collection is structured as an apothecary of physical performance: for morning conditioning, for peak muscular recovery, for sustained focus, and for unbroken consistency. You don&rsquo;t just take a supplement. You commit to your standard.
          </p>
        </div>
      </header>

      {/* Control Bar: Section Tag & Minimal Inline Controls */}
      <section
        className="mb-[clamp(28px,3.5vw,44px)] box-border flex flex-wrap items-center justify-between gap-5 border-b border-[#ededf0] pb-4 max-[768px]:mb-6 max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-[14px]"
        aria-label="Product search and filters"
      >
        <div className="flex items-baseline gap-[10px]">
          <h2 className="m-0 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[11.5px] font-bold tracking-[0.22em] text-[#121214] uppercase">
            SHOP
          </h2>
          <span className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[10.5px] font-semibold tracking-[0.14em] text-[#8b8e96]">
            ({filteredProducts.length} {filteredProducts.length === 1 ? "FORMULATION" : "FORMULATIONS"})
          </span>
        </div>

        {/* Minimal Controls: Search, Category & Sort */}
        <div className="flex flex-wrap items-center gap-[clamp(12px,1.8vw,20px)] max-[768px]:w-full max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-[10px]">
          {/* Minimal Search Input */}
          <div className="relative flex w-[210px] items-center max-[768px]:w-full">
            <Search size={13} className="pointer-events-none absolute left-[10px] text-[#8b8e96]" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search formulations..."
              aria-label="Search formulations"
              className="h-8 w-full rounded-none border border-[#d5d7dc] bg-transparent pr-7 pl-[30px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[11.5px] tracking-[0.04em] text-[#121214] outline-none transition-colors duration-200 focus:border-[#121214]"
            />
            {search && (
              <button
                type="button"
                className="absolute right-[6px] flex cursor-pointer items-center justify-center border-0 bg-transparent p-1 text-[#8b8e96] transition-colors duration-150 hover:text-[#121214]"
                aria-label="Clear search"
                onClick={() => {
                  const params = new URLSearchParams(location.search);
                  params.delete("search");
                  navigate({ pathname: "/shop", search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative max-[768px]:w-full">
            <select
              id="shop-category-select"
              value={category}
              onChange={handleCategoryChange}
              className={selectClass}
              aria-label="Filter by category"
            >
              <option value="all" className="bg-white text-[#121214]">
                ALL CATEGORIES
              </option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-white text-[#121214]">
                  {cat.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown
              size={11}
              strokeWidth={2}
              className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[#121214]"
              aria-hidden="true"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative max-[768px]:w-full">
            <select
              id="shop-sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={selectClass}
              aria-label="Sort formulations"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white text-[#121214]">
                  {opt.label.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown
              size={11}
              strokeWidth={2}
              className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[#121214]"
              aria-hidden="true"
            />
          </div>

          {(search.trim() || category !== "all" || sort !== "default") && (
            <button
              type="button"
              onClick={clearFilters}
              className="cursor-pointer border-0 border-b-[1.5px] border-[#121214] bg-transparent px-0 py-[2px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[10.5px] font-bold tracking-[0.14em] text-[#121214] uppercase transition-opacity duration-150 hover:opacity-60"
            >
              RESET &times;
            </button>
          )}
        </div>
      </section>

      {/* Product Grid Area */}
      <section className="w-full" aria-live="polite">
        {loading && (
          <div className="rounded-none border border-[#ebebef] bg-[#fafafc] px-5 py-[72px] text-center text-[#55575e]">
            <p>Loading catalog formulations...</p>
          </div>
        )}

        {error && (
          <div className="rounded-none border border-[#ebebef] bg-[#fafafc] px-5 py-[72px] text-center text-[#55575e]">
            <p className="mx-auto mb-6 max-w-[440px] text-[13.5px] leading-[1.6] text-[#71737d]">
              {error.message || "Unable to load products"}. Check the Supabase project configuration and database setup.
            </p>
            <button
              type="button"
              className="inline-block cursor-pointer rounded-none border-0 bg-[#121214] px-7 py-3 text-[11px] font-semibold tracking-[0.16em] text-white uppercase transition-opacity duration-150 hover:opacity-85"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="rounded-none border border-[#ebebef] bg-[#fafafc] px-5 py-[72px] text-center text-[#55575e]">
            <p className="m-0 mb-2 font-['Cormorant_Garamond',Georgia,serif] text-2xl font-medium text-[#121214]">
              No Formulations Found
            </p>
            <p className="mx-auto mb-6 max-w-[440px] text-[13.5px] leading-[1.6] text-[#71737d]">
              We couldn&apos;t find any products matching your active search or category filter.
            </p>
            <button
              type="button"
              className="inline-block cursor-pointer rounded-none border-0 bg-[#121214] px-7 py-3 text-[11px] font-semibold tracking-[0.16em] text-white uppercase transition-opacity duration-150 hover:opacity-85"
              onClick={clearFilters}
            >
              View All Products
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="mx-auto grid w-full max-w-[1200px] grid-cols-4 items-stretch gap-[clamp(14px,1.8vw,24px)] max-[1100px]:min-[769px]:max-w-[900px] max-[1100px]:min-[769px]:grid-cols-3 max-[1100px]:min-[769px]:gap-4 max-[768px]:max-w-full max-[768px]:grid-cols-2 max-[768px]:gap-[14px] max-[480px]:gap-2 max-[360px]:grid-cols-1 max-[360px]:gap-[14px]">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
