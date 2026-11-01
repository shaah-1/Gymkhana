import { useState } from "react";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("Password reset functionality will be connected soon.");
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
        <button type="submit">Continue →</button>
        <Link to="/login">← Back to login</Link>
      </form>
    </main>
  );
}
