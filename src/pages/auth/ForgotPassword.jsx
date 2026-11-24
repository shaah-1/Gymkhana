import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordReset } from "../../services/authService";
import "./ForgotPassword.css";

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
    <main className="forgot-page">
      <form className="forgot-card" onSubmit={handleSubmit}>
        <p className="eyebrow">ACCOUNT RECOVERY</p>
        <h1>Forgot password?</h1>
        <p>Enter your registered email address to recover your GYMKHANA account.</p>

        <label htmlFor="reset-email">Email address</label>
        <input
          id="reset-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? "Sending..." : "Continue →"}</button>
        <Link to="/login">← Back to login</Link>
      </form>
    </main>
  );
}
