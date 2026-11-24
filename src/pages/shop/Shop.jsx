import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

import { getProducts } from "../../services/productService";
import ProductCard from "../../components/ProductCard";
import "./Shop.css";

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "low-high", label: "Price: Low to high" },
  { value: "high-low", label: "Price: High to low" },
  { value: "name", label: "Name: A to Z" },
];

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
    <main className="shop-page">
      {/* Editorial Catalog Header (Matching Reference Design) */}
      <header className="shop-editorial-header">
        <h1 className="shop-editorial-title">
          FORMULATIONS ENGINEERED FOR PURITY.
          <br />
          AND BUILT FOR HOW YOU PERFORM.
        </h1>

        <div className="shop-editorial-manifesto">
          <p className="shop-editorial-col">
            GYMKHANA was created for those who refuse the noise of commercial nutrition. This is not synthetic hype &mdash; it is bioavailable fuel in its purest physiological form. Every formulation is engineered from clinical isolates, transparent active dosages, and uncompromised raw compounds, designed to integrate seamlessly into your metabolic rhythm and support cellular output. Unlike commercial blends, GYMKHANA contains zero redundant fillers.
          </p>
          <p className="shop-editorial-col">
            It does not substitute for hard work &mdash; it honors it. A clean, disciplined regimen that works with your body long after the session ends. The collection is structured as an apothecary of physical performance: for morning conditioning, for peak muscular recovery, for sustained focus, and for unbroken consistency. You don&rsquo;t just take a supplement. You commit to your standard.
          </p>
        </div>
      </header>

      {/* Control Bar: Section Tag & Minimal Inline Controls */}
      <section className="shop-controls-bar" aria-label="Product search and filters">
        <div className="shop-section-tag-wrapper">
          <h2 className="shop-section-tag">SHOP</h2>
          <span className="shop-results-meta">
            ({filteredProducts.length} {filteredProducts.length === 1 ? "FORMULATION" : "FORMULATIONS"})
          </span>
        </div>

        {/* Minimal Controls: Search, Category & Sort */}
        <div className="shop-filters-group">
          {/* Minimal Search Input */}
          <div className="shop-search-wrapper">
            <Search size={13} className="shop-search-icon" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search formulations..."
              aria-label="Search formulations"
              className="shop-search-input"
            />
            {search && (
              <button
                type="button"
                className="shop-search-clear"
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
          <div className="shop-filter-item">
            <select
              id="shop-category-select"
              value={category}
              onChange={handleCategoryChange}
              className="shop-filter-select"
              aria-label="Filter by category"
            >
              <option value="all">ALL CATEGORIES</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="shop-filter-item">
            <select
              id="shop-sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="shop-filter-select"
              aria-label="Sort formulations"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {(search.trim() || category !== "all" || sort !== "default") && (
            <button type="button" onClick={clearFilters} className="shop-reset-btn">
              RESET &times;
            </button>
          )}
        </div>
      </section>

      {/* Product Grid Area */}
      <section className="shop-grid-section" aria-live="polite">
        {loading && (
          <div className="shop-state-box">
            <p>Loading catalog formulations...</p>
          </div>
        )}

        {error && (
          <div className="shop-state-box error">
            <p>{error.message || "Unable to load products"}. Check the Supabase project configuration and database setup.</p>
            <button type="button" className="shop-retry-btn" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="shop-state-box empty">
            <p className="empty-title">No Formulations Found</p>
            <p className="empty-desc">
              We couldn&apos;t find any products matching your active search or category filter.
            </p>
            <button type="button" className="shop-retry-btn" onClick={clearFilters}>
              View All Products
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
