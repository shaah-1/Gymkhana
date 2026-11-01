import api from "./api";

export const registerUser = (userData) => api.post("/users", userData).then((r) => r.data);
export const getUserByEmail = (email) => api.get("/users", { params: { email: email.trim().toLowerCase() } }).then((r) => r.data);
export const getUserById = (id) => api.get(`/users/${encodeURIComponent(id)}`).then((r) => r.data);
export const loginUser = async (email, password) => (await getUserByEmail(email)).find((u) => u.password === password) || null;
