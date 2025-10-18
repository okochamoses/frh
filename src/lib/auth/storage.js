import { STORAGE_KEYS } from "./constants";

export const storage = {
  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken: (token) => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  },

  getUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    try {
      return user ? JSON.parse(user) : null;
    } catch (err) {
      console.error("Failed to parse stored user:", err);
      return null;
    }
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};