import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { registerUser } from "../../services/authService";
import { publicAssetUrl } from "../../utils/publicAssetUrl";

export default function Register() {
  const navigate = useNavigate();

  const isAuth = useSelector((s) => s.auth.isAuthenticated);

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // If customer is already authenticated, redirect to home
  useEffect(() => {
    if (isAuth) {
      navigate("/", { replace: true });
    }
  }, [isAuth, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!name || !email || !password) {
      return setError("Please fill in all fields.");
    }

    if (name.length < 2) {
      return setError("Please enter your full name.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Please enter a valid email address.");
    }

    if (password.length < 8) {
      return setError("Password must contain at least 8 characters.");
    }

    setLoading(true);

    try {
      const result = await registerUser({ name, email, password });
      navigate(result.session ? "/" : "/login", {
        state: {
          message: result.session
            ? "Account created successfully."
            : "Account created. Check your email to confirm your account, then sign in.",
          registeredEmail: email,
        },
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-auth-screen="true"
      className="box-border flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-white max-[820px]:h-auto max-[820px]:max-h-none max-[820px]:min-h-dvh max-[820px]:overflow-y-auto [@media(max-height:720px)]:h-auto [@media(max-height:720px)]:max-h-none [@media(max-height:720px)]:min-h-dvh [@media(max-height:720px)]:overflow-y-auto"
    >
      {/* Top Header Bar across the screen */}
      <header className="relative box-border flex h-[var(--navbar-height,72px)] min-h-[var(--navbar-height,72px)] w-full shrink-0 items-center justify-between border-b border-[#f0f0f2] bg-white px-[clamp(24px,4vw,56px)] max-[768px]:h-[var(--navbar-height,64px)] max-[768px]:min-h-[var(--navbar-height,64px)] max-[768px]:px-5 max-[640px]:px-4 max-[440px]:px-3">
        <div className="z-[1] flex items-center gap-[18px]">
          <Link
            to="/"
            className="inline-flex cursor-pointer flex-col gap-1 border-0 bg-transparent p-1 no-underline"
            aria-label="Home"
            title="Home"
          >
            <span className="block h-[1.5px] w-[15px] bg-[#111113]" />
            <span className="block h-[1.5px] w-[15px] bg-[#111113]" />
          </Link>
        </div>

        <Link
          to="/"
          className="pointer-events-auto absolute top-1/2 left-1/2 z-[2] m-0 -translate-x-1/2 -translate-y-1/2 p-0 text-center font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-base font-light tracking-[0.28em] whitespace-nowrap text-[#111113] uppercase no-underline max-[640px]:text-sm max-[640px]:tracking-[0.22em] max-[440px]:text-[13px] max-[440px]:tracking-[0.18em]"
        >
          GYMKHANA
        </Link>

        <div className="z-[1] ml-auto flex items-center gap-6 max-[640px]:gap-[14px] max-[440px]:gap-0">
          <Link
            to="/login"
            className="text-[10.5px] font-light tracking-[0.18em] text-[#222225] uppercase no-underline transition-colors duration-150 hover:text-black max-[640px]:text-[9.5px] max-[640px]:tracking-[0.12em]"
          >
            LOG IN
          </Link>
          <span className="text-[10.5px] font-normal tracking-[0.18em] text-[#111113] uppercase no-underline max-[640px]:text-[9.5px] max-[640px]:tracking-[0.12em] max-[440px]:hidden">
            CREATE ACCOUNT
          </span>
        </div>
      </header>

      {/* Main Full-Screen Layout */}
      <main className="box-border flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-[clamp(24px,4vw,64px)] py-[clamp(8px,1.8vh,24px)] max-[820px]:overflow-y-visible max-[820px]:px-5 max-[820px]:py-6">
        <div className="mx-auto grid w-full max-w-[1120px] grid-cols-[1.08fr_1fr] items-center gap-[clamp(28px,4.5vw,68px)] max-[820px]:grid-cols-1 max-[820px]:gap-8">
          {/* Left Column: Framed Editorial Photo */}
          <section className="flex min-h-0 w-full items-center justify-center max-[820px]:hidden">
            <div className="box-border aspect-[3/4] max-h-[calc(100dvh-120px)] w-[min(100%,485px,calc((100dvh-120px)*0.75))] overflow-hidden border border-[#f0f0f2] bg-[#f4f4f6]">
              <img
                src={publicAssetUrl("/images/login-banner.jpg")}
                alt="GYMKHANA Training Space"
                className="block h-full w-full object-cover object-center"
              />
            </div>
          </section>

          {/* Right Column: Register Form */}
          <section className="mx-auto flex w-full max-w-[420px] flex-col justify-center">
            <h1 className="m-0 mb-[clamp(16px,2.5vh,26px)] font-['Cormorant_Garamond',Georgia,serif] text-[clamp(42px,4.6vw,54px)] leading-[1.05] font-medium tracking-[-0.01em] text-[#121214] italic max-[820px]:mb-[22px] max-[820px]:text-[clamp(36px,9vw,44px)]">
              Create account
            </h1>

            {error && (
              <p
                className="mb-5 border-l-2 border-[#b91c1c] bg-[#fef2f2] px-3 py-2 text-[11.5px] text-[#b91c1c]"
                role="alert"
              >
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* FULL NAME */}
              <div className="mb-[clamp(14px,2vh,22px)] flex flex-col">
                <label
                  htmlFor="register-name"
                  className="mb-[3px] text-[10px] font-semibold tracking-[0.18em] text-[#8b8e96] uppercase"
                >
                  FULL NAME
                </label>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !form.email.trim()) {
                      e.preventDefault();
                      emailInputRef.current?.focus();
                    }
                  }}
                  required
                  className="w-full rounded-none border-0 border-b border-[#d5d7dc] bg-transparent py-[9px] font-inherit text-[14px] text-[#121214] outline-none transition-colors duration-200 placeholder:font-light placeholder:text-[#b0b3ba] focus:border-b-[#121214]"
                />
              </div>

              {/* EMAIL */}
              <div className="mb-[clamp(14px,2vh,22px)] flex flex-col">
                <label
                  htmlFor="register-email"
                  className="mb-[3px] text-[10px] font-semibold tracking-[0.18em] text-[#8b8e96] uppercase"
                >
                  EMAIL
                </label>
                <input
                  ref={emailInputRef}
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !form.password) {
                      e.preventDefault();
                      passwordInputRef.current?.focus();
                    }
                  }}
                  required
                  className="w-full rounded-none border-0 border-b border-[#d5d7dc] bg-transparent py-[9px] font-inherit text-[14px] text-[#121214] outline-none transition-colors duration-200 placeholder:font-light placeholder:text-[#b0b3ba] focus:border-b-[#121214]"
                />
              </div>

              {/* PASSWORD */}
              <div className="mb-[clamp(14px,2vh,22px)] flex flex-col">
                <div className="mb-[3px] flex items-baseline justify-between">
                  <label
                    htmlFor="register-password"
                    className="text-[10px] font-semibold tracking-[0.18em] text-[#8b8e96] uppercase"
                  >
                    PASSWORD
                  </label>
                  <span className="text-[10.5px] font-normal tracking-[0.04em] text-[#8b8e96]">
                    Min. 8 characters
                  </span>
                </div>
                <div className="relative w-full">
                  <input
                    ref={passwordInputRef}
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-none border-0 border-b border-[#d5d7dc] bg-transparent py-[9px] pr-8 font-inherit text-[14px] text-[#121214] outline-none transition-colors duration-200 placeholder:font-light placeholder:text-[#b0b3ba] focus:border-b-[#121214]"
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-0 flex -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-1 text-[#8b8e96] transition-colors duration-150 hover:text-[#121214]"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="mt-[10px] w-full cursor-pointer rounded-none border-0 bg-[#121214] px-[18px] py-[15px] font-inherit text-[11.5px] font-light tracking-[0.22em] text-white uppercase transition-[background,opacity] duration-200 hover:not-disabled:bg-[#2a2a30] disabled:cursor-not-allowed disabled:opacity-65"
                disabled={loading}
              >
                {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              </button>

              {/* SIGN IN PROMPT */}
              <p className="mt-5 text-left text-xs text-[#55575e]">
                Already have an account?
                <Link
                  to="/login"
                  className="ml-1 font-medium text-[#121214] underline underline-offset-[3px] transition-colors duration-150 hover:text-black"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
