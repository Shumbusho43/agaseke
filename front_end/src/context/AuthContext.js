import { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { setAuthToken, handleApiError } from "@services/api";

const AuthContext = createContext({
  token: null,
  user: null,
  isInitializing: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (storedToken) {
          setAuthToken(storedToken);
          setToken(storedToken);
          await fetchProfile(storedToken);
        }
      } catch (error) {
        console.error("Failed to restore session", error);
      } finally {
        setIsInitializing(false);
      }
    };
    bootstrap();
  }, []);

  const fetchProfile = async (overrideToken) => {
    try {
      const { data } = await api.get("/auth/me", {
        headers: overrideToken
          ? {
              Authorization: `Bearer ${overrideToken}`,
            }
          : undefined,
      });
      setUser(data);
      return data;
    } catch (error) {
      console.error("Profile fetch failed", error);
      return null;
    }
  };

  const login = async ({ email, password }) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const newToken = data.token;
      await AsyncStorage.setItem("authToken", newToken);
      setAuthToken(newToken);
      setToken(newToken);
      await fetchProfile(newToken);
      return { success: true };
    } catch (error) {
      return { success: false, message: handleApiError(error) };
    }
  };

  const register = async (payload) => {
    try {
      await api.post("/auth/register", payload);
      return { success: true };
    } catch (error) {
      return { success: false, message: handleApiError(error) };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("authToken");
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isInitializing,
      login,
      register,
      logout,
      refreshProfile: fetchProfile,
    }),
    [token, user, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);