
import api from "./api";

export const registerUser = async (userData) => {
  const response = await api.post("/users", userData);
  return response.data;
};

export const getUserByEmail = async (email) => {
  const response = await api.get("/users", {
    params: { email: email.trim().toLowerCase() },
  });

  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const loginUser = async (email, password) => {
  const users = await getUserByEmail(email);

  return users.find((user) => user.password === password) || null;
};
