import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

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
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!token || isGuest) {
      setUser(null);
      return;
    }
    fetchCurrentUser(token).then(setUser);
  }, [token, isGuest]);

  return (
    <AuthContext.Provider value={{ token, user, isGuest, setUser, login, logout, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};
