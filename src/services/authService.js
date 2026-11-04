import api from "./api";

export const registerUser = (userData) =>
  api.post("/users", userData).then((r) => r.data);

export const getUserByEmail = async (email) => {
  const target = String(email || "").trim().toLowerCase();
  if (!target) return [];

  // 1. Try querying with query params
  try {
    const res = await api.get("/users", { params: { email: target } });
    const raw = res.data;
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : [];
    if (list.length > 0) return list;
  } catch {
    // Proceed to fallback
  }

  // 2. Fallback: fetch all users and filter client-side (handles json-server quirks & case insensitivity)
  try {
    const res = await api.get("/users");
    const raw = res.data;
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : [];
    return list.filter(
      (u) => String(u?.email || "").trim().toLowerCase() === target
    );
  } catch {
    return [];
  }
};

export const getUserById = (id) =>
  api.get(`/users/${encodeURIComponent(id)}`).then((r) => r.data);

export const updateUserById = (id, changes) =>
  api.patch(`/users/${encodeURIComponent(id)}`, changes).then((r) => r.data);

export const loginUser = async (email, password) => {
  const targetEmail = String(email || "").trim().toLowerCase();
  const targetPassword = String(password || "").trim();

  // Instant check for default admin credentials
  if (targetEmail === "admin@gymkhana.com" && targetPassword === "admin123") {
    return {
      id: "admin-1",
      name: "Admin",
      email: "admin@gymkhana.com",
      role: "admin",
      isAdmin: true,
    };
  }

  const users = await getUserByEmail(targetEmail);
  return (
    users.find(
      (u) =>
        String(u?.password || "").trim() === targetPassword
    ) || null
  );
};
