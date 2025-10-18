"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/auth/api";
import { storage } from "@/lib/auth/storage";
import { isValidToken } from "@/lib/auth/tokenUtils";
import { AUTH_MODAL } from "@/lib/auth/constants";
import AuthModal from "@/components/auth/AuthModal";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(AUTH_MODAL.SIGN_IN);

  // Load token & user from localStorage on mount
  useEffect(() => {
    const storedToken = storage.getToken();
    const storedUser = storage.getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Persist to localStorage whenever auth changes
  useEffect(() => {
    storage.setToken(token);
    storage.setUser(user);
  }, [token, user]);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const { data, status } = await authApi.login(credentials);

      if (status === 200 && data?.data) {
        const { user, token } = data.data;
        setToken(token);
        setUser(user);
        setIsOpen(false);
      }
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    storage.clear();
  }, []);

  const checkTokenValidity = useCallback(() => {
    return isValidToken(token);
  }, [token]);

  const displayAuthModal = useCallback(() => {
    const isTokenValid = checkTokenValidity();
    if (!isTokenValid) {
      setIsOpen(true);
    }
  }, [checkTokenValidity]);

  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);

  const value = {
    activeModal,
    user,
    token,
    login,
    logout,
    setLoading,
    loading,
    isOpen,
    setIsOpen,
    displayAuthModal,
    toggleModal,
    setUser,
    setActiveModal,
    isValidToken: checkTokenValidity,
  };

  return (
      <AuthContext.Provider value={value}>
        {children}
        <AuthModal />
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};