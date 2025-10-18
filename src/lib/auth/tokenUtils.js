import { jwtDecode } from "jwt-decode";
import { storage } from "./storage";

export const isValidToken = (token) => {
  const storedToken = token || storage.getToken();
  if (!storedToken) return false;

  try {
    const decoded = jwtDecode(storedToken);
    const currentTime = Date.now() / 1000;
    return decoded.exp ? decoded.exp > currentTime : true;
  } catch (err) {
    console.error("Invalid token format:", err);
    return false;
  }
};