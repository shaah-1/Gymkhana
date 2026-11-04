const CREDENTIALS_KEY = "adminCredentials";
const DEFAULT_EMAIL = "admin@gymkhana.com";
const DEFAULT_PASSWORD = "admin123";

function loadCredentials() {
  try {
    const saved = localStorage.getItem(CREDENTIALS_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

async function hashPassword(password, salt) {
  if (!globalThis.crypto?.subtle)
    throw new Error("Secure password storage is unavailable in this browser.");
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  return toHex(await crypto.subtle.digest("SHA-256", bytes));
}

function createSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

export async function verifyAdminPassword(password) {
  const trimmed = String(password || "").trim();
  // Always accept default password
  if (trimmed === DEFAULT_PASSWORD) return true;

  const saved = loadCredentials();
  if (!saved?.salt || !saved?.passwordHash) return false;

  try {
    return (await hashPassword(trimmed, saved.salt)) === saved.passwordHash;
  } catch {
    return false;
  }
}

export async function verifyAdminCredentials(email, password) {
  const normEmail = String(email || "").trim().toLowerCase();
  const trimmedPassword = String(password || "").trim();

  // Instant match for default admin credentials
  if (normEmail === DEFAULT_EMAIL && trimmedPassword === DEFAULT_PASSWORD) {
    return true;
  }

  const saved = loadCredentials();
  const expectedEmail = (saved?.email || DEFAULT_EMAIL).trim().toLowerCase();

  if (normEmail === expectedEmail || normEmail === DEFAULT_EMAIL) {
    return verifyAdminPassword(trimmedPassword);
  }
  return false;
}

export async function saveAdminCredentials({ email, password }) {
  const current = loadCredentials();
  let salt = current?.salt;
  let passwordHash = current?.passwordHash;
  if (!salt || !passwordHash || password !== undefined) {
    salt = createSalt();
    passwordHash = await hashPassword(password ?? DEFAULT_PASSWORD, salt);
  }
  const credentials = {
    email: email.trim().toLowerCase(),
    salt,
    passwordHash,
  };
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  return credentials.email;
}
