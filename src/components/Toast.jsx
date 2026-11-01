import { useEffect } from "react";
import { Check } from "lucide-react";
import "./Toast.css";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="login-success-popup" role="status">
      <span className="success-icon" aria-hidden="true">
        <Check size={14} strokeWidth={2.4} />
      </span>
      <div>
        <strong>{message}</strong>
        <p>Thank you for being part of GYMKHANA.</p>
      </div>
    </div>
  );
}
