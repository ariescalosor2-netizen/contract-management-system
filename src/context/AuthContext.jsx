import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "argo_token";
const USER_KEY = "argo_user";

function setGlobalAuth(token) {
  if (!token) {
    delete window.ARGO_AUTH;
    delete window.__ARGO_AUTH__;
    return;
  }

  const auth = {
    token,
  };

  // Support both naming conventions
  window.ARGO_AUTH = auth;
  window.__ARGO_AUTH__ = auth;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // RESTORE SESSION
  // ============================================================

  useEffect(() => {
    try {
      const savedToken =
        localStorage.getItem(TOKEN_KEY);

      const savedUser =
        localStorage.getItem(USER_KEY);

      if (savedToken) {
        setToken(savedToken);

        setGlobalAuth(savedToken);
      }

      if (savedUser) {
        try {
          setUser(
            JSON.parse(savedUser)
          );
        } catch {
          localStorage.removeItem(
            USER_KEY
          );
        }
      }
    } catch (error) {
      console.error(
        "Failed to restore authentication:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // LOGIN
  // ============================================================

  const login = (
    userData,
    accessToken
  ) => {
    if (!accessToken) {
      console.error(
        "Login failed: access token is missing."
      );

      return false;
    }

    localStorage.setItem(
      TOKEN_KEY,
      accessToken
    );

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(
        userData ?? null
      )
    );

    setToken(accessToken);
    setUser(userData ?? null);

    setGlobalAuth(accessToken);

    return true;
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    localStorage.removeItem(
      TOKEN_KEY
    );

    localStorage.removeItem(
      USER_KEY
    );

    setToken(null);
    setUser(null);

    setGlobalAuth(null);
  };

  // ============================================================
  // AUTH ERROR
  // ============================================================

  useEffect(() => {
    const handleAuthError = () => {
      console.warn(
        "Authentication error detected."
      );
    };

    window.addEventListener(
      "argo-auth-error",
      handleAuthError
    );

    return () => {
      window.removeEventListener(
        "argo-auth-error",
        handleAuthError
      );
    };
  }, []);

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated:
        Boolean(token),
      login,
      logout,
    }),
    [
      user,
      token,
      loading,
    ]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}