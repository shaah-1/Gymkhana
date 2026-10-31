
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/productSlice";
import ProductCard from "../components/ProductCard";
import { ContactSection } from "./Contact";
import { storefrontCopy } from "../copy/storefrontCopy";
import { useLocation } from "react-router-dom";

export default function Home() {
  const dispatch = useDispatch();
  const location = useLocation();

  const { items, loading, error } = useSelector(
    (state) => state.products
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    setSearch(new URLSearchParams(location.search).get("search") || "");
  }, [location.search]);

  // Get categories from products in JSON Server
 const categories = useMemo(() => [
  "All",
  ...new Set(
    items
      .map((product) => product.category)
      .filter(Boolean)
  ),
], [items]);

  // Search, filter, and sort products
  const filteredProducts = useMemo(() => {
    let result = items.filter((product) => {
      const matchesSearch = `${product.name} ${
        product.description || ""
      }`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });

    if (sort === "low-high") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "high-low") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [items, search, category, sort]);

  useEffect(() => {
    const cards = document.querySelectorAll("#products .product-card");
    if (!cards.length) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => card.classList.add("scroll-revealed"));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("scroll-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

    cards.forEach((card, index) => {
      card.classList.remove("scroll-revealed");
      card.classList.add("scroll-reveal");
      card.style.setProperty("--reveal-delay", `${(index % 4) * 65}ms`);
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [filteredProducts.length, search]);

  return (
    <main>
      <section className="hero" id="home">
        <p className="eyebrow">WELCOME TO</p>
        <h1 className="hero-brand">GYMKHANA</h1>
        <p className="hero-tagline">
          {storefrontCopy.ambitionTagline}
        </p>
        <p>
          Premium sports nutrition and gym essentials for your
          next level.
        </p>

        <a href="#products" className="hero-button">
          {storefrontCopy.collectionLink}
        </a>
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
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setOpenMenu(null);
              }}
            >
              <button
                type="button"
                className="product-menu-trigger"
                aria-haspopup="menu"
                aria-expanded={openMenu === "category"}
                onClick={() => setOpenMenu("category")}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setOpenMenu(null);
                }}
              >
                <span>Category</span>
                <span className="product-menu-value">{category === "All" ? "All" : category}</span>
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
                      onClick={() => {
                        setCategory(item);
                        setOpenMenu(null);
                      }}
                    >
                      {item === "All" ? "All" : item}
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
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setOpenMenu(null);
              }}
            >
              <button
                type="button"
                className="product-menu-trigger"
                aria-haspopup="menu"
                aria-expanded={openMenu === "sort"}
                onClick={() => setOpenMenu("sort")}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setOpenMenu(null);
                }}
              >
                <span>Sort by</span>
                <span className="product-menu-value">
                  {{ default: "Default", "low-high": "Price: Low to high", "high-low": "Price: High to low", name: "Name: A to Z" }[sort]}
                </span>
                <span className="product-menu-chevron" aria-hidden="true">⌄</span>
              </button>
              {openMenu === "sort" && (
                <div className="product-menu-list" role="menu" aria-label="Sort products">
                  {[
                    ["default", "Default"],
                    ["low-high", "Price: Low to high"],
                    ["high-low", "Price: High to low"],
                    ["name", "Name: A to Z"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={sort === value}
                      className={sort === value ? "selected" : ""}
                      onClick={() => {
                        setSort(value);
                        setOpenMenu(null);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && <p>Loading products...</p>}

        {error && (
          <p className="error-message">
            {error}. Check whether JSON Server is running on port 3000.
          </p>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <p className="no-products">
            No products found. Try another search or category.
          </p>
        )}

        {!loading && !error && (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <ContactSection />
    </main>
  );
}
