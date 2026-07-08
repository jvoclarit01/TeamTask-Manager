import { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Error parsing user session from localStorage:', error);
        localStorage.removeItem('user_session');
      }
    }
    return null;
  });
  const [loading] = useState(false);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user_session', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
