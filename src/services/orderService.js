import api from "./api";

export const getOrders = () => api.get("/orders").then((r) => r.data);
export const getOrdersByUserId = (userId) => api.get("/orders", { params: { userId: String(userId) } }).then((r) => r.data);
export const createOrder = (order) => api.post("/orders", order).then((r) => r.data);
