"use client";
import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isReady: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check localStorage for user data (only on client side)
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("user");
        }
      }
      setIsReady(true);
    }
  }, []);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = "/login";
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, isReady }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
