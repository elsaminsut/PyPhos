import { useState, useEffect } from 'react';
import { AuthContext } from './auth-context';

async function fetchCurrentUser(token) {
  const response = await fetch('/api/users/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;
  return response.json();
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('guest') === 'true');
  const [user, setUser] = useState(null);

  const login = (newToken) => {
    setIsGuest(false);
    localStorage.removeItem('guest');
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    setIsGuest(false);
    localStorage.removeItem('guest');
  };

  const continueAsGuest = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    setIsGuest(true);
    localStorage.setItem('guest', 'true');
  };

  useEffect(() => {
    async function syncUser() {
      if (!token || isGuest) {
        setUser(null);
        return;
      }
      setUser(await fetchCurrentUser(token));
    }

    syncUser();
  }, [token, isGuest]);

  return (
    <AuthContext.Provider value={{ token, user, isGuest, setUser, login, logout, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};
