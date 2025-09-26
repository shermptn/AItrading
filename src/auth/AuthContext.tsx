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
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Initialize the Netlify Identity widget with error handling
        netlifyIdentity.init({
          container: null, // Don't auto-inject modal
        });
        
        // Set the initial user if already logged in
        const currentUser = netlifyIdentity.currentUser();
        if (mounted && currentUser) {
          setUser(currentUser as User);
        }

        // Listen for login events
        const handleLogin = (loggedInUser: any) => {
          if (!mounted) return;
          setUser(loggedInUser as User);
          setError(null);
          netlifyIdentity.close();
        };

        // Listen for logout events
        const handleLogout = () => {
          if (!mounted) return;
          setUser(null);
          setError(null);
        };

        // Listen for error events
        const handleError = (err: any) => {
          if (!mounted) return;
          console.error('Netlify Identity error:', err);
          setError(err.message || 'Authentication error occurred');
        };

        // Listen for init events
        const handleInit = (user: any) => {
          if (!mounted) return;
          if (user) {
            setUser(user as User);
          }
          setIsLoading(false);
        };

        netlifyIdentity.on('login', handleLogin);
        netlifyIdentity.on('logout', handleLogout);
        netlifyIdentity.on('error', handleError);
        netlifyIdentity.on('init', handleInit);

        // If no init event is fired, stop loading after a timeout
        const timeoutId = setTimeout(() => {
          if (mounted) {
            setIsLoading(false);
          }
        }, 3000);

        // Clean up listeners on component unmount
        return () => {
          mounted = false;
          clearTimeout(timeoutId);
          netlifyIdentity.off('login', handleLogin);
          netlifyIdentity.off('logout', handleLogout);
          netlifyIdentity.off('error', handleError);
          netlifyIdentity.off('init', handleInit);
        };
      } catch (err) {
        if (mounted) {
          console.error('Failed to initialize Netlify Identity:', err);
          setError(err instanceof Error ? err.message : 'Failed to initialize authentication');
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = () => {
    try {
      clearError();
      netlifyIdentity.open('login');
    } catch (err) {
      console.error('Failed to open login modal:', err);
      setError('Failed to open login. Please refresh the page and try again.');
    }
  };

  const logout = () => {
    try {
      clearError();
      netlifyIdentity.logout();
    } catch (err) {
      console.error('Failed to logout:', err);
      setError('Failed to logout. Please refresh the page and try again.');
    }
  };

  // A helper to determine if the user has the 'pro' role
  const isPro = user?.app_metadata?.roles?.includes('pro') ?? false;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isPro, 
      isLoading, 
      error, 
      clearError 
    }}>
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
