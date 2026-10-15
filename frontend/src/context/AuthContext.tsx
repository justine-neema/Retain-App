import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { api } from "../lib/api";
import type {
AuthResponse, LoginInput, SignupInput, User} from "../types/auth";

// shaping what the context expresser to counsumers

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (input: LoginInput) => Promise<void>;
    signup: (input: SignupInput) => Promise<void>;
    logout: () => void; 
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "retain_token";

// creating a provider

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // on mount, if token extist, we verify by calling /auth/me

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        api
        .get<AuthResponse>("/auth/me")
        .then((res) => {
            if (!cancelled) setUser(res.data.user);
        })
        .catch(() => { 
            if (!cancelled) {
                localStorage.removeItem(TOKEN_KEY);
                setUser(null);
            }
        })
        .finally(() => {
            if (!cancelled) setIsLoading(false);
        });

        return () => {
            cancelled = true
        };
    }, []);

    const login = useCallback(async(input: LoginInput) => {
        const res = await api.post<AuthResponse>("/auth/login", input);
        localStorage.setItem(TOKEN_KEY, res.data.token);
        setUser(res.data.user);
    }, []);

    const signup = useCallback(async (input: SignupInput) => {
        const res = await api.post<AuthResponse>("/auth/signup", input);
        localStorage.setItem(TOKEN_KEY, res.data.token);
        setUser(res.data.user);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
    }, []);

    const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
    }),
    [user, isLoading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// hook
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
