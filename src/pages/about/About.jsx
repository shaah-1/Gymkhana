import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicAssetUrl } from "../../utils/publicAssetUrl";

const BUILT_DISCIPLINE_SLIDES = [
  {
    src: "/images/about-runner-bg.jpg",
    alt: "GYMKHANA — Athletic Movement and Formulation",
    label: "Runner in Mist",
  },
  {
    src: "/images/built-discipline-boxer.jpg",
    alt: "GYMKHANA — Heavy Bag Combat Training and Discipline",
    label: "Boxer Training",
  },
  {
    src: "/images/built-discipline-gym.jpg",
    alt: "GYMKHANA — Iron Strength Standard and Gym Training",
    label: "Olympic Gym Barbell",
  },
];

const pillarCardClass =
  "flex flex-col rounded-none border border-[#dcdbd8] bg-white p-[clamp(20px,2.5vw,28px)] shadow-[0_4px_16px_rgba(0,0,0,0.03)]";
const pillarNumClass =
  "mb-3 font-[Arial,sans-serif] text-[26px] font-bold tracking-[-0.02em] text-[#8b8e96] tabular-nums";
const pillarNameClass =
  "m-0 mb-[10px] text-[15px] font-semibold tracking-[0.08em] text-[#121214] uppercase";
const pillarDescClass = "m-0 text-sm leading-[1.75] text-[#55575e]";

export function AboutSection({ isStandalone = false }) {
  const navigate = useNavigate();
  // Clean 1:1 Indexing: 0 = Slide 1, 1 = Slide 2, 2 = Slide 3
  const [slideIndex, setSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Swipe / Drag tracking
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);
  const isDraggingRef = useRef(false);
  const wasDraggedRef = useRef(false);

  // Slide when cursor is on the banner (and for touch devices)
  useEffect(() => {
    if (isStandalone) return;
    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(hover: none)").matches;

    // Only slide if cursor is on the banner (or on touch screens without hover)
    if (!isHovered && !isTouch) return;

    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % BUILT_DISCIPLINE_SLIDES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isStandalone, isHovered]);

  const handleDotClick = (idx, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSlideIndex(idx);
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
      setSlideIndex((prev) => (prev + 1) % BUILT_DISCIPLINE_SLIDES.length);
    } else if (distance < -40) {
      setSlideIndex(
        (prev) => (prev - 1 + BUILT_DISCIPLINE_SLIDES.length) % BUILT_DISCIPLINE_SLIDES.length
      );
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("[data-slider-dots]")) return;
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

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const distance = touchStartXRef.current - touchEndXRef.current;
      if (Math.abs(distance) > 40) {
        if (distance > 0) {
          setSlideIndex((prev) => (prev + 1) % BUILT_DISCIPLINE_SLIDES.length);
        } else {
          setSlideIndex(
            (prev) => (prev - 1 + BUILT_DISCIPLINE_SLIDES.length) % BUILT_DISCIPLINE_SLIDES.length
          );
        }
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleFrameClick = (e) => {
    // If user clicked the slide lines or dragged, do not navigate
    if (e.target.closest("[data-slider-dots]") || wasDraggedRef.current) {
      return;
    }
    navigate("/about");
  };

  if (!isStandalone) {
    return (
      <section
        id="about"
        className="relative box-border w-full border-t border-[#ebebef] bg-white pt-[clamp(56px,7vw,96px)] pb-[clamp(64px,8vw,108px)] text-[#121214] max-[600px]:pt-12"
      >
        {/* Top 2-Column Manifesto Row */}
        <div className="mx-auto box-border w-full max-w-[1440px] px-[clamp(24px,5vw,72px)]">
          <div className="mb-[clamp(48px,6vw,84px)] grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-start gap-[clamp(40px,6vw,100px)] max-[960px]:mb-10 max-[960px]:grid-cols-1 max-[960px]:gap-8">
            {/* Left Column: Bold Architectural Headline */}
            <div className="flex flex-col">
              <p className="m-0 mb-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[10px] font-bold tracking-[0.32em] text-[#8b8e96] uppercase">
                OUR PHILOSOPHY
              </p>
              <h2 className="m-0 font-['Avenir_Next',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[clamp(28px,3.6vw,50px)] leading-[1.14] font-bold tracking-[-0.015em] text-[#121214] uppercase max-[600px]:text-[clamp(23px,6.8vw,32px)] max-[600px]:leading-[1.18]">
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
            <div className="flex flex-col pt-[6px] max-[960px]:pt-0">
              <p className="m-0 mb-7 max-w-[480px] font-['Avenir_Next',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[clamp(12.5px,1.05vw,14px)] leading-[1.74] font-normal text-[#3b3d43] max-[960px]:max-w-full max-[600px]:mb-5 max-[600px]:text-[13px] max-[600px]:leading-[1.65]">
                Through minimalist values and relentless attention to detail,
                GYMKHANA offers bioavailable nutritional solutions in a system of
                purposeful formulations. Technical design at its core is an expression
                of purpose. Founded on the philosophy of fewer, better things &mdash;
                which continues to drive material purity and uncompromising athletic
                performance.
              </p>
              <div className="flex flex-wrap items-center gap-6 max-[600px]:gap-4">
                <Link
                  to="/about"
                  className="rounded-none border-b-[1.5px] border-[#121214] pb-[2px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[11px] font-semibold tracking-[0.18em] text-[#121214] uppercase no-underline transition-opacity duration-200 hover:opacity-65"
                >
                  READ OUR PHILOSOPHY &rarr;
                </Link>
                <Link
                  to="/shop"
                  className="rounded-none font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[11px] font-medium tracking-[0.16em] text-[#71747d] uppercase no-underline transition-colors duration-200 hover:text-[#121214]"
                >
                  EXPLORE THE COLLECTION &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Framed Hero Architectural Image Slider with 3 Interactive Slide Lines */}
          <div
            className="group relative block aspect-video max-h-[640px] w-full cursor-grab touch-pan-y pinch-zoom overflow-hidden rounded-none bg-[#121214] no-underline select-none active:cursor-grabbing max-[960px]:aspect-[16/10] max-[960px]:max-h-[520px] max-[600px]:aspect-[4/3] max-[600px]:max-h-[380px]"
            role="region"
            aria-label="Gymkhana Built Discipline Slideshow"
            onClick={handleFrameClick}
            onMouseEnter={() => {
              setIsHovered(true);
              setSlideIndex((prev) => (prev + 1) % BUILT_DISCIPLINE_SLIDES.length);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
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
              className="flex h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
              style={{ transform: `translateX(-${slideIndex * 100}%)` }}
            >
              {BUILT_DISCIPLINE_SLIDES.map((slide, idx) => (
                <div
                  key={slide.src}
                  className="relative h-full w-full flex-[0_0_100%] overflow-hidden"
                >
                  <img
                    src={publicAssetUrl(slide.src)}
                    alt={slide.alt}
                    className="pointer-events-none block h-full w-full rounded-none object-cover object-center transition-transform duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                    loading={idx === 0 ? "eager" : "lazy"}
                    draggable="false"
                  />
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-0 z-[2] box-border flex flex-col items-center justify-center bg-[linear-gradient(to_bottom,rgba(18,18,20,0.22)_0%,rgba(18,18,20,0.36)_50%,rgba(18,18,20,0.52)_100%)] p-[clamp(20px,4vw,48px)] text-center">
              <h3 className="m-0 font-['Avenir_Next',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[clamp(32px,5.8vw,76px)] leading-[1.02] font-extrabold tracking-[-0.015em] text-white uppercase [text-shadow:0_4px_28px_rgba(0,0,0,0.55),0_1px_4px_rgba(0,0,0,0.7)] select-none max-[600px]:text-[clamp(24px,7vw,36px)] max-[600px]:tracking-[-0.01em]">
                BUILT DISCIPLINE
              </h3>
            </div>

            {/* Below Slide Lines - Click Any of the 3 to Instantly Slide */}
            <div
              data-slider-dots="true"
              className="pointer-events-auto absolute bottom-[clamp(18px,2.8vw,32px)] left-1/2 z-[10] flex -translate-x-1/2 items-center gap-3"
              aria-label="Slide indicators"
            >
              {BUILT_DISCIPLINE_SLIDES.map((slide, idx) => {
                const isActive = slideIndex === idx;
                return (
                  <button
                    key={slide.src}
                    type="button"
                    className={`relative flex h-[26px] w-9 cursor-pointer items-center justify-center rounded-none border-0 bg-transparent p-0 outline-none after:block after:w-full after:transition-all after:duration-200 after:content-[''] ${
                      isActive
                        ? "after:h-1 after:bg-white after:shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        : "after:h-[3px] after:bg-white/42 hover:after:h-1 hover:after:bg-white/95"
                    }`}
                    onClick={(e) => handleDotClick(idx, e)}
                    aria-label={`Slide to ${slide.label}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="about"
      className="relative w-full scroll-mt-[85px] border-0 bg-[#e6e5e3] text-[#121214]"
    >
      {/* Editorial 2-Row Mockup Hero */}
      <div className="relative box-border w-full border-0 bg-[#e6e5e3] pt-[clamp(36px,4.5vw,60px)] pb-[clamp(24px,3vw,36px)] text-[#121214] max-[600px]:pt-9 max-[600px]:pb-5">
        <div className="mx-auto box-border flex w-full max-w-[1440px] flex-col gap-[clamp(44px,5.5vw,76px)] px-[clamp(24px,5vw,72px)] max-[600px]:gap-12 max-[600px]:px-4">
          {/* ROW 1: ABOUT US / 001 */}
          <div className="box-border grid w-full grid-cols-[1fr_1.28fr] items-center gap-[clamp(32px,5vw,68px)] max-[960px]:grid-cols-1 max-[960px]:gap-8">
            {/* Left Column: Narrative */}
            <div>
              <div className="mb-[clamp(14px,2vw,24px)] flex items-center gap-2">
                <span className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[11px] font-bold tracking-[0.22em] text-[#4a4d55] uppercase">
                  ABOUT US
                </span>
                <span className="text-[11px] font-light text-[#8b8e96]">/</span>
                <span className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[11px] font-bold tracking-[0.16em] text-[#4a4d55]">
                  001
                </span>
                <span
                  className="ml-[6px] inline-block h-px w-[clamp(36px,5vw,64px)] bg-[#a4a6ad]"
                  aria-hidden="true"
                />
              </div>

              <h1 className="m-0 mb-[clamp(16px,2vw,24px)] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[clamp(38px,5.2vw,68px)] leading-[1.05] font-bold tracking-[-0.03em] text-[#121214] max-[600px]:text-[clamp(30px,8.5vw,42px)]">
                More than
                <br />
                nutrition.
              </h1>

              <p className="m-0 mb-[clamp(24px,3vw,36px)] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[clamp(13.5px,1.15vw,15px)] leading-[1.65] text-[#55575e]">
                A commitment to strength, discipline,
                <br />
                and becoming better every day.
              </p>

              <div className="inline-flex items-center gap-3">
                <span className="inline-block h-[18px] w-[2px] bg-[#121214]" aria-hidden="true" />
                <a
                  href="#philosophy"
                  className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[11px] font-bold tracking-[0.22em] text-[#121214] uppercase no-underline transition-opacity duration-150 hover:opacity-65"
                >
                  OUR PHILOSOPHY
                </a>
              </div>
            </div>

            {/* Right Column: Runner Image */}
            <div>
              <div className="group aspect-video w-full overflow-hidden rounded-none bg-[#121214] leading-none shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <img
                  src={publicAssetUrl("/images/about-runner-bg.jpg")}
                  alt="GYMKHANA — More than nutrition, athletic movement"
                  className="block h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* ROW 2: OUR STORY / 002 */}
          <div className="box-border grid w-full grid-cols-[1fr_1.28fr] items-center gap-[clamp(32px,5vw,68px)] max-[960px]:grid-cols-1 max-[960px]:gap-8">
            {/* Left Column: Fighter Victory Photo */}
            <div className="max-[960px]:order-2">
              <div className="group aspect-video w-full overflow-hidden rounded-none bg-[#121214] leading-none shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <img
                  src={publicAssetUrl("/images/about-fighter.jpg")}
                  alt="GYMKHANA — Built for those who refuse to settle"
                  className="block h-full w-full object-cover [object-position:center_25%] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Column: Narrative + Brand Stamp */}
            <div className="grid h-full grid-cols-[1fr_auto] items-center gap-[clamp(24px,4vw,56px)] max-[960px]:order-1 max-[960px]:grid-cols-1 max-[960px]:gap-8">
              <div>
                <div className="mb-[clamp(14px,2vw,24px)] flex items-center gap-2">
                  <span className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[11px] font-bold tracking-[0.22em] text-[#4a4d55] uppercase">
                    OUR STORY
                  </span>
                  <span className="text-[11px] font-light text-[#8b8e96]">/</span>
                  <span className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[11px] font-bold tracking-[0.16em] text-[#4a4d55]">
                    002
                  </span>
                  <span
                    className="ml-[6px] inline-block h-px w-[clamp(36px,5vw,64px)] bg-[#a4a6ad]"
                    aria-hidden="true"
                  />
                </div>

                <h2 className="m-0 mb-[clamp(16px,2vw,24px)] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[clamp(28px,3.8vw,48px)] leading-[1.12] font-bold tracking-[-0.025em] text-[#121214] max-[600px]:text-[clamp(24px,6.8vw,32px)]">
                  Built for those
                  <br />
                  who refuse to settle.
                </h2>

                <p className="m-0 mb-[clamp(24px,3vw,36px)] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[clamp(13.5px,1.15vw,15px)] leading-[1.65] text-[#55575e]">
                  GYMKHANA is a lifestyle brand for the driven &mdash;
                  <br />
                  crafted for progress, performance and a stronger you.
                </p>

                <div className="inline-block">
                  <a
                    href="#values"
                    className="border-b-[1.5px] border-[#121214] pb-[3px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[11px] font-bold tracking-[0.22em] text-[#121214] uppercase no-underline transition-opacity duration-150 hover:opacity-65"
                  >
                    LEARN MORE
                  </a>
                </div>
              </div>

              {/* Vertical Brand Badge on Far Right */}
              <div className="flex h-full items-center border-l border-[#c8c7c3] pl-[clamp(20px,2.5vw,36px)] max-[960px]:h-auto max-[960px]:border-t max-[960px]:border-l-0 max-[960px]:pt-5 max-[960px]:pl-0">
                <div className="flex min-h-[120px] flex-col justify-between max-[960px]:min-h-0 max-[960px]:w-full max-[960px]:flex-row max-[960px]:items-baseline max-[960px]:justify-between">
                  <p className="m-0 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[9.5px] leading-[1.55] font-bold tracking-[0.22em] text-[#4a4d55] uppercase">
                    EST. FOR
                    <br />
                    PERFORMANCE
                  </p>
                  <p className="m-0 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-xs font-extrabold tracking-[0.18em] text-[#121214] uppercase">
                    GYMKHANA&reg;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECOND PAGE: Values, Philosophy & CTA */}
      <div className="mx-auto box-border w-full max-w-[1240px] bg-transparent px-[clamp(24px,5vw,64px)] pt-[clamp(16px,2vw,24px)] pb-[clamp(48px,6vw,76px)] max-[820px]:px-5 max-[820px]:pt-11 max-[820px]:pb-[60px] max-[540px]:px-[18px] max-[540px]:pt-8 max-[540px]:pb-12">
        {/* Core Values Section */}
        <section
          id="values"
          className="mt-0 w-full border-t border-[#dcdbd8] pt-[clamp(36px,4.5vw,56px)] max-[540px]:mt-10 max-[540px]:pt-9"
        >
          <p className="mb-3 text-center text-[11px] font-semibold tracking-[0.22em] text-[#8b8e96] uppercase">
            OUR CORE VALUES
          </p>
          <h3 className="m-0 mb-3 text-center font-['DM_Sans',sans-serif] text-[clamp(30px,3.5vw,42px)] font-semibold text-[#121214] max-[540px]:text-2xl">
            The Standard We Uphold
          </h3>
          <p className="mx-auto mb-[clamp(40px,5vw,64px)] max-w-[580px] text-center text-[15px] leading-[1.6] text-[#71737d] max-[540px]:mb-7 max-[540px]:text-[13.5px]">
            Four principles guide everything we do at GYMKHANA, from the products we offer to the experience we create for every fitness enthusiast.
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[clamp(28px,4vw,48px)] max-[820px]:grid-cols-1 max-[820px]:gap-8">
            <div className={pillarCardClass}>
              <span className={pillarNumClass}>01</span>
              <h4 className={pillarNameClass}>QUALITY THAT MATTERS</h4>
              <p className={pillarDescClass}>
                We believe every fitness journey deserves quality products. From nutritional supplements to essential gym accessories, we focus on offering products that meet the needs of your training and everyday routine.
              </p>
            </div>

            <div className={pillarCardClass}>
              <span className={pillarNumClass}>02</span>
              <h4 className={pillarNameClass}>TRANSPARENCY IN EVERY CHOICE</h4>
              <p className={pillarDescClass}>
                Every product deserves clear and honest information. We make it easy to explore product details, ingredients, specifications, and pricing so you can make informed decisions with confidence.
              </p>
            </div>

            <div className={pillarCardClass}>
              <span className={pillarNumClass}>03</span>
              <h4 className={pillarNameClass}>BUILT AROUND YOUR GOALS</h4>
              <p className={pillarDescClass}>
                Every fitness journey is different. Whether you are building strength, improving endurance, or maintaining an active lifestyle, we bring together essentials that support your individual goals.
              </p>
            </div>

            <div className={pillarCardClass}>
              <span className={pillarNumClass}>04</span>
              <h4 className={pillarNameClass}>A BETTER EXPERIENCE, EVERY TIME</h4>
              <p className={pillarDescClass}>
                From discovering your next fitness essential to placing your order, we believe every interaction should be simple, reliable, and seamless. We are committed to making your shopping experience as effortless as your next workout is rewarding.
              </p>
            </div>
          </div>
        </section>

        {/* Brand Philosophy Section */}
        <section
          id="philosophy"
          className="mt-[clamp(40px,5vw,64px)] w-full border-t border-[#dcdbd8] pt-[clamp(32px,4vw,48px)] max-[540px]:mt-10 max-[540px]:pt-9"
        >
          <div className="mx-auto max-w-[720px] text-center">
            <p className="mb-3 text-center text-[11px] font-semibold tracking-[0.22em] text-[#8b8e96] uppercase">
              BRAND PHILOSOPHY
            </p>
            <h3 className="m-0 mb-6 font-['DM_Sans',sans-serif] text-[clamp(32px,4vw,46px)] font-semibold text-[#121214] max-[540px]:mb-4 max-[540px]:text-2xl">
              The Discipline of Restraint
            </h3>
            <p className="m-0 mb-5 text-base leading-[1.9] text-[#4a4d55] max-[540px]:text-[14.5px] max-[540px]:leading-[1.75]">
              Modern fitness marketing thrives on complexity, neon tubs, and artificial hype.
              We reject that paradigm entirely. True strength does not need exaggeration.
            </p>
            <p className="m-0 mb-5 text-base leading-[1.9] text-[#4a4d55] max-[540px]:text-[14.5px] max-[540px]:leading-[1.75]">
              Our philosophy is rooted in intentional reduction: removing everything superfluous
              until only what actively supports muscular recovery, mental clarity, and long-term
              vitality remains. Fewer products, engineered to standard-setting perfection.
            </p>
            <blockquote className="mt-6 mb-0 border-l-2 border-[#121214] pl-[18px] font-['Cormorant_Garamond',Georgia,serif] text-xl leading-[1.5] text-[#121214] italic max-[540px]:mt-[18px] max-[540px]:pl-[14px] max-[540px]:text-[17px]">
              &ldquo;Every formula, every choice, every day. Progress is earned through the discipline to keep moving forward.&rdquo;
            </blockquote>
          </div>
        </section>

        {/* Call To Action Strip */}
        <div className="mt-[clamp(40px,5vw,64px)] flex w-full flex-col items-center border-t border-[#dcdbd8] pt-[clamp(28px,3.5vw,44px)] text-center max-[540px]:mt-10 max-[540px]:pt-8">
          <p className="m-0 mb-6 font-['Cormorant_Garamond',Georgia,serif] text-[clamp(26px,3vw,36px)] font-medium text-[#121214] italic max-[540px]:mb-[18px] max-[540px]:text-2xl">
            Experience the standard of fewer, better things.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-none bg-[#121214] px-8 py-[15px] text-[11.5px] font-semibold tracking-[0.22em] text-white uppercase no-underline transition-colors duration-150 hover:bg-[#2b2b30] max-[540px]:w-full max-[540px]:max-w-[280px] max-[540px]:px-5 max-[540px]:py-[13px]"
          >
            Explore the Collection &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <main data-about-page="true" className="box-border min-h-screen w-full bg-[#e6e5e3] text-[#121214]">
      <AboutSection isStandalone={true} />
    </main>
  );
}
