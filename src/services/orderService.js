
import api from "./api";

export const getOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

export const getOrdersByUserId = async (userId) => {
  const response = await api.get("/orders", {
    params: { userId: String(userId) },
  });

  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

export const updateOrder = async (orderId, updates) => {
  const response = await api.patch(
    `/orders/${encodeURIComponent(orderId)}`,
    updates
  );

  return response.data;
};
