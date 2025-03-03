import React, { createContext, useContext, useState, useEffect } from 'react';
import UserService from './UserService';

// Создаем контекст для аутентификации
const AuthContext = createContext();

// Хук для использования контекста
export const useAuth = () => {
  
  return useContext(AuthContext);
};

// Компонент для обертки приложения и предоставления состояния аутентификации
export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем, что Keycloak инициализирован и обновляем состояние аутентификации
    if (UserService.isLoggedIn()) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <AuthContext.Provider value={{ authenticated, login: UserService.doLogin, logout: UserService.doLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
