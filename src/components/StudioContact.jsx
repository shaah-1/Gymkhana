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
    <section
      id="contact"
      className="relative box-border w-full overflow-hidden bg-white text-[#121214]"
    >
      {/* 1. MINIMAL SECTION TITLE */}
      <div className="mx-auto box-border w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] pt-[clamp(56px,6.5vw,90px)] pb-[clamp(16px,2vw,24px)] text-left">
        <h2 className="m-0 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[clamp(14px,1.6vw,22px)] font-bold leading-[1.2] tracking-[0.22em] uppercase text-[#121214]">
          We&apos;d Love to
          <br />
          Hear From You
        </h2>
      </div>

      {/* 2. LOWER CONTACT FORM AREA */}
      <div className="relative box-border w-full overflow-hidden bg-white pb-[clamp(80px,9vw,130px)] max-[480px]:pb-12">
        <div className="relative z-[2] mx-auto box-border grid w-full max-w-[1440px] grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)] items-end gap-[clamp(40px,7vw,120px)] px-[clamp(24px,5vw,72px)] max-[960px]:grid-cols-1 max-[960px]:gap-10 max-[480px]:px-4 max-[360px]:px-3">
          {/* Left Column: Studio Micro-Copy */}
          <div className="flex flex-col justify-end">
            <span
              className="mb-[14px] block font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[14px] font-bold tracking-[0.15em] text-[#555861]"
              aria-hidden="true"
            >
              ---
            </span>
            <p className="m-0 max-w-[330px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[10px] font-bold leading-[1.75] tracking-[0.22em] uppercase text-[#4a4d55]">
              A DISCIPLINED COMMITMENT TO EXCELLENCE PERMEATES EVERY GYMKHANA FORMULATION.
              CRAFTED FOR ATHLETES COMMITTED TO VERIFIABLE PEAK BIOLOGICAL PERFORMANCE.
              CONNECT WITH OUR PRIVATE STUDIO FOR FORMULATION INQUIRIES AND ALLOCATIONS.
            </p>
          </div>

          {/* Right Column: High-Fashion Underline Form */}
          <div className="flex flex-col">
            {submitted ? (
              <div className="py-6" role="status">
                <p className="m-0 mb-2 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[12px] font-bold tracking-[0.2em] uppercase text-[#121214]">
                  MESSAGE RECEIVED
                </p>
                <p className="m-0 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[12px] leading-[1.6] text-[#4a4d55]">
                  Our private client advisory will respond to your inquiry shortly.
                </p>
              </div>
            ) : (
              <form
                className="flex w-full max-w-[500px] flex-col gap-[clamp(16px,2.2vw,22px)]"
                onSubmit={handleContactSubmit}
              >
                {/* YOUR NAME */}
                <div className="flex flex-col">
                  <label
                    htmlFor="studio-name"
                    className="mb-2 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-bold tracking-[0.22em] uppercase text-[#4a4d55]"
                  >
                    YOUR NAME
                  </label>
                  <input
                    id="studio-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="box-border w-full rounded-none border-0 border-b border-[#d4d4d8] bg-transparent py-[10px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[14px] text-[#121214] outline-none transition-colors duration-200 focus:border-b-[#121214]"
                    placeholder="Enter your name"
                  />
                </div>

                {/* YOUR EMAIL */}
                <div className="flex flex-col">
                  <label
                    htmlFor="studio-email"
                    className="mb-2 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-bold tracking-[0.22em] uppercase text-[#4a4d55]"
                  >
                    YOUR EMAIL
                  </label>
                  <input
                    id="studio-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="box-border w-full rounded-none border-0 border-b border-[#d4d4d8] bg-transparent py-[10px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[14px] text-[#121214] outline-none transition-colors duration-200 focus:border-b-[#121214]"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* MESSAGE */}
                <div className="flex flex-col">
                  <label
                    htmlFor="studio-message"
                    className="mb-2 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-bold tracking-[0.22em] uppercase text-[#4a4d55]"
                  >
                    MESSAGE
                  </label>
                  <textarea
                    id="studio-message"
                    required
                    rows="3"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="box-border min-h-[60px] w-full resize-y rounded-none border-0 border-b border-[#d4d4d8] bg-transparent py-[10px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[14px] text-[#121214] outline-none transition-colors duration-200 focus:border-b-[#121214]"
                    placeholder="How can our studio assist you?"
                  />
                </div>

                <div className="mt-[10px]">
                  <button
                    type="submit"
                    className="cursor-pointer rounded-none border border-[#121214] bg-[#121214] px-11 py-[14px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[10.5px] font-bold tracking-[0.22em] uppercase text-white transition-colors duration-200 hover:border-[#2a2a2e] hover:bg-[#2a2a2e]"
                  >
                    SUBMIT
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 3. BLACK LUXURY STUDIO FOOTER */}
      <footer className="box-border w-full bg-[#121214] px-[clamp(24px,5vw,72px)] pt-[clamp(60px,8vw,110px)] pb-[clamp(40px,5vw,64px)] text-white max-[480px]:px-4 max-[480px]:pt-12 max-[480px]:pb-9 max-[360px]:px-3 max-[360px]:pt-10 max-[360px]:pb-[30px]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] items-start gap-[clamp(48px,8vw,120px)] max-[960px]:grid-cols-1 max-[960px]:gap-12">
          {/* Newsletter Column */}
          <div className="flex flex-col">
            <h3 className="m-0 mb-[10px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-white">
              JOIN OUR NEWSLETTER
            </h3>
            <p className="m-0 mb-6 max-w-[320px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-medium leading-[1.7] tracking-[0.16em] uppercase text-[#8b8e96]">
              FOR QUIET UPDATES ON NEW ARRIVALS, EDITORIAL STORIES, AND SEASONAL HIGHLIGHTS.
            </p>

            {subscribed ? (
              <p className="m-0 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[10px] font-bold tracking-[0.18em] uppercase text-[#16a34a]">
                YOU ARE ON THE PRIVATE LIST.
              </p>
            ) : (
              <form
                className="flex max-w-[360px] border-b border-[#333338]"
                onSubmit={handleNewsletterSubmit}
              >
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="SIGN UP WITH YOUR EMAIL"
                  className="flex-1 rounded-none border-0 bg-transparent py-[10px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[10px] tracking-[0.14em] text-white outline-none placeholder:text-[#555861]"
                />
                <button
                  type="submit"
                  className="cursor-pointer border-0 bg-transparent py-[10px] pl-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-bold tracking-[0.2em] uppercase text-white transition-colors duration-200 hover:text-[#dc2626]"
                >
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>

          {/* Navigation Links Columns */}
          <div className="grid grid-cols-3 gap-[clamp(24px,4vw,56px)] max-[960px]:grid-cols-2 max-[680px]:grid-cols-1 max-[680px]:gap-7">
            <div className="flex flex-col">
              <h4 className="m-0 mb-[18px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[10px] font-bold tracking-[0.22em] uppercase text-white">
                CUSTOMER CARE
              </h4>
              <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
                <li>
                  <Link
                    to="/contact"
                    className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-semibold tracking-[0.16em] uppercase text-[#8b8e96] no-underline transition-colors duration-200 hover:text-white"
                  >
                    SHIPPING &amp; RETURNS
                  </Link>
                </li>
                <li>
                  <Link
                    to="/orders"
                    className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-semibold tracking-[0.16em] uppercase text-[#8b8e96] no-underline transition-colors duration-200 hover:text-white"
                  >
                    ORDER TRACKING
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-semibold tracking-[0.16em] uppercase text-[#8b8e96] no-underline transition-colors duration-200 hover:text-white"
                  >
                    SIZE GUIDE
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-semibold tracking-[0.16em] uppercase text-[#8b8e96] no-underline transition-colors duration-200 hover:text-white"
                  >
                    ABOUT US
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col">
              <h4 className="m-0 mb-[18px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[10px] font-bold tracking-[0.22em] uppercase text-white">
                SHOP
              </h4>
              <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
                <li>
                  <Link
                    to="/shop"
                    className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-semibold tracking-[0.16em] uppercase text-[#8b8e96] no-underline transition-colors duration-200 hover:text-white"
                  >
                    NEW ARRIVALS
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-semibold tracking-[0.16em] uppercase text-[#8b8e96] no-underline transition-colors duration-200 hover:text-white"
                  >
                    BEST SELLERS
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-semibold tracking-[0.16em] uppercase text-[#8b8e96] no-underline transition-colors duration-200 hover:text-white"
                  >
                    ALL COLLECTIONS
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col">
              <h4 className="m-0 mb-[18px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[10px] font-bold tracking-[0.22em] uppercase text-white">
                CONTACT
              </h4>
              <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
                <li>
                  <a
                    href="mailto:hello@gymkhana.com"
                    className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-semibold tracking-[0.16em] uppercase text-[#8b8e96] no-underline transition-colors duration-200 hover:text-white"
                  >
                    EMAIL US
                  </a>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-semibold tracking-[0.16em] uppercase text-[#8b8e96] no-underline transition-colors duration-200 hover:text-white"
                  >
                    STORE LOCATIONS
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-semibold tracking-[0.16em] uppercase text-[#8b8e96] no-underline transition-colors duration-200 hover:text-white"
                  >
                    CLIENT SERVICES
                  </Link>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[9.5px] font-semibold tracking-[0.16em] uppercase text-[#8b8e96] no-underline transition-colors duration-200 hover:text-white"
                  >
                    SOCIAL MEDIAS
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Monumental Giant Brand Logo at Bottom */}
        <div className="mx-auto mt-[clamp(40px,5vw,64px)] flex max-w-[1440px] items-center gap-8 max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-5">
          <span className="select-none font-['Avenir_Next_Condensed','Impact',-apple-system,sans-serif] text-[clamp(64px,14vw,210px)] font-black leading-[0.85] tracking-[-0.02em] uppercase text-white max-[480px]:text-[clamp(38px,12vw,64px)] max-[480px]:tracking-[-0.01em] max-[480px]:break-words">
            GYMKHANA
          </span>
          <div
            className="flex shrink-0 items-center justify-center rounded-none border-[3px] border-white px-5 py-[14px] max-[680px]:self-start max-[480px]:px-[14px] max-[480px]:py-2"
            aria-hidden="true"
          >
            <div className="flex flex-col items-center leading-none">
              <span className="font-['Avenir_Next_Condensed','Impact',sans-serif] text-[24px] font-black tracking-[0.1em] text-white max-[480px]:text-[18px]">
                GYM
              </span>
              <span className="font-['Avenir_Next_Condensed','Impact',sans-serif] text-[22px] font-black tracking-[0.1em] text-white max-[480px]:text-[16px]">
                KHN
              </span>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
