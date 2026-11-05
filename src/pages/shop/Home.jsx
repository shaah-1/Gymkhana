import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { fetchProducts } from "../../redux/productSlice";
import ProductCard from "../../components/ProductCard";
import { AboutSection } from "../about/About";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
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

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("idle"); // idle | subscribed | error

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Curate top best seller products (prefer in-stock products with images, up to 4 items)
  const bestSellers = useMemo(() => {
    if (!items || !items.length) return [];
    // Prioritize high-stock items and diverse categories
    const sorted = [...items].sort((a, b) => {
      const stockDiff = (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0);
      if (stockDiff !== 0) return stockDiff;
      return Number(b.price) - Number(a.price);
    });
    return sorted.slice(0, 4);
  }, [items]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      setNewsletterStatus("error");
      return;
    }
    setNewsletterStatus("subscribed");
  };

  return (
    <main className="home-container">
      {/* 1. HERO SECTION - HIGH-FASHION EDITORIAL ATHLETIC STAGING (GAZU PREFERENCE) */}
      <section className="gazu-hero-section" id="home">
        <div className="gazu-hero-stage">
          {/* Top-Left Editorial Micro-Copy */}
          <div className="gazu-meta-top">
            <p className="gazu-meta-heading">
              <span>FUEL YOUR GRIND</span>
              <span>BUILT YOUR STRENGTH</span>
              
            </p>
            <span className="gazu-meta-line" aria-hidden="true" />
          </div>

          {/* Central Monumental Typography & Centered Athlete Staging */}
          <div className="gazu-monumental-stage">
            <div className="gazu-brand-backdrop" aria-hidden="true">
              <span className="gazu-letters-left">GYMK</span>
              <span className="gazu-letters-right">HANA</span>
            </div>

            <div className="gazu-athlete-frame">
              <img
                src={publicAssetUrl("/images/hero-athlete-cutout.png?v=exact")}
                alt="Gymkhana Athlete"
                className="gazu-athlete-img"
                loading="eager"
              />
              <div className="gazu-floor-shadow" aria-hidden="true" />
            </div>
          </div>

          {/* Bottom Controls Row: Shop Now / Explore on left, Collection tag on right */}
          <div className="gazu-hero-footer">
            <div className="gazu-hero-actions">
              <Link to="/shop" className="gazu-btn-shop">
                SHOP NOW
              </Link>
              <Link to="/shop" className="gazu-link-explore">
                EXPLORE NEW IN
              </Link>
            </div>

            <div className="gazu-meta-bottom">
              <p className="gazu-meta-bottom-title">NEW</p>
              <p className="gazu-meta-bottom-title">COLLECTION</p>
              <p className="gazu-meta-bottom-year">2 0 2 6</p>
              <span className="gazu-meta-line" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. BEST SELLERS SECTION */}
      <section id="bestsellers" className="home-section best-sellers-section">
        <div className="home-section-header">
          <div>
            <p className="home-section-eyebrow">THE ESSENTIAL FORMULATIONS</p>
            <h2 className="home-section-title">Best Sellers</h2>
          </div>
          <Link to="/shop" className="home-section-more-link">
            View All Products &rarr;
          </Link>
        </div>

        {loading && <p className="home-status-msg">Loading best seller formulations...</p>}
        {error && <p className="home-status-msg error">{error}</p>}

        {!loading && !error && (
          <div className="product-grid">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} showBadge={true} />
            ))}
          </div>
        )}

        <div className="best-sellers-footer">
          <Link to="/shop" className="home-cta-button">
            Explore All Formulations ({items.length}) &rarr;
          </Link>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION - MINIMAL EDITORIAL */}
      <section id="categories" className="home-minimal-editorial-section categories-minimal-section">
        <div className="home-minimal-container">
          <header className="home-minimal-header">
            <h2 className="home-minimal-title">Shop by Category</h2>
            <p className="home-minimal-subtitle">
              Precision nutritional architectures formulated with intent for every phase of training and biological recovery.
            </p>
          </header>

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

      {/* 4. ABOUT PREVIEW SECTION */}
      <section id="about-preview" className="home-about-preview-anchor">
        <AboutSection isStandalone={false} />
      </section>

      {/* 5. NEWSLETTER SECTION - MINIMAL EDITORIAL */}
      <section id="newsletter" className="home-minimal-editorial-section newsletter-minimal-section">
        <div className="home-minimal-newsletter-box">
          <p className="home-minimal-eyebrow">THE GYMKHANA JOURNAL</p>
          <h2 className="home-minimal-heading-italic">Stay in the know</h2>
          <p className="home-minimal-subtitle">
            Subscribe for priority batch allocations, private laboratory releases, and athletic training philosophy.
          </p>

          {newsletterStatus === "subscribed" ? (
            <div className="home-minimal-success-box" role="status">
              <p className="home-minimal-success-title">You are now on the private list.</p>
              <p className="home-minimal-success-desc">
                We’ve reserved your priority allocation for upcoming formulation releases.
              </p>
            </div>
          ) : (
            <form className="home-minimal-newsletter-form" onSubmit={handleNewsletterSubmit}>
              <div className="home-minimal-field-group">
                <label htmlFor="newsletter-email" className="home-minimal-field-label">
                  EMAIL ADDRESS
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterStatus === "error") setNewsletterStatus("idle");
                  }}
                  placeholder="name@example.com"
                  aria-label="Email address for newsletter"
                  required
                  className="home-minimal-underline-input"
                />
              </div>

              <button type="submit" className="home-minimal-submit-btn">
                SIGN UP
              </button>
            </form>
          )}

          {newsletterStatus === "error" && (
            <p className="home-minimal-error-msg" role="alert">
              Please enter a valid email address.
            </p>
          )}

          <div className="home-minimal-guarantees">
            <span>Clinical Transparency</span>
            <span className="dot">&bull;</span>
            <span>Zero Spam</span>
            <span className="dot">&bull;</span>
            <span>Unsubscribe Anytime</span>
          </div>
        </div>
      </section>
    </main>
  );
}
