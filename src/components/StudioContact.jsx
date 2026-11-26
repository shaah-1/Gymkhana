import { useState } from "react";
import { Link } from "react-router-dom";
export default function StudioContact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", message: "" });
      setSubmitted(false);
    }, 4500);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail("");
      setSubscribed(false);
    }, 4500);
  };

  return (
    <section id="contact" className="studio-contact-section">
      {/* 1. MINIMAL SECTION TITLE */}
      <div className="studio-contact-header">
        <h2 className="studio-contact-title">
          We'd Love to
          <br />
          Hear From You
        </h2>
      </div>

      {/* 2. LOWER CONTACT FORM AREA */}
      <div className="studio-form-stage">
        <div className="studio-form-container">
          {/* Left Column: Studio Micro-Copy */}
          <div className="studio-info-col">
            <span className="studio-micro-dash" aria-hidden="true">---</span>
            <p className="studio-micro-copy">
              A DISCIPLINED COMMITMENT TO EXCELLENCE PERMEATES EVERY GYMKHANA FORMULATION.
              CRAFTED FOR ATHLETES COMMITTED TO VERIFIABLE PEAK BIOLOGICAL PERFORMANCE.
              CONNECT WITH OUR PRIVATE STUDIO FOR FORMULATION INQUIRIES AND ALLOCATIONS.
            </p>
          </div>

          {/* Right Column: High-Fashion Underline Form */}
          <div className="studio-input-col">
            {submitted ? (
              <div className="studio-success-msg" role="status">
                <p className="studio-success-title">MESSAGE RECEIVED</p>
                <p className="studio-success-desc">
                  Our private client advisory will respond to your inquiry shortly.
                </p>
              </div>
            ) : (
              <form className="studio-contact-form" onSubmit={handleContactSubmit}>
                {/* YOUR NAME */}
                <div className="studio-field-group">
                  <label htmlFor="studio-name" className="studio-field-label">
                    YOUR NAME
                  </label>
                  <input
                    id="studio-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="studio-underline-input"
                    placeholder="Enter your name"
                  />
                </div>

                {/* YOUR EMAIL */}
                <div className="studio-field-group">
                  <label htmlFor="studio-email" className="studio-field-label">
                    YOUR EMAIL
                  </label>
                  <input
                    id="studio-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="studio-underline-input"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* MESSAGE */}
                <div className="studio-field-group">
                  <label htmlFor="studio-message" className="studio-field-label">
                    MESSAGE
                  </label>
                  <textarea
                    id="studio-message"
                    required
                    rows="3"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="studio-underline-textarea"
                    placeholder="How can our studio assist you?"
                  />
                </div>

                <div className="studio-actions">
                  <button type="submit" className="studio-submit-btn">
                    SUBMIT
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 3. BLACK LUXURY STUDIO FOOTER */}
      <footer className="studio-black-footer">
        <div className="studio-footer-top">
          {/* Newsletter Column */}
          <div className="studio-footer-newsletter">
            <h3 className="studio-footer-heading">JOIN OUR NEWSLETTER</h3>
            <p className="studio-footer-sub">
              FOR QUIET UPDATES ON NEW ARRIVALS, EDITORIAL STORIES, AND SEASONAL HIGHLIGHTS.
            </p>

            {subscribed ? (
              <p className="studio-footer-success">YOU ARE ON THE PRIVATE LIST.</p>
            ) : (
              <form className="studio-footer-form" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="SIGN UP WITH YOUR EMAIL"
                  className="studio-footer-input"
                />
                <button type="submit" className="studio-footer-btn">
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>

          {/* Navigation Links Columns */}
          <div className="studio-footer-links-group">
            <div className="studio-footer-col">
              <h4 className="studio-footer-col-title">CUSTOMER CARE</h4>
              <ul className="studio-footer-list">
                <li><Link to="/contact">SHIPPING &amp; RETURNS</Link></li>
                <li><Link to="/orders">ORDER TRACKING</Link></li>
                <li><Link to="/shop">SIZE GUIDE</Link></li>
                <li><Link to="/about">ABOUT US</Link></li>
              </ul>
            </div>

            <div className="studio-footer-col">
              <h4 className="studio-footer-col-title">SHOP</h4>
              <ul className="studio-footer-list">
                <li><Link to="/shop">NEW ARRIVALS</Link></li>
                <li><Link to="/shop">BEST SELLERS</Link></li>
                <li><Link to="/shop">ALL COLLECTIONS</Link></li>
              </ul>
            </div>

            <div className="studio-footer-col">
              <h4 className="studio-footer-col-title">CONTACT</h4>
              <ul className="studio-footer-list">
                <li><a href="mailto:hello@gymkhana.com">EMAIL US</a></li>
                <li><Link to="/contact">STORE LOCATIONS</Link></li>
                <li><Link to="/contact">CLIENT SERVICES</Link></li>
                <li><a href="https://instagram.com" target="_blank" rel="noreferrer">SOCIAL MEDIAS</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Monumental Giant Brand Logo at Bottom */}
        <div className="studio-footer-monument">
          <span className="studio-monument-brand">GYMKHANA</span>
          <div className="studio-monument-badge" aria-hidden="true">
            <div className="studio-badge-box">
              <span className="studio-badge-symbol">GYM</span>
              <span className="studio-badge-sub">KHN</span>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
