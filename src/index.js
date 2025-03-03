import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import UserService from './auth/UserService';
import axios from 'axios';
import { AuthProvider } from './auth/AuthContext';  // Импортируем наш AuthProvider

axios.interceptors.request.use((config) => {
  if (UserService.isLoggedIn()) {
    const cb = () => {
      config.headers.Authorization = `Bearer ${UserService.getToken()}`;
      return Promise.resolve(config);
    };
    return UserService.updateToken(cb);
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));

UserService.initKeycloak(() => {
  root.render(
    <React.StrictMode>
      <AuthProvider>  {/* Оборачиваем приложение в AuthProvider */}
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
});
