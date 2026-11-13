// Thin wrapper around the browser's localStorage API.
// Data remains in the browser for the current site origin; this is not a disk file.
export const storage = {
  getItem(key) {
    return globalThis.localStorage.getItem(key);
  },
  setItem(key, value) {
    globalThis.localStorage.setItem(key, value);
  },
  removeItem(key) {
    globalThis.localStorage.removeItem(key);
  },
};
