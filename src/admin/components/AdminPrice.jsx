export default function AdminPrice({ amount, className = "" }) {
  if (amount === undefined || amount === null) return null;

  const rawNum = typeof amount === "number"
    ? amount
    : Number(String(amount).replace(/[^0-9.-]/g, "")) || 0;

  const formattedNumber = rawNum.toLocaleString("en-IN");

  return (
    <span className={`admin-price-wrap ${className}`}>
      <span className="admin-rupee" aria-hidden="true">₹</span>
      <span className="admin-num">{formattedNumber}</span>
    </span>
  );
}
