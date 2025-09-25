import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

// Define a basic user structure
interface User {
  email: string;
  app_metadata: { roles?: string[] };
}

// Define the shape of our context
interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isPro: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize the Netlify Identity widget
    netlifyIdentity.init();
    
    // Set the initial user if already logged in
    const currentUser = netlifyIdentity.currentUser();
    if (currentUser) {
      setUser(currentUser as User);
    }

    // Listen for login events
    netlifyIdentity.on('login', (loggedInUser) => {
      setUser(loggedInUser as User);
      netlifyIdentity.close();
    });

    // Listen for logout events
    netlifyIdentity.on('logout', () => {
      setUser(null);
    });

    // Clean up listeners on component unmount
    return () => {
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
    };
  }, []);

  const login = () => netlifyIdentity.open('login');
  const logout = () => netlifyIdentity.logout();

  // A helper to determine if the user has the 'pro' role
  const isPro = user?.app_metadata?.roles?.includes('pro') ?? false;

  return (
    <AuthContext.Provider value={{ user, login, logout, isPro }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
// Add console.error for better debugging
if (!res.ok) {
  const errorBody = await res.json().catch(() => ({ error: "An unknown error occurred" }));
  console.error(`[API ERROR] ${path}:`, errorBody.error);
  throw new Error(errorBody.error || "Server error");
}
