import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { fetchProducts } from "../../redux/productSlice";
import ProductCard from "../../components/ProductCard";
import { AboutSection } from "../about/About";
import StudioContact from "../../components/StudioContact";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
import { getProductSales } from "../../services/productService";

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
    <main className="m-0 w-full bg-[#e1e0dc] p-0 text-[#121214]">
      {/* 1. HERO SECTION - HIGH-FASHION EDITORIAL ATHLETIC STAGING (GYMKHANA MONUMENTAL) */}
      <section
        className="relative m-0 box-border flex h-[calc(100dvh-var(--navbar-height,72px))] max-h-[calc(100dvh-var(--navbar-height,72px))] w-full flex-col justify-between overflow-hidden border-b border-[#d4d3cf] bg-[#e1e0dc] px-[clamp(24px,5vw,72px)] pt-[clamp(14px,1.8vh,24px)] pb-[clamp(20px,2.5vh,32px)] text-[#0d0d0f] max-[820px]:h-[calc(100dvh-var(--navbar-height,64px))] max-[820px]:max-h-[calc(100dvh-var(--navbar-height,64px))] max-[820px]:px-5 max-[820px]:pt-[14px] max-[820px]:pb-[22px] max-[540px]:px-[14px] max-[540px]:pt-3 max-[540px]:pb-[18px]"
        id="home"
      >
        <div className="relative mx-auto box-border flex h-full min-h-0 w-full max-w-[1560px] flex-1 flex-col justify-between">
          {/* Top-Left Editorial Micro-Copy */}
          <div className="z-[10] flex shrink-0 flex-col items-start">
            <p className="m-0 flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[clamp(10px,1vw,12px)] leading-[1.5] font-bold tracking-[0.22em] text-[#0d0d0f] uppercase max-[540px]:text-[9.5px] max-[540px]:tracking-[0.18em]">
              <span>FUEL YOUR GRIND</span>
              <span>BUILT YOUR STRENGTH</span>
            </p>
            <span
              className="mt-2 block h-[1.5px] w-7 bg-[#0d0d0f] max-[540px]:mt-[6px] max-[540px]:w-[22px]"
              aria-hidden="true"
            />
          </div>

          {/* Central Monumental Typography & Centered Athlete Staging */}
          <div className="relative m-0 flex min-h-0 w-full flex-1 items-center justify-center overflow-visible p-0 max-[820px]:my-1 max-[540px]:my-[2px]">
            <div
              className="pointer-events-none absolute inset-0 z-[1] flex w-full items-center justify-center gap-[clamp(12px,1.6vw,32px)] font-['Manrope',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[clamp(64px,13.5vw,215px)] leading-[0.86] font-extrabold tracking-[-0.035em] whitespace-nowrap text-[#0d0d0f] uppercase select-none max-[820px]:gap-[clamp(10px,2.4vw,28px)] max-[820px]:text-[clamp(86px,18.5vw,155px)] max-[820px]:font-black max-[820px]:tracking-[-0.04em] max-[540px]:gap-[clamp(6px,1.6vw,12px)] max-[540px]:text-[clamp(70px,19.5vw,106px)] max-[540px]:leading-[0.82] max-[540px]:tracking-[-0.045em] max-[380px]:gap-1 max-[380px]:text-[clamp(62px,18.5vw,76px)]"
              aria-hidden="true"
            >
              <span className="inline-block text-right tracking-[clamp(0.01em,0.4vw,0.06em)] max-[820px]:tracking-[-0.03em] max-[540px]:tracking-[-0.04em]">
                GYMK
              </span>
              <span className="inline-block text-left tracking-[clamp(0.01em,0.4vw,0.06em)] max-[820px]:tracking-[-0.03em] max-[540px]:tracking-[-0.04em]">
                HANA
              </span>
            </div>

            <div className="relative z-[2] flex h-full max-h-full w-auto origin-bottom scale-[1.18] flex-col items-center justify-end transition-transform duration-250 max-[820px]:h-[92%] max-[820px]:max-h-[92%] max-[820px]:max-w-[clamp(230px,46vw,340px)] max-[820px]:scale-100 max-[540px]:h-[86%] max-[540px]:max-h-[86%] max-[540px]:max-w-[clamp(180px,52vw,230px)] max-[380px]:h-[84%] max-[380px]:max-h-[84%] max-[380px]:max-w-[190px]">
              <img
                src={publicAssetUrl("/images/hero-athlete-cutout.png")}
                alt="Gymkhana Athlete"
                className="block h-full max-h-full w-auto object-contain object-bottom"
                loading="eager"
              />
              <div
                className="pointer-events-none absolute bottom-0 h-3 w-[70%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(13,13,15,0.35)_0%,rgba(13,13,15,0)_72%)]"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Bottom Controls Row: Shop Now / Explore on left, Collection tag on right */}
          <div className="z-[10] flex w-full shrink-0 items-end justify-between gap-6 pb-[clamp(14px,2vh,26px)] max-[820px]:flex-row max-[820px]:gap-4 max-[820px]:pb-[6px] max-[540px]:gap-3 max-[540px]:pb-[2px]">
            <div className="flex flex-wrap items-center gap-[clamp(16px,2.5vw,32px)] max-[540px]:gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center rounded-none bg-[#0d0d0f] px-[clamp(22px,2.2vw,32px)] py-[13px] font-inherit text-[11px] font-bold tracking-[0.22em] text-white uppercase no-underline transition-[background,transform] duration-200 hover:bg-[#2b2b32] max-[820px]:px-5 max-[820px]:py-[11px] max-[820px]:text-[10.5px] max-[540px]:px-[15px] max-[540px]:py-[9px] max-[540px]:text-[9.5px] max-[540px]:tracking-[0.16em]"
              >
                SHOP NOW
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center border-b-[1.5px] border-[#0d0d0f] pb-[3px] font-inherit text-[11px] font-bold tracking-[0.22em] text-[#0d0d0f] uppercase no-underline transition-opacity duration-200 hover:opacity-60 max-[820px]:text-[10.5px] max-[540px]:text-[9.5px] max-[540px]:tracking-[0.16em]"
              >
                EXPLORE NEW IN
              </Link>
            </div>

            <div className="flex flex-col items-start text-left">
              <p className="m-0 text-[10.5px] leading-[1.45] font-bold tracking-[0.24em] text-[#0d0d0f] uppercase max-[540px]:text-[9px] max-[540px]:tracking-[0.18em]">
                NEW
              </p>
              <p className="m-0 text-[10.5px] leading-[1.45] font-bold tracking-[0.24em] text-[#0d0d0f] uppercase max-[540px]:text-[9px] max-[540px]:tracking-[0.18em]">
                COLLECTION
              </p>
              <p className="mt-px mb-0 text-[10.5px] font-bold tracking-[0.32em] text-[#0d0d0f] max-[540px]:text-[9px] max-[540px]:tracking-[0.24em]">
                2 0 2 6
              </p>
              <span
                className="mt-2 block h-[1.5px] w-7 bg-[#0d0d0f] max-[540px]:mt-[6px] max-[540px]:w-[22px]"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION - BLACK LUXURY EDITORIAL */}
      <section
        id="categories"
        className="m-0 box-border w-full bg-[#0d0d0f] px-[clamp(20px,4vw,64px)] py-[clamp(20px,2.5vw,32px)] max-[960px]:px-[18px] max-[960px]:pt-[18px] max-[960px]:pb-[22px] max-[580px]:px-3 max-[580px]:pt-[14px] max-[580px]:pb-[18px]"
      >
        <div className="mx-auto box-border w-full max-w-[1440px]">
          <div className="grid w-full grid-cols-4 gap-[clamp(8px,1.2vw,14px)] max-[960px]:grid-cols-2 max-[960px]:gap-3 max-[580px]:grid-cols-1 max-[580px]:gap-[10px]">
            {FEATURED_CATEGORIES.map((cat, idx) => (
              <Link
                key={cat.id}
                to={`/shop?category=${encodeURIComponent(cat.slug)}`}
                className="group box-border flex min-h-[140px] flex-col justify-between rounded-[2px] border border-[#232328] bg-[#141417] px-[clamp(12px,1.2vw,16px)] py-[clamp(12px,1.4vw,18px)] no-underline shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-200 hover:-translate-y-[3px] hover:border-white hover:bg-[#1c1c21] hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)]"
              >
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="font-[Arial,sans-serif] text-[17px] leading-none font-bold tracking-[-0.02em] text-[#555760] transition-colors duration-200 group-hover:text-[#8b8e96]">
                    0{idx + 1}
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.16em] text-[#a0a2aa] uppercase">
                    {cat.badge}
                  </span>
                </div>

                <div>
                  <h3 className="m-0 mb-[6px] text-[13.5px] leading-[1.3] font-bold tracking-[0.05em] text-white uppercase">
                    {cat.name}
                  </h3>
                  <p className="m-0 mb-[14px] text-[11.5px] leading-[1.5] text-[#8e9098]">
                    {cat.desc}
                  </p>
                </div>

                <div className="border-t border-[#232328] pt-[10px]">
                  <span className="inline-flex items-center border-b-[1.5px] border-transparent pb-[2px] text-[10px] font-bold tracking-[0.12em] text-white uppercase transition-colors duration-200 group-hover:border-b-white">
                    Explore Formulations &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BEST SELLERS SECTION */}
      <section
        id="bestsellers"
        className="relative m-0 box-border w-full max-w-full border-b border-[#ebebef] bg-white px-[clamp(20px,4.5vw,64px)] py-[clamp(38px,4.8vw,68px)] max-[1023px]:px-5 max-[1023px]:pt-8 max-[1023px]:pb-11 max-[600px]:px-4 max-[600px]:pt-6 max-[600px]:pb-8"
      >
        <div className="mx-auto mb-[clamp(20px,3.2vw,36px)] flex max-w-[1200px] items-end justify-between gap-5 max-[600px]:mb-5 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-[10px]">
          <div>
            <p className="m-0 mb-[5px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[8.5px] font-bold tracking-[0.26em] text-[#8b8e96] uppercase">
              THE ESSENTIAL FORMULATIONS
            </p>
            <h2 className="m-0 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[13.5px] leading-[1.2] font-semibold tracking-[0.28em] text-[#121214] uppercase">
              BEST OF GYMKHANA
            </h2>
          </div>
          <Link
            to="/shop"
            className="border-b-[1.5px] border-[#121214] pb-[2px] text-[10px] font-semibold tracking-[0.16em] whitespace-nowrap text-[#121214] uppercase no-underline transition-opacity duration-200 hover:opacity-65"
          >
            View All Products &rarr;
          </Link>
        </div>

        {loading && (
          <p className="p-10 text-center text-[#8b8e96]">
            Loading best seller formulations...
          </p>
        )}
        {error && (
          <p className="p-10 text-center text-[#c94a3e]">{error}</p>
        )}
        {salesError && (
          <p className="p-10 text-center text-[#c94a3e]">{salesError}</p>
        )}

        {!loading && !error && (
          <div className="mx-auto grid w-full max-w-[1200px] grid-cols-4 items-stretch gap-[clamp(14px,1.8vw,24px)] max-[1023px]:max-w-[580px] max-[1023px]:grid-cols-2 max-[1023px]:gap-4 max-[600px]:max-w-full max-[600px]:gap-3">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showBadge={false}
                variant="imageOnly"
                compact
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. ABOUT PREVIEW SECTION */}
      <section id="about-preview" className="w-full">
        <AboutSection isStandalone={false} />
      </section>

      {/* 5. CONTACT & EDITORIAL STUDIO FOOTER */}
      <StudioContact />
    </main>
  );
}
