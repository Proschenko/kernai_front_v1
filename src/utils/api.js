import axios from "axios";
import UserService from "../auth/UserService";

const api = axios.create({
  baseURL: "http://localhost:8000", // Бэкенд URL
  timeout: 10000, // 10 секунд
});

// Добавление токена в заголовки запроса
api.interceptors.request.use(
  (config) => {
    // Если пользователь авторизован, добавляем токен в заголовки
    const token = UserService.getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Если это FormData (например, для файлов), то устанавливаем правильный Content-Type
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Глобальный обработчик ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login"; // Перенаправляем на логин, если токен невалиден
    }
    return Promise.reject(error);
  }
);

export default api;
