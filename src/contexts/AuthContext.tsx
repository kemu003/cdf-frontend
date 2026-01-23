// src/contexts/AuthContext.tsx - UPDATED VERSION
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { api } from "../services/api"; // Import the shared instance

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  ward?: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active?: boolean;
  is_verified?: boolean;
}

export interface LoginResult {
  success: boolean;
  user: User;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCommittee: boolean;
  isStaff: boolean;
  checkAuth: () => Promise<void>;
  apiBaseUrl: string;
  backendReachable: boolean;
  backendType: 'local' | 'production' | 'detecting';
  retryBackendConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Backend configuration
const BACKEND_URLS = {
  local: 'http://127.0.0.1:8000/api'
} as const;

// Helper to detect the best backend to use
const detectBestBackend = async (): Promise<{
  url: string;
  type: 'local' | 'production';
}> => {
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '';

  // For local development, always use local backend
  if (isLocalhost) {
    console.log('Local development detected, using local backend');
    return { url: BACKEND_URLS.local, type: 'local' };
  }

  // For production, use production URL
  // If you don't have production yet, default to local
  console.log('Production environment detected, using local backend (default)');
  return { url: BACKEND_URLS.local, type: 'local' };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [backendReachable, setBackendReachable] = useState(false);
  const [backendType, setBackendType] = useState<'local' | 'production' | 'detecting'>('detecting');
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(BACKEND_URLS.local);

  // Initialize backend detection
  useEffect(() => {
    initializeBackend();
  }, []);

  const initializeBackend = async () => {
    setIsLoading(true);
    try {
      const { url, type } = await detectBestBackend();
      setApiBaseUrl(url);
      setBackendType(type);
      
      // Update the shared api instance baseURL
      api.defaults.baseURL = url;
      console.log('Backend initialized:', { url, type });
      
      // Check connectivity to selected backend
      await checkBackendConnection(url);
      
      // If we have a user stored, check auth
      const savedUser = localStorage.getItem("user");
      const accessToken = localStorage.getItem("access_token");
      
      if (savedUser && accessToken) {
        await checkAuth();
      }
    } catch (error) {
      console.error('Failed to initialize backend:', error);
      setBackendReachable(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBackendConnection = async (url?: string) => {
    const targetUrl = url || apiBaseUrl;
    if (!targetUrl) return false;

    try {
      // Try to access a public endpoint
      const response = await axios.get(`${targetUrl}/auth/check/`, {
        timeout: 3000,
        validateStatus: (status) => status < 500,
      });
      setBackendReachable(true);
      console.log(`✅ Backend is reachable at ${targetUrl}`);
      return true;
    } catch (error: any) {
      // 401 is okay - it means backend is reachable but needs auth
      if (error.response?.status === 401) {
        setBackendReachable(true);
        console.log(`✅ Backend is reachable at ${targetUrl} (requires authentication)`);
        return true;
      } else {
        setBackendReachable(false);
        console.warn(`❌ Backend is not reachable at ${targetUrl}:`, error.message);
        return false;
      }
    }
  };

  const retryBackendConnection = async () => {
    await initializeBackend();
  };

  const checkAuth = async () => {
    const savedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("access_token");
    
    if (!savedUser || !accessToken || !backendReachable) {
      setUser(null);
      return;
    }

    try {
      setIsLoading(true);
      const userData = JSON.parse(savedUser);
      
      // Verify token by trying to access a protected endpoint using the shared api instance
      try {
        const response = await api.get("/users/me/");
        const updatedUser = {
          ...userData,
          ...response.data,
          id: response.data.id || userData.id,
          username: response.data.username || userData.username,
          email: response.data.email || userData.email,
          first_name: response.data.first_name || userData.first_name,
          last_name: response.data.last_name || userData.last_name,
          role: response.data.role || userData.role,
          is_staff: response.data.is_staff || userData.is_staff,
          is_superuser: response.data.is_superuser || userData.is_superuser,
        };
        
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("✅ User is authenticated and token is valid");
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log("Token expired or invalid");
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        } else if (error.response?.status === 404) {
          // /users/me/ endpoint doesn't exist, keep using stored user
          console.log("User endpoint not found, using stored user data");
          setUser(userData);
        }
      }
    } catch (error) {
      console.warn("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    
    try {
      // Ensure backend is reachable
      if (!backendReachable) {
        await checkBackendConnection();
        if (!backendReachable) {
          throw new Error(`Cannot connect to backend. Please ensure the server is running. Current backend: ${backendType} (${apiBaseUrl})`);
        }
      }
      
      // Determine if identifier is email or username
      const isEmail = identifier.includes('@');
      
      // Use the shared api instance for login
      const payload = isEmail 
        ? { email: identifier, password }
        : { username: identifier, password };
      
      console.log(`Attempting login at ${backendType} backend:`, { 
        url: apiBaseUrl,
        payload 
      });
      
      // Get JWT tokens using the shared api instance
      const tokenResponse = await api.post('/auth/token/', payload, {
        timeout: 15000
      });
      
      if (!tokenResponse.data.access || !tokenResponse.data.refresh) {
        throw new Error("Invalid response from authentication server");
      }
      
      const { access, refresh } = tokenResponse.data;
      
      // Store tokens
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      
      // Now get user info using the token
      let userData: User;
      
      try {
        // Try to get user details from /users/me/
        const userResponse = await api.get('/users/me/');
        
        userData = {
          id: userResponse.data.id,
          username: userResponse.data.username || identifier,
          email: userResponse.data.email || (isEmail ? identifier : `${identifier}@Chepalungu.go.ke`),
          first_name: userResponse.data.first_name || identifier,
          last_name: userResponse.data.last_name || "User",
          role: userResponse.data.role || "admin",
          phone: userResponse.data.phone || "",
          ward: userResponse.data.ward || "",
          is_staff: userResponse.data.is_staff || true,
          is_superuser: userResponse.data.is_superuser || true,
          is_active: userResponse.data.is_active !== undefined ? userResponse.data.is_active : true,
          is_verified: userResponse.data.is_verified || true,
        };
        
      } catch (userError: any) {
        // If /users/me/ endpoint doesn't exist, create user from available data
        console.log("User endpoint not accessible, creating user from login data");
        
        const isAdminUser = identifier === "admin" || identifier === "admin@Chepalungu.go.ke";
        
        userData = {
          id: 1,
          username: identifier,
          email: isEmail ? identifier : `${identifier}@Chepalungu.go.ke`,
          first_name: identifier.split('@')[0].charAt(0).toUpperCase() + identifier.split('@')[0].slice(1),
          last_name: "User",
          role: isAdminUser ? "admin" : "user",
          phone: "",
          ward: "",
          is_staff: isAdminUser,
          is_superuser: isAdminUser,
          is_active: true,
          is_verified: true,
        };
      }
      
      // Store user
      localStorage.setItem("user", JSON.stringify(userData));
      
      setUser(userData);
      setIsLoading(false);
      
      return { 
        success: true, 
        user: userData,
        token: access
      };
      
    } catch (error: any) {
      setIsLoading(false);
      
      let errorMessage = "Login failed. Please try again.";
      
      if (error.response?.status === 401) {
        errorMessage = "Invalid email/username or password.";
      } else if (error.response?.status === 400) {
        errorMessage = "Bad request. Please check your credentials.";
      } else if (error.response?.status === 404) {
        errorMessage = "Authentication endpoint not found.";
      } else if (error.message.includes("Network Error") || error.message.includes("timeout")) {
        errorMessage = `Cannot connect to ${backendType} backend at ${apiBaseUrl}. Please check if the server is running.`;
      } else {
        errorMessage = error.message || "Unknown error occurred.";
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    
    // Redirect to login
    window.location.href = "/login";
  };

  const isAdmin = user ? (user.is_staff || user.is_superuser || user.role === "admin") : false;
  const isCommittee = user ? user.role === "committee" : false;
  const isStaff = user ? user.role === "staff" : false;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading,
      isAuthenticated: !!user && !!localStorage.getItem("access_token"),
      isAdmin,
      isCommittee,
      isStaff,
      checkAuth,
      apiBaseUrl,
      backendReachable,
      backendType,
      retryBackendConnection,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};