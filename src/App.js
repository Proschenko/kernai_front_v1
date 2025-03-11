import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "antd";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import ValidationPage from "./pages/ValidationPage";
import MonitoringPage from "./pages/MonitoringPage";
import GuidePage from "./pages/GuidePage";
import { useAuth } from './auth/AuthContext';  // Импортируем контекст


const { Header, Content } = Layout;

const App = () => {
  // eslint-disable-next-line
  const { authenticated, login, logout, keycloak, mail } = useAuth();  // Получаем состояние аутентификации и методы

  
  if (!authenticated) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Вы не аутентифицированы. Пожалуйста, войдите.</h2>
        {/* Кнопка для входа */}
        <button onClick={() => login()}>Войти</button>
      </div>
    );
  }
  
  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <Sidebar />
        <Layout style={{ marginLeft: 200, minHeight: "100vh" }}>
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
            Распознавание образцов керна
          </Header>
          <Content style={{ margin: "16px 16px 0", padding: 24, background: "#fff" }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/validation" element={<ValidationPage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="/guide" element={<GuidePage />} />
              {/* Пример редиректа, если пользователь не аутентифицирован */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
