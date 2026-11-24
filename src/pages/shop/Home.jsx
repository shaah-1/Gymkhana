import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { fetchProducts } from "../../redux/productSlice";
import ProductCard from "../../components/ProductCard";
import { AboutSection } from "../about/About";
import StudioContact from "../../components/StudioContact";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
import { getProductSales } from "../../services/productService";
import "./Home.css";

const FEATURED_CATEGORIES = [
  {
    id: "protein",
    name: "Proteins & Isolates",
    slug: "Protein",
    desc: "Bioavailable cold-filtered whey isolate and clean plant matrices for pure muscle protein synthesis.",
    badge: "FOUNDATION",
  },
  {
    id: "preworkout",
    name: "Performance & Energy",
    slug: "Pre-Workout",
    desc: "Clinically dosed pump amplifiers, cognitive focus boosters, and endurance compounds.",
    badge: "OUTPUT",
  },
  {
    id: "creatine",
    name: "Strength & Power",
    slug: "Creatine",
    desc: "Micronized 99.9% pure creatine monohydrate for rapid intracellular ATP regeneration.",
    badge: "FORCE",
  },
  {
    id: "recovery",
    name: "Recovery & Aminos",
    slug: "Recovery",
    desc: "Fermented branch-chain aminos, cellular hydration electrolytes, and tissue repair.",
    badge: "RESTORATION",
  },
];

export default function Home() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.products);

  // Real store orders to determine actual most selling products
  const [sales, setSales] = useState([]);
  const [salesError, setSalesError] = useState("");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;
    getProductSales()
      .then((result) => {
        if (isMounted) setSales(Array.isArray(result) ? result : []);
      })
      .catch((requestError) => {
        if (isMounted) {
          setSalesError(requestError.message || "Unable to load sales data.");
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Determine top 4 most selling products dynamically based on verified sales volume
  const bestSellers = useMemo(() => {
    if (!items || !items.length) return [];

    const salesMap = {};
    sales.forEach(({ product_id, sold }) => {
      if (product_id) salesMap[String(product_id)] = Number(sold) || 0;
    });

    const sorted = [...items].sort((a, b) => {
      const soldA = salesMap[String(a.id)] || 0;
      const soldB = salesMap[String(b.id)] || 0;
      if (soldB !== soldA) return soldB - soldA;

      // In-stock products prioritized
      const stockA = Number(a.stock) > 0 ? 1 : 0;
      const stockB = Number(b.stock) > 0 ? 1 : 0;
      if (stockB !== stockA) return stockB - stockA;

      return Number(b.price || 0) - Number(a.price || 0);
    });

    return sorted.slice(0, 4);
  }, [items, sales]);

  return (
    <main className="home-container">
      {/* 1. HERO SECTION - HIGH-FASHION EDITORIAL ATHLETIC STAGING (GYMKHANA MONUMENTAL) */}
      <section className="gym-hero-section" id="home">
        <div className="gym-hero-stage">
          {/* Top-Left Editorial Micro-Copy */}
          <div className="gym-meta-top">
            <p className="gym-meta-heading">
              <span>FUEL YOUR GRIND</span>
              <span>BUILT YOUR STRENGTH</span>
              
            </p>
            <span className="gym-meta-line" aria-hidden="true" />
          </div>

          {/* Central Monumental Typography & Centered Athlete Staging */}
          <div className="gym-monumental-stage">
            <div className="gym-brand-backdrop" aria-hidden="true">
              <span className="gym-letters-left">GYMK</span>
              <span className="gym-letters-right">HANA</span>
            </div>

            <div className="gym-athlete-frame">
              <img
                src={publicAssetUrl("/images/hero-athlete-cutout.png")}
                alt="Gymkhana Athlete"
                className="gym-athlete-img"
                loading="eager"
              />
              <div className="gym-floor-shadow" aria-hidden="true" />
            </div>
          </div>

          {/* Bottom Controls Row: Shop Now / Explore on left, Collection tag on right */}
          <div className="gym-hero-footer">
            <div className="gym-hero-actions">
              <Link to="/shop" className="gym-btn-shop">
                SHOP NOW
              </Link>
              <Link to="/shop" className="gym-link-explore">
                EXPLORE NEW IN
              </Link>
            </div>

            <div className="gym-meta-bottom">
              <p className="gym-meta-bottom-title">NEW</p>
              <p className="gym-meta-bottom-title">COLLECTION</p>
              <p className="gym-meta-bottom-year">2 0 2 6</p>
              <span className="gym-meta-line" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION - BLACK LUXURY EDITORIAL */}
      <section id="categories" className="home-categories-section">
        <div className="home-categories-container">
          <div className="home-minimal-categories-grid">
            {FEATURED_CATEGORIES.map((cat, idx) => (
              <Link
                key={cat.id}
                to={`/shop?category=${encodeURIComponent(cat.slug)}`}
                className="home-minimal-category-card"
              >
                <div className="home-minimal-cat-top">
                  <span className="home-minimal-cat-num">0{idx + 1}</span>
                  <span className="home-minimal-cat-badge">{cat.badge}</span>
                </div>

                <div className="home-minimal-cat-body">
                  <h3 className="home-minimal-cat-name">{cat.name}</h3>
                  <p className="home-minimal-cat-desc">{cat.desc}</p>
                </div>

                <div className="home-minimal-cat-footer">
                  <span className="home-minimal-cat-link">
                    Explore Formulations &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BEST SELLERS SECTION */}
      <section id="bestsellers" className="home-section best-sellers-section">
        <div className="home-section-header">
          <div>
            <p className="home-section-eyebrow">THE ESSENTIAL FORMULATIONS</p>
            <h2 className="home-section-title">BEST OF GYMKHANA</h2>
          </div>
          <Link to="/shop" className="home-section-more-link">
            View All Products &rarr;
          </Link>
        </div>

        {loading && <p className="home-status-msg">Loading best seller formulations...</p>}
        {error && <p className="home-status-msg error">{error}</p>}
        {salesError && <p className="home-status-msg error">{salesError}</p>}

        {!loading && !error && (
          <div className="product-grid">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showBadge={false}
                variant="imageOnly"
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. ABOUT PREVIEW SECTION */}
      <section id="about-preview" className="home-about-preview-anchor">
        <AboutSection isStandalone={false} />
      </section>

      {/* 5. CONTACT & EDITORIAL STUDIO FOOTER */}
      <StudioContact />
    </main>
  );
}
