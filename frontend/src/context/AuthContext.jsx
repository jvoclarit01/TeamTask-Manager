import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { getTasks, getEmployees, getMyTasks, login as apiLogin, setAuthToken } from '../services/apiService';

const AuthContext = createContext(null);

const DEFAULT_ADMIN = { id: 2, name: 'Alice Admin', email: 'admin@company.com', role: 'admin' };
const DEFAULT_EMPLOYEE = { id: 3, name: 'Bob Employee', email: 'bob@company.com', role: 'employee' };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.name) {
          return parsed;
        }
      } catch (error) {
        console.error('Error parsing user session from localStorage:', error);
      }
    }
    return DEFAULT_ADMIN; // Default to Admin instead of null
  });

  const [searchQuery, setSearchQuery] = useState('');

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  const activeUserIdRef = useRef(user?.id);

  useEffect(() => {
    activeUserIdRef.current = user?.id;
  }, [user]);

  const refreshCache = useCallback(async (showLoadingSpinner = false) => {
    if (!user) return;
    const fetchUserId = user.id;
    
    if (showLoadingSpinner) {
      setTasksLoading(true);
      setEmployeesLoading(true);
    }
    
    try {
      // 1. Retrieve or fetch token from local cache map to avoid network login roundtrip
      const cachedTokens = JSON.parse(localStorage.getItem('user_tokens') || '{}');
      let token = cachedTokens[user.id];
      
      if (!token) {
        const loginRes = await apiLogin({ email: user.email, password: 'password123' });
        token = loginRes.data.token;
        cachedTokens[user.id] = token;
        localStorage.setItem('user_tokens', JSON.stringify(cachedTokens));
      }
      
      setAuthToken(token);
      localStorage.setItem('last_authenticated_user_id', String(user.id));

      // Concurrently fetch tasks and employees
      const tasksPromise = user.role === 'admin' 
        ? getTasks() 
        : getMyTasks(user.id);
        
      const [tasksRes, employeesRes] = await Promise.all([
        tasksPromise,
        getEmployees()
      ]);
      
      if (activeUserIdRef.current === fetchUserId) {
        setTasks(tasksRes.data);
        setEmployees(employeesRes.data);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        const cachedTokens = JSON.parse(localStorage.getItem('user_tokens') || '{}');
        delete cachedTokens[user.id];
        localStorage.setItem('user_tokens', JSON.stringify(cachedTokens));
        localStorage.removeItem('last_authenticated_user_id');
      }
      console.error('Failed to update dashboard cache', err);
    } finally {
      if (activeUserIdRef.current === fetchUserId) {
        setTasksLoading(false);
        setEmployeesLoading(false);
      }
    }
  }, [user]);

  const clearCache = useCallback((shouldSetLoading = false) => {
    setTasks([]);
    setEmployees([]);
    setTasksLoading(shouldSetLoading);
    setEmployeesLoading(shouldSetLoading);
  }, []);

  useEffect(() => {
    if (user) {
      Promise.resolve().then(() => {
        refreshCache(true);
      });
    } else {
      Promise.resolve().then(() => {
        clearCache(false);
      });
    }
  }, [user, refreshCache, clearCache]);

  const [notifications, setNotifications] = useState([]);

  const addNotification = (title, message) => {
    setNotifications((prev) => [
      {
        id: Date.now(),
        title,
        message,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user_session', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
    localStorage.removeItem('user_tokens');
    localStorage.removeItem('last_authenticated_user_id');
  };

  const switchRole = (newRole) => {
    clearCache(true);
    let newUser;
    if (newRole === 'admin') {
      newUser = DEFAULT_ADMIN;
    } else {
      const lastEmp = localStorage.getItem('last_employee_session');
      if (lastEmp) {
        try {
          newUser = JSON.parse(lastEmp);
        } catch (e) {
          console.error('Failed to parse last employee session:', e);
          newUser = DEFAULT_EMPLOYEE;
        }
      } else {
        newUser = DEFAULT_EMPLOYEE;
      }
    }
    setUser(newUser);
    localStorage.setItem('user_session', JSON.stringify(newUser));
  };

  const switchUser = (userObj) => {
    clearCache(true);
    const isSelAdmin = userObj.name.includes('Admin') || userObj.role === 'admin';
    const sessionUser = {
      id: userObj.id,
      name: userObj.name,
      email: userObj.email,
      role: isSelAdmin ? 'admin' : 'employee',
    };
    setUser(sessionUser);
    localStorage.setItem('user_session', JSON.stringify(sessionUser));
    if (!isSelAdmin) {
      localStorage.setItem('last_employee_session', JSON.stringify(sessionUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        switchRole,
        switchUser,
        searchQuery,
        setSearchQuery,
        notifications,
        addNotification,
        markAllNotificationsAsRead,
        tasks,
        employees,
        tasksLoading,
        employeesLoading,
        refreshCache,
        clearCache,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
