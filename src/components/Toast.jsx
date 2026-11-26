import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

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
      className={`fixed right-6 top-6 z-[99999] flex min-w-[220px] max-w-[min(340px,calc(100vw-32px))] items-center gap-3 rounded-xl border border-white/[.16] bg-black p-[10px_14px_10px_12px] text-[13px] font-normal leading-[1.4] tracking-[-.01em] text-white shadow-[0_10px_30px_rgb(0_0_0_/.45),0_2px_8px_rgb(0_0_0_/.3)] transition-opacity duration-200 animate-[subtleToastFadeIn_.2s_ease-out_both] motion-reduce:animate-none motion-reduce:transition-none max-[480px]:left-4 max-[480px]:right-4 max-[480px]:mx-auto max-[480px]:w-fit max-[480px]:max-w-[calc(100vw-32px)] ${fading ? "opacity-0" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-black" aria-hidden="true">
        <Check size={11} strokeWidth={3} />
      </span>

      <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{message}</span>

      {action && <div className="ml-0.5 inline-flex items-center">{action}</div>}

      <button
        type="button"
        className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 text-white/80 transition-colors hover:bg-white/[.12] hover:text-white"
        onClick={handleManualClose}
        aria-label="Close notification"
      >
        <X size={13} strokeWidth={2.2} />
      </button>
    </div>
  );
}
