import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordReset } from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setMessage("If an account exists for that email, a password reset link has been sent.");
    } catch (err) {
      setError(err.message || "Could not send the password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="box-border flex min-h-[calc(100vh-var(--navbar-height,72px))] items-center justify-center bg-white px-6 py-[clamp(32px,5vw,64px)] max-[480px]:min-h-[calc(100dvh-var(--navbar-height,64px))] max-[480px]:px-4 max-[480px]:py-6">
      <form
        className="box-border w-full max-w-[420px] rounded-none border border-[#ebebef] bg-white p-[clamp(32px,5vw,48px)] max-[480px]:px-[18px] max-[480px]:py-7"
        onSubmit={handleSubmit}
      >
        <p className="m-0 mb-[10px] text-[10.5px] font-semibold tracking-[0.22em] text-[#787a82] uppercase">
          ACCOUNT RECOVERY
        </p>
        <h1 className="m-0 mb-3 font-['Cormorant_Garamond',Georgia,serif] text-[clamp(32px,4.5vw,40px)] leading-[1.1] font-medium text-[#121214] italic max-[480px]:text-[28px]">
          Forgot password?
        </h1>
        <p className="m-0 mb-6 text-[13.5px] leading-[1.6] text-[#63656d] max-[480px]:mb-5 max-[480px]:text-[13px]">
          Enter your registered email address to recover your GYMKHANA account.
        </p>

        <label
          htmlFor="reset-email"
          className="mb-[6px] block text-[10px] font-semibold tracking-[0.18em] text-[#8b8e96] uppercase"
        >
          Email address
        </label>
        <input
          id="reset-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="box-border w-full rounded-none border-0 border-b border-[#d5d7dc] bg-transparent py-[10px] font-inherit text-[14.5px] text-[#121214] outline-none transition-colors duration-200 placeholder:text-[13.5px] placeholder:text-[#a6a8b0] focus:border-b-[#121214]"
        />

        {message && (
          <p
            className="mt-4 mb-0 border border-[#c7ddcc] bg-[#f4faf5] px-[14px] py-[10px] text-xs tracking-[0.02em] text-[#2e5936]"
            role="status"
          >
            {message}
          </p>
        )}
        {error && (
          <p
            className="mt-4 mb-0 border-l-2 border-[#b91c1c] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]"
            role="alert"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-7 mb-4 h-12 w-full cursor-pointer rounded-none border-0 bg-[#121214] px-5 text-[11px] font-semibold tracking-[0.22em] text-white uppercase transition-colors duration-200 hover:not-disabled:bg-[#2b2b30] disabled:cursor-not-allowed disabled:opacity-65 max-[480px]:mt-[22px] max-[480px]:mb-[14px] max-[480px]:h-11"
        >
          {loading ? "Sending..." : "Continue →"}
        </button>
        <Link
          to="/login"
          className="inline-block w-full text-center text-[11px] font-semibold tracking-[0.16em] text-[#7b7e86] uppercase no-underline transition-colors duration-150 hover:text-[#121214]"
        >
          ← Back to login
        </Link>
      </form>
    </main>
  );
}
