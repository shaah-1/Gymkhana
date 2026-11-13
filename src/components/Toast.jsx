import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import "./Toast.css";

export default function Toast({ message, action, onClose, duration = 2800 }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!message) return;
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, duration);
    const dismissTimer = setTimeout(() => {
      if (onClose) onClose();
    }, duration + 250);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [message, duration, onClose]);

  const handleManualClose = () => {
    setFading(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 180);
  };

  if (!message) return null;

  return (
    <div
      className={`login-success-popup ${fading ? "toast-fade-out" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast-icon-badge" aria-hidden="true">
        <Check size={11} strokeWidth={3} />
      </span>

      <span className="toast-message">{message}</span>

      {action && <div className="toast-action">{action}</div>}

      <button
        type="button"
        className="toast-close-btn"
        onClick={handleManualClose}
        aria-label="Close notification"
      >
        <X size={13} strokeWidth={2.2} />
      </button>
    </div>
  );
}
