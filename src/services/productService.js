
import api from "./api";

export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(
    `/products/${encodeURIComponent(id)}`
  );

  return response.data;
};

export const updateProductStock = async (id, stock) => {
  const response = await api.patch(
    `/products/${encodeURIComponent(id)}`,
    { stock }
  );

  return response.data;
};
