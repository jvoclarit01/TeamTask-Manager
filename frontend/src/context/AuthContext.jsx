import { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

const DEFAULT_ADMIN = { id: 999, name: 'Alice Admin', email: 'admin@company.com', role: 'admin' };
const DEFAULT_EMPLOYEE = { id: 3, name: 'Bob Employee', email: 'bob@company.com', role: 'employee' };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Error parsing user session from localStorage:', error);
      }
    }
    return DEFAULT_ADMIN; // Default to Admin instead of null
  });

  const [searchQuery, setSearchQuery] = useState('');

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user_session', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
  };

  const switchRole = (newRole) => {
    const newUser = newRole === 'admin' ? DEFAULT_ADMIN : DEFAULT_EMPLOYEE;
    setUser(newUser);
    localStorage.setItem('user_session', JSON.stringify(newUser));
  };

  const switchUser = (userObj) => {
    const isSelAdmin = userObj.name.includes('Admin') || userObj.role === 'admin';
    const sessionUser = {
      id: userObj.id,
      name: userObj.name,
      email: userObj.email,
      role: isSelAdmin ? 'admin' : 'employee',
    };
    setUser(sessionUser);
    localStorage.setItem('user_session', JSON.stringify(sessionUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, switchUser, searchQuery, setSearchQuery }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
