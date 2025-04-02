import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Layout } from "antd";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import ValidationPage from "./pages/ValidationPage";
import MonitoringPage from "./pages/MonitoringPage";
import GuidePage from "./pages/GuidePage";
import AdminPage from "./pages/AdminPage";
import { useAuth } from "./auth/AuthContext";

const { Header, Content } = Layout;

// Функция для определения заголовка в зависимости от маршрута
const getPageTitle = (pathname) => {
  switch (pathname) {
    case "/":
      return "Главная";
    case "/validation":
      return "Верификация";
    case "/monitoring":
      return "Мониторинг";
    case "/guide":
      return "Руководство";
    case "/admin_panel":
      return "Админ-панель";
    default:
      return "Распознавание образцов керна";
  }
};

const DynamicHeader = () => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <Header
      style={{
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgb(10,95,188)",
        color: "#fff",
        fontSize: "1.5rem",
        fontWeight: "bold",
      }}
    >
      {pageTitle}
    </Header>
  );
};

const App = () => {
  const { authenticated, login, roles } = useAuth();

  if (!authenticated) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Вы не аутентифицированы. Пожалуйста, войдите.</h2>
        <button onClick={() => login()}>Войти</button>
      </div>
    );
  }

  const isAdmin = roles?.includes("admin");

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <Sidebar />
        <Layout style={{ marginLeft: 200, minHeight: "100vh" }}>
          <DynamicHeader /> {/* Используем динамический заголовок */}
          <Content style={{ margin: "16px 16px 0", padding: 24, background: "#fff" }}>
            <Routes>
              {/* Скрытие маршрута для пользователей без роли admin1 */}
              {isAdmin && <Route path="/admin_panel" element={<AdminPage />} />}
              <Route path="/" element={<HomePage />} />
              <Route path="/validation" element={<ValidationPage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="/guide" element={<GuidePage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
