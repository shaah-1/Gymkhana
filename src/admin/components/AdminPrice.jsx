export default function AdminPrice({ amount, className = "" }) {
  if (amount === undefined || amount === null) return null;

  const rawNum =
    typeof amount === "number"
      ? amount
      : Number(String(amount).replace(/[^0-9.-]/g, "")) || 0;

  const formattedNumber = rawNum.toLocaleString("en-IN");

  return (
    <span
      className={`inline-flex items-baseline leading-none font-light text-inherit ${className}`}
    >
      <span
        className="mr-[1.5px] inline-block align-[0.06em] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[0.74em] leading-none font-light tracking-[-0.02em] opacity-85"
        aria-hidden="true"
      >
        ₹
      </span>
      <span className="font-light text-inherit tabular-nums">{formattedNumber}</span>
    </span>
  );
}
