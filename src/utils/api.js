import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 10000, // 10 секунд
});

// Обработчик для установки правильного Content-Type
api.interceptors.request.use((config) => {
  // Если это FormData (например, для файлов), то устанавливаем правильный Content-Type
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// Глобальный обработчик ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login"; // Перенаправляем на логин
    }
    return Promise.reject(error);
  }
);

export default api;
