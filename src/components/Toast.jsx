import { useEffect } from "react";
import "./Toast.css";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;f

    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="login-success-popup" role="status">
<span className="success-icon" aria-hidden="true">
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
</span>
      <div>
        <strong>{message}</strong>
        <p>Thank you for being part of GYMKHANA.</p>
      </div>
    </div>
  );
}