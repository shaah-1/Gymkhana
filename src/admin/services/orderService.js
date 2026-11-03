import api from "../../services/api";

export const getOrders = () =>
  api.get("/orders").then((r) => (Array.isArray(r.data) ? r.data : []));

export const updateOrder = (id, changes) =>
  api.patch(`/orders/${encodeURIComponent(id)}`, changes).then((r) => r.data);
