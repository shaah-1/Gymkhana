import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import "./Contact.css";

const contactEmail = "hello@gymkhana.com";

export function ContactSection() {
  const [sent, setSent] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("scroll-revealed");
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        section.classList.add("scroll-revealed");
        observer.disconnect();
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Website enquiry from ${form.get("name")}`);
    const body = encodeURIComponent(
      `Name: ${form.get("name")}\nEmail: ${form.get("email")}\n\n${form.get("message")}`
    );
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <section ref={sectionRef} className="contact-page home-contact-section scroll-reveal" id="contact">
      <section className="contact-intro">
        <p className="contact-eyebrow">GYMKHANA NUTRITION · HERE TO HELP</p>
        <h1>Let’s talk about <span>your next move.</span></h1>
        <p className="contact-lede">
          Questions about an order, a product, or getting started? Send us a note
          and we’ll help you find the right direction.
        </p>
      </section>

      <section className="contact-layout" aria-label="Contact GYMKHANA">
        <div className="contact-details">
          <div className="contact-details-heading">
            <p className="contact-eyebrow">CONNECT WITH US</p>
            <h2>We’re easy to reach.</h2>
            <p>Choose the way that works best for you.</p>
          </div>

          <a className="contact-detail" href={`mailto:${contactEmail}`}>
            <span className="contact-icon"><Mail size={19} /></span>
            <span><small>Email</small><strong>{contactEmail}</strong></span>
            <ArrowUpRight className="contact-arrow" size={17} />
          </a>
          <div className="contact-detail">
            <span className="contact-icon"><Phone size={19} /></span>
            <span><small>Phone</small><strong>Phone support coming soon</strong></span>
          </div>
          <div className="contact-detail">
            <span className="contact-icon"><MapPin size={19} /></span>
            <span><small>Location</small><strong>India · Online support</strong></span>
          </div>

          <div className="contact-socials">
            <span>FOLLOW ALONG</span>
            <div>
              <a href="https://www.instagram.com/" aria-label="Instagram">ig</a>
              <a href="https://www.facebook.com/" aria-label="Facebook">f</a>
              <a href="https://www.youtube.com/" aria-label="YouTube">▶</a>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form-heading">
            <p className="contact-eyebrow">SEND A MESSAGE</p>
            <h2>How can we help?</h2>
            <p>Fill in the details and your email app will open with your message ready to send.</p>
          </div>

          <label htmlFor="contact-name">Your name</label>
          <input id="contact-name" name="name" type="text" placeholder="Alex Morgan" autoComplete="name" required />

          <label htmlFor="contact-email">Email address</label>
          <input id="contact-email" name="email" type="email" placeholder="alex@example.com" autoComplete="email" required />

          <label htmlFor="contact-message">Message</label>
          <textarea id="contact-message" name="message" rows="5" placeholder="Tell us what’s on your mind…" required />

          <button className="contact-submit" type="submit">
            <span>{sent ? "Open your email to send" : "Prepare message"}</span>
            <Send size={17} />
          </button>
          {sent && <p className="contact-form-note" role="status">Your email app should be ready with the message.</p>}
        </form>
      </section>
    </section>
  );
}

export default function Contact() {
  return <ContactSection />;
}
