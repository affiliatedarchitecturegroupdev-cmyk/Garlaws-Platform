"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  did?: string; // Decentralized Identifier
  walletAddress?: string;
  authMethod?: 'traditional' | 'did' | 'wallet';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  did: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { email: string; name: string; password: string; phone?: string }) => Promise<boolean>;
  loginWithDID: (did: string, signature: string) => Promise<boolean>;
  loginWithWallet: (address: string, signature: string, message: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get initial auth state
function getInitialAuthState() {
  if (typeof window === 'undefined') return { user: null, token: null };

  try {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      return {
        token: storedToken,
        user: JSON.parse(storedUser),
      };
    }
  } catch (error) {
    // Clear invalid stored data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  return { user: null, token: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialState = getInitialAuthState();
  const [user, setUser] = useState<User | null>(initialState.user);
  const [token, setToken] = useState<string | null>(initialState.token);
  const [did, setDid] = useState<string | null>(localStorage.getItem('auth_did'));
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);

      // Store in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (userData: { email: string; name: string; password: string; phone?: string }): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);

      // Store in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const loginWithDID = async (userDid: string, signature: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/did-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ did: userDid, signature }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      setUser({ ...data.user, did: userDid, authMethod: 'did' });
      setToken(data.token);
      setDid(userDid);

      // Store in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify({ ...data.user, did: userDid, authMethod: 'did' }));
      localStorage.setItem('auth_did', userDid);

      return true;
    } catch (error) {
      console.error('DID login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithWallet = async (address: string, signature: string, message: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, signature, message }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      setUser({ ...data.user, walletAddress: address, authMethod: 'wallet' });
      setToken(data.token);

      // Store in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify({ ...data.user, walletAddress: address, authMethod: 'wallet' }));

      return true;
    } catch (error) {
      console.error('Wallet login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setDid(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_did');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      did,
      login,
      register,
      loginWithDID,
      loginWithWallet,
      logout,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}