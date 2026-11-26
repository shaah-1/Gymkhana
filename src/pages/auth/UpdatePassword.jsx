import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveRecoveredPassword } from "../../services/authService";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await saveRecoveredPassword(password);
      navigate("/login", {
        replace: true,
        state: { message: "Password updated. Please sign in with your new password." },
      });
    } catch (requestError) {
      setError(requestError.message || "Could not update your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="box-border flex min-h-dvh w-full flex-col items-center justify-center bg-white px-6 py-10">
      <section className="mx-auto flex w-full max-w-[420px] flex-col justify-center">
        <h1 className="m-0 mb-6 font-['Cormorant_Garamond',Georgia,serif] text-[clamp(36px,4.6vw,50px)] leading-[1.05] font-medium tracking-[-0.01em] text-[#121214] italic">
          Choose a new password
        </h1>
        {error && (
          <p
            className="mb-5 border-l-2 border-[#b91c1c] bg-[#fef2f2] px-3 py-2 text-[11.5px] text-[#b91c1c]"
            role="alert"
          >
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-5 flex flex-col">
            <label
              className="mb-[3px] text-[10px] font-semibold tracking-[0.18em] text-[#8b8e96] uppercase"
              htmlFor="new-password"
            >
              NEW PASSWORD
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-none border-0 border-b border-[#d5d7dc] bg-transparent py-[9px] font-inherit text-[14px] text-[#121214] outline-none transition-colors duration-200 focus:border-b-[#121214]"
            />
          </div>
          <div className="mb-5 flex flex-col">
            <label
              className="mb-[3px] text-[10px] font-semibold tracking-[0.18em] text-[#8b8e96] uppercase"
              htmlFor="confirm-password"
            >
              CONFIRM PASSWORD
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              required
              className="w-full rounded-none border-0 border-b border-[#d5d7dc] bg-transparent py-[9px] font-inherit text-[14px] text-[#121214] outline-none transition-colors duration-200 focus:border-b-[#121214]"
            />
          </div>
          <button
            type="submit"
            className="mt-[10px] w-full cursor-pointer rounded-none border-0 bg-[#121214] px-[18px] py-[15px] font-inherit text-[11.5px] font-light tracking-[0.22em] text-white uppercase transition-[background,opacity] duration-200 hover:not-disabled:bg-[#2a2a30] disabled:cursor-not-allowed disabled:opacity-65"
            disabled={loading}
          >
            {loading ? "UPDATING..." : "UPDATE PASSWORD"}
          </button>
        </form>
        <p className="mt-5 text-left text-xs text-[#55575e]">
          <Link
            to="/login"
            className="font-medium text-[#121214] underline underline-offset-[3px] transition-colors duration-150 hover:text-black"
          >
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
