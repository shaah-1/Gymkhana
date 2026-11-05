import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";

import { fetchProducts } from "../../redux/productSlice";
import ProductCard from "../../components/ProductCard";
import "./Shop.css";

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "low-high", label: "Price: Low to high" },
  { value: "high-low", label: "Price: High to low" },
  { value: "name", label: "Name: A to Z" },
];

export default function Shop() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { items, loading, error } = useSelector((s) => s.products);

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const search = queryParams.get("search") || "";
  const category = queryParams.get("category") || "all";
  const [sort, setSort] = useState("default");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

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
      {/* Editorial Catalog Header */}
      <header className="shop-header">
        <p className="shop-eyebrow">GYMKHANA APOTHECARY & LAB</p>
        <h1 className="shop-title">The Complete Collection</h1>
        <p className="shop-subtitle">
          Pure, clinical-grade sports nutrition engineered for maximum bioavailability and cellular recovery.
        </p>
      </header>

      {/* Control Bar: Search, Category & Sort */}
      <section className="shop-controls-bar" aria-label="Product search and filters">
        <div className="shop-search-wrapper">
          <Search size={15} className="shop-search-icon" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search formulations, ingredients..."
            aria-label="Search products"
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
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Controls Group: Category & Sort (matching pill aesthetic) */}
        <div className="shop-filters-group">
          {/* Category Dropdown Control */}
          <div className="shop-sort-wrapper shop-category-wrapper">
            <label htmlFor="shop-category-select" className="shop-sort-label">
              <Filter size={13} aria-hidden="true" />
              <span>Category</span>
            </label>
            <select
              id="shop-category-select"
              value={category}
              onChange={handleCategoryChange}
              className="shop-sort-select shop-category-select"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown Control */}
          <div className="shop-sort-wrapper">
            <label htmlFor="shop-sort-select" className="shop-sort-label">
              <SlidersHorizontal size={13} aria-hidden="true" />
              <span>Sort</span>
            </label>
            <select
              id="shop-sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="shop-sort-select"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Meta Bar: Product Count & Active Filters */}
      <div className="shop-meta-row">
        <span className="shop-results-count">
          Showing <strong>{filteredProducts.length}</strong> of {items.length} formulations
          {category !== "all" && (
            <span className="shop-active-cat-badge"> &middot; {category}</span>
          )}
        </span>

        {(search.trim() || category !== "all" || sort !== "default") && (
          <button type="button" onClick={clearFilters} className="shop-reset-btn">
            Clear all filters &times;
          </button>
        )}
      </div>

      {/* Product Grid Area */}
      <section className="shop-grid-section" aria-live="polite">
        {loading && (
          <div className="shop-state-box">
            <p>Loading catalog formulations...</p>
          </div>
        )}

        {error && (
          <div className="shop-state-box error">
            <p>{error}. Please ensure JSON Server is active.</p>
            <button type="button" className="shop-retry-btn" onClick={() => dispatch(fetchProducts())}>
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
