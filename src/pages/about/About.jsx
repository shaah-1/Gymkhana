import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
import "./About.css";

const BUILT_DISCIPLINE_SLIDES = [
  {
    src: "/images/about-runner-bg.jpg",
    alt: "GYMKHANA — Athletic Movement and Formulation",
  },
  {
    src: "/images/built-discipline-boxer.jpg",
    alt: "GYMKHANA — Heavy Bag Combat Training and Discipline",
  },
  {
    src: "/images/built-discipline-gym.jpg",
    alt: "GYMKHANA — Iron Strength Standard and Gym Training",
  },
];

// 2-Way Infinite buffer: [last, first, second, third, first]
const EXTENDED_SLIDES = [
  BUILT_DISCIPLINE_SLIDES[2],
  BUILT_DISCIPLINE_SLIDES[0],
  BUILT_DISCIPLINE_SLIDES[1],
  BUILT_DISCIPLINE_SLIDES[2],
  BUILT_DISCIPLINE_SLIDES[0],
];

export function AboutSection({ isStandalone = false }) {
  // Start at index 1 (which is BUILT_DISCIPLINE_SLIDES[0])
  const [slideIndex, setSlideIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Swipe / Drag tracking
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);
  const isDraggingRef = useRef(false);
  const wasDraggedRef = useRef(false);

  // Auto-slide effect with faster, responsive cadence
  useEffect(() => {
    if (isStandalone || isPaused) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setSlideIndex((prev) => prev + 1);
    }, 3200);

    return () => clearInterval(interval);
  }, [isStandalone, isPaused]);

  // Seamless 2-way wrap-around
  const handleTransitionEnd = () => {
    if (slideIndex >= 4) {
      setIsTransitioning(false);
      setSlideIndex(1);
    } else if (slideIndex <= 0) {
      setIsTransitioning(false);
      setSlideIndex(3);
    }
  };

  const nextSlide = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsTransitioning(true);
    setSlideIndex((prev) => prev + 1);
  };

  const prevSlide = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsTransitioning(true);
    setSlideIndex((prev) => prev - 1);
  };

  const handleDotClick = (idx, e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTransitioning(true);
    setSlideIndex(idx + 1);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    touchEndXRef.current = null;
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 40) {
      nextSlide();
    } else if (distance < -40) {
      prevSlide();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only primary button
    isDraggingRef.current = true;
    wasDraggedRef.current = false;
    touchEndXRef.current = null;
    touchStartXRef.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    touchEndXRef.current = e.clientX;
    if (touchStartXRef.current !== null && Math.abs(e.clientX - touchStartXRef.current) > 10) {
      wasDraggedRef.current = true;
    }
  };

  const handleMouseUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const distance = touchStartXRef.current - touchEndXRef.current;
      if (Math.abs(distance) > 40) {
        e.preventDefault();
        e.stopPropagation();
        if (distance > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleLinkClick = (e) => {
    if (wasDraggedRef.current) {
      e.preventDefault();
      wasDraggedRef.current = false;
    }
  };

  // Active dot mapped from 5-item buffer to 3 indicators (0, 1, 2)
  const activeDotIndex =
    (slideIndex - 1 + BUILT_DISCIPLINE_SLIDES.length) % BUILT_DISCIPLINE_SLIDES.length;

  if (!isStandalone) {
    return (
      <section id="about" className="about-veilance-section">
        {/* Top 2-Column Manifesto Row */}
        <div className="about-veilance-container">
          <div className="about-veilance-manifesto-grid">
            {/* Left Column: Bold Architectural Headline */}
            <div className="about-veilance-left">
              <p className="about-veilance-eyebrow">OUR PHILOSOPHY</p>
              <h2 className="about-veilance-headline">
                GYMKHANA IS A SYSTEM
                <br />
                OF ESSENTIAL FORMULATIONS
                <br />
                DESIGNED FOR
                <br />
                NAVIGATING AND
                <br />
                ACHIEVING PEAK
                <br />
                ATHLETIC OUTPUT.
              </h2>
            </div>

            {/* Right Column: Refined Editorial Narrative & Action Links */}
            <div className="about-veilance-right">
              <p className="about-veilance-text">
                Through minimalist values and relentless attention to detail,
                GYMKHANA offers bioavailable nutritional solutions in a system of
                purposeful formulations. Technical design at its core is an expression
                of purpose. Founded on the philosophy of fewer, better things &mdash;
                which continues to drive material purity and uncompromising athletic
                performance.
              </p>
              <div className="about-veilance-actions">
                <Link to="/about" className="about-veilance-link-primary">
                  READ OUR PHILOSOPHY &rarr;
                </Link>
                <Link to="/shop" className="about-veilance-link-secondary">
                  EXPLORE THE COLLECTION &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Framed Hero Architectural Image Slider with Drag, Swipe & Navigation Arrows */}
          <Link
            to="/about"
            className="about-veilance-image-frame"
            aria-label="Learn more about Gymkhana"
            onClick={handleLinkClick}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
              setIsPaused(false);
              if (isDraggingRef.current) isDraggingRef.current = false;
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div
              className="about-veilance-slider-track"
              onTransitionEnd={handleTransitionEnd}
              style={{
                transform: `translateX(-${slideIndex * 100}%)`,
                transition: isTransitioning
                  ? "transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)"
                  : "none",
              }}
            >
              {EXTENDED_SLIDES.map((slide, idx) => (
                <div
                  key={`${slide.src}-${idx}`}
                  className="about-veilance-slide"
                >
                  <img
                    src={publicAssetUrl(slide.src)}
                    alt={slide.alt}
                    className="about-veilance-image"
                    loading={idx === 1 ? "eager" : "lazy"}
                    draggable="false"
                  />
                </div>
              ))}
            </div>

            <div className="about-veilance-image-overlay">
              <h3 className="about-veilance-image-title">BUILT DISCIPLINE</h3>
            </div>

            {/* Left & Right Interactive Navigation Arrows */}
            <button
              type="button"
              className="about-veilance-slider-arrow about-veilance-arrow-prev"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              className="about-veilance-slider-arrow about-veilance-arrow-next"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <ChevronRight size={20} strokeWidth={1.6} />
            </button>

            {/* Subtle Minimal Indicator Dots */}
            <div
              className="about-veilance-slider-dots"
              aria-label="Slide indicators"
            >
              {BUILT_DISCIPLINE_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`about-veilance-dot ${
                    activeDotIndex === idx ? "active" : ""
                  }`}
                  onClick={(e) => handleDotClick(idx, e)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="about-section">
      {/* Editorial 2-Row Mockup Hero Matching User Reference Screenshot Exactly */}
      <div className="about-mockup-section">
        <div className="about-mockup-container">
          {/* ROW 1: ABOUT US / 001 */}
          <div className="about-mockup-row about-mockup-row-top">
            {/* Left Column: Narrative */}
            <div className="about-mockup-text-col">
              <div className="about-mockup-eyebrow-row">
                <span className="about-mockup-eyebrow">ABOUT US</span>
                <span className="about-mockup-sep">/</span>
                <span className="about-mockup-num">001</span>
                <span className="about-mockup-line" aria-hidden="true" />
              </div>

              <h1 className="about-mockup-title">
                More than
                <br />
                nutrition.
              </h1>

              <p className="about-mockup-desc">
                A commitment to strength, discipline,
                <br />
                and becoming better every day.
              </p>

              <div className="about-mockup-action-bar">
                <span className="about-mockup-bar" aria-hidden="true" />
                <a href="#philosophy" className="about-mockup-link-bar">
                  OUR PHILOSOPHY
                </a>
              </div>
            </div>

            {/* Right Column: Runner Image Given By User */}
            <div className="about-mockup-img-col about-mockup-barbell-col">
              <div className="about-mockup-img-wrapper about-mockup-barbell-frame">
                <img
                  src={publicAssetUrl("/images/about-runner-bg.jpg")}
                  alt="GYMKHANA — More than nutrition, athletic movement"
                  className="about-mockup-img"
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* ROW 2: OUR STORY / 002 */}
          <div className="about-mockup-row about-mockup-row-bottom">
            {/* Left Column: Fighter Victory Photo Given By User */}
            <div className="about-mockup-img-col about-mockup-athlete-col">
              <div className="about-mockup-img-wrapper about-mockup-athlete-frame">
                <img
                  src={publicAssetUrl("/images/about-fighter.jpg")}
                  alt="GYMKHANA — Built for those who refuse to settle"
                  className="about-mockup-img"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Column: Narrative + Brand Stamp */}
            <div className="about-mockup-story-col">
              <div className="about-mockup-story-content">
                <div className="about-mockup-eyebrow-row">
                  <span className="about-mockup-eyebrow">OUR STORY</span>
                  <span className="about-mockup-sep">/</span>
                  <span className="about-mockup-num">002</span>
                  <span className="about-mockup-line" aria-hidden="true" />
                </div>

                <h2 className="about-mockup-subtitle">
                  Built for those
                  <br />
                  who refuse to settle.
                </h2>

                <p className="about-mockup-desc">
                  GYMKHANA is a lifestyle brand for the driven &mdash;
                  <br />
                  crafted for progress, performance and a stronger you.
                </p>

                <div className="about-mockup-action-underline">
                  <a href="#values" className="about-mockup-link-underline">
                    LEARN MORE
                  </a>
                </div>
              </div>

              {/* Vertical Brand Badge on Far Right */}
              <div className="about-mockup-badge">
                <div className="about-mockup-badge-inner">
                  <p className="about-mockup-badge-label">
                    EST. FOR
                    <br />
                    PERFORMANCE
                  </p>
                  <p className="about-mockup-badge-brand">
                    GYMKHANA&reg;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECOND PAGE: Values, Philosophy & CTA (Tightly connected, NO excess whitespace) */}
      <div className="about-container">
        {/* Core Values Section */}
        <section id="values" className="about-pillars-section">
          <p className="about-pillars-eyebrow">OUR CORE VALUES</p>
          <h3 className="about-pillars-title">The Standard We Uphold</h3>
          <p className="about-section-intro">
            Four principles guide everything we do at GYMKHANA, from the products we offer to the experience we create for every fitness enthusiast.
          </p>

          <div className="about-pillars-grid">
            <div className="about-pillar-card">
              <span className="about-pillar-num">01</span>
              <h4 className="about-pillar-name">QUALITY THAT MATTERS</h4>
              <p className="about-pillar-desc">
                We believe every fitness journey deserves quality products. From nutritional supplements to essential gym accessories, we focus on offering products that meet the needs of your training and everyday routine.
              </p>
            </div>

            <div className="about-pillar-card">
              <span className="about-pillar-num">02</span>
              <h4 className="about-pillar-name">TRANSPARENCY IN EVERY CHOICE</h4>
              <p className="about-pillar-desc">
                Every product deserves clear and honest information. We make it easy to explore product details, ingredients, specifications, and pricing so you can make informed decisions with confidence.
              </p>
            </div>

            <div className="about-pillar-card">
              <span className="about-pillar-num">03</span>
              <h4 className="about-pillar-name">BUILT AROUND YOUR GOALS</h4>
              <p className="about-pillar-desc">
                Every fitness journey is different. Whether you are building strength, improving endurance, or maintaining an active lifestyle, we bring together essentials that support your individual goals.
              </p>
            </div>

            <div className="about-pillar-card">
              <span className="about-pillar-num">04</span>
              <h4 className="about-pillar-name">A BETTER EXPERIENCE, EVERY TIME</h4>
              <p className="about-pillar-desc">
                From discovering your next fitness essential to placing your order, we believe every interaction should be simple, reliable, and seamless. We are committed to making your shopping experience as effortless as your next workout is rewarding.
              </p>
            </div>
          </div>
        </section>

        {/* Brand Philosophy Section */}
        <section id="philosophy" className="about-philosophy-section">
          <div className="about-philosophy-content">
            <p className="about-pillars-eyebrow">BRAND PHILOSOPHY</p>
            <h3 className="about-philosophy-title">The Discipline of Restraint</h3>
            <p className="about-philosophy-body">
              Modern fitness marketing thrives on complexity, neon tubs, and artificial hype.
              We reject that paradigm entirely. True strength does not need exaggeration.
            </p>
            <p className="about-philosophy-body">
              Our philosophy is rooted in intentional reduction: removing everything superfluous
              until only what actively supports muscular recovery, mental clarity, and long-term
              vitality remains. Fewer products, engineered to standard-setting perfection.
            </p>
            <blockquote className="about-quote">
              &ldquo;Every formula, every choice, every day. Progress is earned through the discipline to keep moving forward.&rdquo;
            </blockquote>
          </div>
        </section>

        {/* Call To Action Strip */}
        <div className="about-cta-strip">
          <p className="about-cta-title">
            Experience the standard of fewer, better things.
          </p>
          <Link to="/shop" className="about-cta-btn">
            Explore the Collection &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <main className="about-page">
      <AboutSection isStandalone={true} />
    </main>
  );
}
