import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
} from "../store/slices/adminOrderSlice";
import { fetchAdminProducts } from "../store/slices/adminProductSlice";
import AdminPrice from "../components/AdminPrice";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
import {
  adminBackLinkClass,
  adminBreadcrumbLinkClass,
  adminBreadcrumbsClass,
  adminNumClass,
  adminPageHeaderClass,
  adminPageSubtitleClass,
  adminPageTitleClass,
  adminStatusTagClass,
  adminTableClass,
  adminTableContainerClass,
  adminTdClass,
  adminThClass,
  adminThumbBoxClass,
  adminTitleNumClass,
} from "../adminClasses";

function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [updating, setUpdating] = useState(false);

  const order = useSelector((state) =>
    state.adminOrders.orders.find((item) => String(item.id) === String(id))
  );
  const products = useSelector((state) => state.adminProducts?.products || []);

  useEffect(() => {
    if (!order) dispatch(fetchAdminOrders());
    if (!products.length) dispatch(fetchAdminProducts());
  }, [dispatch, order, products.length]);

  if (!order) {
    return (
      <section>
        <p className="text-[#7a7c82]">Loading order record...</p>
      </section>
    );
  }

  const customer = order.customer || {};
  const customerName =
    customer.fullName ||
    customer.name ||
    order.fullName ||
    order.name ||
    order.email ||
    "—";

  const items = order.items || order.products || [];
  const statusStr = String(order.status || "pending").toLowerCase();
  const statusKey = statusStr.includes("deliv")
    ? "delivered"
    : statusStr.includes("ship")
      ? "shipped"
      : statusStr.includes("process")
        ? "processing"
        : statusStr.includes("cancel")
          ? "cancelled"
          : "pending";

  const statusLabel =
    statusKey === "delivered"
      ? "Delivered"
      : statusKey === "shipped"
        ? "Shipped"
        : statusKey === "processing"
          ? "Processing"
          : statusKey === "cancelled"
            ? "Cancelled"
            : "Pending";

  const totalAmount = Number(order.total ?? order.totalAmount ?? 0);

  const STAGES = [
    { key: "pending", label: "Pending" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentStageIndex = STAGES.findIndex((s) => s.key === statusKey);
  const isCancelled = statusKey === "cancelled";

  const stageFillPercent = isCancelled
    ? 0
    : currentStageIndex <= 0
      ? 0
      : currentStageIndex === 1
        ? 33.333
        : currentStageIndex === 2
          ? 66.666
          : 100;

  const getPointState = (idx) => {
    if (isCancelled) return "dimmed";
    if (statusKey === "delivered" || idx < currentStageIndex) return "completed";
    if (idx === currentStageIndex) return "active";
    return "pending";
  };

  const handleSetStatus = async (targetStatus) => {
    if (updating || targetStatus === statusKey) return;
    setUpdating(true);
    try {
      await dispatch(
        updateAdminOrderStatus({
          id: order.id,
          status: targetStatus,
        })
      ).unwrap();
    } finally {
      setUpdating(false);
    }
  };

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <section>
      {/* Breadcrumbs */}
      <div className={adminBreadcrumbsClass}>
        <Link to="/admin" className={adminBreadcrumbLinkClass}>
          Administration
        </Link>
        <span className="text-[#3b3d42]">/</span>
        <Link to="/admin/orders" className={adminBreadcrumbLinkClass}>
          Orders
        </Link>
        <span className="text-[#3b3d42]">/</span>
        <span className={adminNumClass}>#{order.id}</span>
      </div>

      <div className={adminPageHeaderClass}>
        <div>
          <h1 className={adminPageTitleClass}>
            ORDER <span className={adminTitleNumClass}>#{order.id}</span>
          </h1>
          <p className={adminPageSubtitleClass}>
            Placed on <span className={adminNumClass}>{orderDate}</span>
          </p>
        </div>

        <Link to="/admin/orders" className={adminBackLinkClass}>
          <ArrowLeft size={13} />
          <span>Queue</span>
        </Link>
      </div>

      {/* Editorial Order & Fulfillment Status Stepper */}
      <div className="mb-8 border border-[#e6e6e9] bg-white px-9 pt-7 pb-[26px] max-[768px]:mb-6 max-[768px]:px-[14px] max-[768px]:py-4 max-[640px]:mb-[22px] max-[640px]:px-3 max-[640px]:pt-[18px] max-[640px]:pb-4">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-[#eeeeef] pb-[14px] max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-[10px]">
          <div className="flex items-center gap-3">
            <p className="m-0 text-[10px] font-bold tracking-[0.18em] text-[#7b7e86] uppercase">
              Order Fulfillment Status
            </p>
            <span className={adminStatusTagClass(statusKey)}>{statusLabel}</span>
            {updating && (
              <span className="text-[11px] text-[#6f7177] italic">
                Updating status...
              </span>
            )}
          </div>
          <div className="flex items-center gap-[10px] max-[480px]:flex max-[480px]:w-full max-[480px]:justify-end">
            {isCancelled ? (
              <button
                type="button"
                onClick={() => handleSetStatus("pending")}
                disabled={updating}
                className="inline-flex cursor-pointer items-center gap-[6px] rounded-[4px] border border-[#a3caa9] bg-transparent px-[14px] py-[6px] text-[10.5px] font-semibold tracking-[0.12em] text-[#266b37] uppercase transition-all duration-150 hover:border-[#266b37] hover:bg-[#266b37] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                title="Restore order to pending"
              >
                Restore Order
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSetStatus("cancelled")}
                disabled={updating}
                className="inline-flex cursor-pointer items-center gap-[6px] rounded-[4px] border border-[#e2b2b2] bg-transparent px-[14px] py-[6px] text-[10.5px] font-semibold tracking-[0.12em] text-[#9c3333] uppercase transition-all duration-150 hover:border-[#9c3333] hover:bg-[#9c3333] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                title="Cancel this order"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Minimalist 4-Step Progress Track (Pending -> Processing -> Shipped -> Delivered) */}
        <div className="relative mx-auto mt-6 mb-4 flex max-w-[680px] items-start justify-between p-0 max-[768px]:overflow-x-auto max-[768px]:py-[10px] max-[640px]:overflow-x-auto max-[640px]:pt-1 max-[640px]:pb-[6px]">
          <div className="absolute right-[12.5%] bottom-[10px] left-[12.5%] z-[1] h-[1.5px] bg-[#e5e7eb] max-[640px]:bottom-[9px]">
            <div
              className="h-full bg-[#121214] transition-[width,background-color] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${stageFillPercent}%` }}
            />
          </div>

          {STAGES.map((st, idx) => {
            const pointState = getPointState(idx);

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => handleSetStatus(st.key)}
                disabled={updating}
                className={`group relative z-[2] flex flex-1 cursor-pointer flex-col items-center border-0 bg-transparent px-0 py-[6px] text-center transition-all duration-150 select-none disabled:cursor-not-allowed disabled:opacity-60 max-[640px]:py-[4px] max-[640px]:pb-[5px] ${
                  pointState === "dimmed" ? "opacity-45" : ""
                }`}
                title={`Click to set status to ${st.label}`}
              >
                <span
                  className={`mb-3 font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-xs leading-[14px] tracking-[-0.01em] whitespace-nowrap transition-[color,font-weight] duration-150 group-hover:text-[#121214] max-[640px]:mb-2 max-[640px]:text-[9.5px] max-[640px]:leading-[1.2] ${
                    pointState === "active"
                      ? "font-semibold text-[#121214]"
                      : pointState === "completed"
                        ? "font-medium text-[#121214]"
                        : "font-normal text-[#9da0a8]"
                  }`}
                >
                  {st.label}
                </span>
                <div
                  className={`box-border h-[9px] w-[9px] rounded-full transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-125 max-[640px]:h-2 max-[640px]:w-2 ${
                    pointState === "completed"
                      ? "border-0 bg-[#121214]"
                      : pointState === "active"
                        ? "border-2 border-[#121214] bg-white"
                        : "border-[1.5px] border-[#d4d5d9] bg-white"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-5 text-center text-[11px] tracking-[0.02em] text-[#7b7e86] max-[480px]:mt-[10px] max-[480px]:text-[10px]">
          {isCancelled ? (
            <span>
              Order is cancelled. Click any stage above or <strong>Restore Order</strong> to reactivate fulfillment.
            </span>
          ) : (
            <span>Click any step above to update fulfillment status.</span>
          )}
        </div>
      </div>

      <div className="mb-9 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 max-[768px]:mb-6 max-[768px]:grid-cols-1 max-[768px]:gap-4">
        {/* Customer Information Card */}
        <div className="border border-[#e6e6e9] bg-white p-6">
          <p className="m-0 mb-4 text-[10.5px] font-bold tracking-[0.16em] text-[#6f7177] uppercase">
            1 CLIENT &amp; SHIPPING
          </p>
          <p className="m-0 mb-[6px] font-semibold text-[#121214]">{customerName}</p>
          <p className="m-0 mb-1 text-xs text-[#6f7177]">
            Email: {customer.email || order.email || "—"}
          </p>
          <p className="m-0 mb-[14px] text-xs text-[#6f7177]">
            Phone: {customer.phone || "—"}
          </p>
          {customer.address && (
            <div className="mt-3 border-t border-[#e6e6e9] pt-3">
              <p className="m-0 mb-1 text-[10px] font-semibold text-[#989aa0] uppercase">
                Delivery Address:
              </p>
              <p className="m-0 text-xs leading-[1.5] text-[#3b3d42]">
                {customer.address}
                {customer.city ? `, ${customer.city}` : ""}
                {customer.pincode ? ` - ${customer.pincode}` : ""}
              </p>
            </div>
          )}
        </div>

        {/* Order Summary Card */}
        <div className="border border-[#e6e6e9] bg-white p-6">
          <p className="m-0 mb-4 text-[10.5px] font-bold tracking-[0.16em] text-[#6f7177] uppercase">
            2 ORDER SUMMARY
          </p>

          <div className="flex flex-col gap-[14px]">
            <div className="flex items-center justify-between border-b border-[#eeeeef] pb-3">
              <span className="text-xs text-[#6f7177]">Order Reference:</span>
              <strong className={`${adminNumClass} text-[12.5px]`}>#{order.id}</strong>
            </div>

            <div className="flex items-center justify-between border-b border-[#eeeeef] pb-3">
              <span className="text-xs text-[#6f7177]">Total Items:</span>
              <strong className={`${adminNumClass} text-[12.5px]`}>
                {items.reduce((sum, i) => sum + Number(i.quantity || 1), 0)} units
              </strong>
            </div>

            <div className="flex items-center justify-between pt-[2px]">
              <span className="text-xs text-[#6f7177]">Payable Amount:</span>
              <strong className={`${adminNumClass} text-sm`}>
                <AdminPrice amount={totalAmount} />
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Items Table */}
      <div className={adminTableContainerClass}>
        <table className={adminTableClass}>
          <thead>
            <tr>
              <th className={adminThClass}>Ordered Formulation</th>
              <th className={adminThClass}>Unit Price</th>
              <th className={adminThClass}>Quantity</th>
              <th className={adminThClass}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const qty = Number(item.quantity || 1);
              const price = Number(item.price || 0);
              const lineTotal = price * qty;
              const matchedProduct = products.find(
                (p) =>
                  String(p.id) === String(item.productId || item.id) ||
                  String(p.name || "").trim().toLowerCase() ===
                    String(item.name || item.title || "").trim().toLowerCase()
              );
              const itemImage =
                item.image || matchedProduct?.image || "/products/whey-protein.png";

              return (
                <tr key={item.id || item.productId || idx} className="group/row hover:bg-[#fafafc]">
                  <td className={adminTdClass}>
                    <div className="flex items-center gap-[14px]">
                      <div className={adminThumbBoxClass}>
                        <img
                          src={publicAssetUrl(itemImage)}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="font-semibold text-[#121214]">
                        {item.name || item.title || "Product"}
                      </span>
                    </div>
                  </td>
                  <td className={`${adminTdClass} ${adminNumClass}`}>
                    <AdminPrice amount={price} />
                  </td>
                  <td className={`${adminTdClass} ${adminNumClass}`}>{qty}</td>
                  <td className={adminTdClass}>
                    <strong className={adminNumClass}>
                      <AdminPrice amount={lineTotal} />
                    </strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan="3"
                className="border-t border-[#e6e6e9] p-4 text-right font-semibold tracking-[0.1em] text-[#6f7177]"
              >
                TOTAL:
              </td>
              <td className="border-t border-[#e6e6e9] p-4">
                <strong className={`${adminNumClass} text-[15px]`}>
                  <AdminPrice amount={order.total ?? order.totalAmount ?? 0} />
                </strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

export default OrderDetails;
