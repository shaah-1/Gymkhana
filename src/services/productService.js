import api from "./api";

export const getProducts = () => api.get("/products").then((r) => r.data);
export const getProductById = (id) => api.get(`/products/${encodeURIComponent(id)}`).then((r) => r.data);
export const updateProductStock = (id, stock) => api.patch(`/products/${encodeURIComponent(id)}`, { stock }).then((r) => r.data);
