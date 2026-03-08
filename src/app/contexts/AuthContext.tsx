import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  fullName: string;
  initials: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: check localStorage for existing token and validate it
  useEffect(() => {
    const storedToken = localStorage.getItem('xos-token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid token');
        return res.json();
      })
      .then((userData) => {
        setUser(userData);
        setToken(storedToken);
      })
      .catch(() => {
        localStorage.removeItem('xos-token');
        localStorage.removeItem('xos-user');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    }

    const data = await res.json();
    localStorage.setItem('xos-token', data.token);
    localStorage.setItem('xos-user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Signup failed');
    }

    const data = await res.json();
    localStorage.setItem('xos-token', data.token);
    localStorage.setItem('xos-user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('xos-token');
    localStorage.removeItem('xos-user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
