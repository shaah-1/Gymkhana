import { Link } from "react-router-dom";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
import "./About.css";

export function AboutSection({ isStandalone = false }) {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        {/* Top Centered Section Header */}
        <header className="about-header">
          <h2 className="about-title">Our Story</h2>
          <p className="about-subtitle">
            Welcome to Fewer, Better Things
          </p>
        </header>

        {/* 2-Column Editorial Story Block */}
        <div className="about-grid">
          {/* Left Column: Narrative */}
          <div className="about-text-col">
            <h3 className="about-heading">Train with purpose.</h3>
            <p className="about-description">
              Progress is not defined by where you begin, but by the commitment you bring to every step forward.
                                At GYMKHANA, every formulation is part of a bigger journey — one built on ambition, resilience, and the relentless pursuit of personal excellence.
            </p>

            {isStandalone ? (
              <>
                {/* <p className="about-description">
                  Progress is not defined by where you begin, but by the commitment you bring to every step forward.
                </p>
                <p className="about-description">
                  We believe in the power of small improvements, the discipline of showing up, and the confidence that comes from knowing you gave your best.
                </p> */}
                <p className="about-description">
                  At GYMKHANA, every formulation is part of a bigger journey — one built on ambition, resilience, and the relentless pursuit of personal excellence.
                </p>
                <blockquote className="about-quote">
                  &ldquo;Every formula, every choice, every day. Progress is earned through the discipline to keep moving forward.&rdquo;
                </blockquote>
              </>
            ) : (
              <div className="about-story-links">
                <Link to="/shop" className="about-story-link">
                  Explore The Collection &rarr;
                </Link>
                <Link to="/about" className="about-story-more">
                  Read Full Brand Story &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Editorial Photograph */}
          <div className="about-image-col">
            <div className="about-image-wrapper">
              <img
                src={publicAssetUrl("/images/about-story.jpg")}
                alt="Our Story — A Foundation of Fewer"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Extended Standalone Sections: Values & Philosophy */}
        {isStandalone && (
          <>
            {/* 1. CORE VALUES */}
            <section className="about-pillars-section">
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

            {/* 2. BRAND PHILOSOPHY */}
            <section className="about-philosophy-section">
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
          </>
        )}
      </div>
    </section>
  );
}

export default function About() {
  return (
    <main className="about-page">
      <nav className="about-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span>About</span>
      </nav>

      <AboutSection isStandalone={true} />
    </main>
  );
}
