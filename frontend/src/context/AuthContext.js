
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { apiRequest } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("internly_user");
    const savedToken = sessionStorage.getItem(
      "internly_access_token"
    );

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        sessionStorage.removeItem("internly_user");
        sessionStorage.removeItem("internly_access_token");
      }
    }

    setLoading(false);
  }, []);

  function login(userData, accessToken) {
    if (!accessToken) {
      throw new Error("Authentication token was not received.");
    }

    sessionStorage.setItem(
      "internly_access_token",
      accessToken
    );

    sessionStorage.setItem(
      "internly_user",
      JSON.stringify(userData)
    );

    setUser(userData);
  }

  async function logout() {
    // No backend logout endpoint has been provided yet.
    // Clear the current browser session.
    sessionStorage.removeItem("internly_access_token");
    sessionStorage.removeItem("internly_user");

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
        apiRequest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}
