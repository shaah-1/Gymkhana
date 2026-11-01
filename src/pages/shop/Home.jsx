import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { fetchProducts } from "../../redux/productSlice";
import ProductCard from "../../components/ProductCard";
import { ContactSection } from "../contact/Contact";
import { storefrontCopy } from "../../copy/storefrontCopy";

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "low-high", label: "Price: Low to high" },
  { value: "high-low", label: "Price: High to low" },
  { value: "name", label: "Name: A to Z" },
];

export default function Home() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { items, loading, error } = useSelector((s) => s.products);

  const search = new URLSearchParams(location.search).get("search") || "";
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

  const categories = useMemo(() => ["All", ...new Set(items.map((p) => p.category).filter(Boolean))], [items]);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    const list = items.filter((p) => {
      const matchQ = !q || `${p.name} ${p.description || ""}`.toLowerCase().includes(q);
      return matchQ && (category === "All" || p.category === category);
    });

    if (sort === "low-high") list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === "high-low") list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [items, search, category, sort]);

  useEffect(() => {
    const cards = document.querySelectorAll("#products .product-card");
    if (!cards.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((c) => c.classList.add("scroll-revealed"));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("scroll-revealed"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

    cards.forEach((card, idx) => {
      card.classList.remove("scroll-revealed");
      card.classList.add("scroll-reveal");
      card.style.setProperty("--reveal-delay", `${(idx % 4) * 65}ms`);
      obs.observe(card);
    });

    return () => obs.disconnect();
  }, [filteredProducts.length, search]);

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || "Default";

  return (
    <main>
      <section className="hero" id="home">
        <p className="eyebrow">WELCOME TO</p>
        <h1 className="hero-brand">GYMKHANA</h1>
        <p className="hero-tagline">{storefrontCopy.ambitionTagline}</p>
        <p>Premium sports nutrition and gym essentials for your next level.</p>
        <a href="#products" className="hero-button">{storefrontCopy.collectionLink}</a>
      </section>

      <section id="products" className="products-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{storefrontCopy.collectionLabel}</p>
            <h2>{storefrontCopy.ambitionHeading}</h2>
          </div>
          <span>{filteredProducts.length} products</span>
        </div>

        <div className="product-controls">
          <div className="product-menu-row">
            <div
              className="product-menu"
              onMouseEnter={() => setOpenMenu("category")}
              onMouseLeave={() => setOpenMenu(null)}
              onFocus={() => setOpenMenu("category")}
              onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpenMenu(null)}
            >
              <button
                type="button"
                className="product-menu-trigger"
                aria-haspopup="menu"
                aria-expanded={openMenu === "category"}
                onClick={() => setOpenMenu("category")}
                onKeyDown={(e) => e.key === "Escape" && setOpenMenu(null)}
              >
                <span>Category</span>
                <span className="product-menu-value">{category}</span>
                <span className="product-menu-chevron" aria-hidden="true">⌄</span>
              </button>

              {openMenu === "category" && (
                <div className="product-menu-list" role="menu" aria-label="Filter by category">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      role="menuitemradio"
                      aria-checked={category === item}
                      className={category === item ? "selected" : ""}
                      onClick={() => { setCategory(item); setOpenMenu(null); }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              className="product-menu"
              onMouseEnter={() => setOpenMenu("sort")}
              onMouseLeave={() => setOpenMenu(null)}
              onFocus={() => setOpenMenu("sort")}
              onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpenMenu(null)}
            >
              <button
                type="button"
                className="product-menu-trigger"
                aria-haspopup="menu"
                aria-expanded={openMenu === "sort"}
                onClick={() => setOpenMenu("sort")}
                onKeyDown={(e) => e.key === "Escape" && setOpenMenu(null)}
              >
                <span>Sort by</span>
                <span className="product-menu-value">{activeSortLabel}</span>
                <span className="product-menu-chevron" aria-hidden="true">⌄</span>
              </button>

              {openMenu === "sort" && (
                <div className="product-menu-list" role="menu" aria-label="Sort products">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={sort === opt.value}
                      className={sort === opt.value ? "selected" : ""}
                      onClick={() => { setSort(opt.value); setOpenMenu(null); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && <p>Loading products...</p>}
        {error && <p className="error-message">{error}. Check whether JSON Server is running on port 3000.</p>}
        {!loading && !error && filteredProducts.length === 0 && (
          <p className="no-products">No products found. Try another search or category.</p>
        )}

        {!loading && !error && (
          <div className="product-grid">
            {filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <ContactSection />
    </main>
  );
}
