import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveRecoveredPassword } from "../../services/authService";
import "./Login.css";

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
    <main className="editorial-login-page">
      <section className="editorial-form-col">
        <h1 className="editorial-login-heading">Choose a new password</h1>
        {error && <p className="editorial-error-alert" role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="editorial-field-group">
            <label className="editorial-field-label" htmlFor="new-password">NEW PASSWORD</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="editorial-underline-input"
            />
          </div>
          <div className="editorial-field-group">
            <label className="editorial-field-label" htmlFor="confirm-password">CONFIRM PASSWORD</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              required
              className="editorial-underline-input"
            />
          </div>
          <button type="submit" className="editorial-signin-btn" disabled={loading}>
            {loading ? "UPDATING..." : "UPDATE PASSWORD"}
          </button>
        </form>
        <p className="editorial-signup-row"><Link to="/login">Back to sign in</Link></p>
      </section>
    </main>
  );
}
