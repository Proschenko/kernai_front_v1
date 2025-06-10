import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Layout, Tag } from "antd";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import VerificationPage from "./pages/VerificationPage";
import AccountingPage from "./pages/AccountingPage";
import GuidePage from "./pages/GuidePage";
import AdminPage from "./pages/AdminPage";
import { useAuth } from "./auth/AuthContext";

const { Header, Content } = Layout;

// Функция для определения заголовка в зависимости от маршрута
const getPageTitle = (pathname) => {
  switch (pathname) {
    case "/":
      return "Распознавание образцов керна";
    case "/verification":
      return "Верификация";
    case "/accounting":
      return "Учет образцов керна";
    case "/guide":
      return "Справочная информация";
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
  const isUser = roles?.includes("user");
  const haveAccess = isAdmin || isUser;
  if (haveAccess){
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
              {haveAccess && <Route path="/" element={<HomePage />} /> }
              {haveAccess && <Route path="/verification" element={<VerificationPage />} />}
              {haveAccess && <Route path="/accounting" element={<AccountingPage />} />}
              {haveAccess && <Route path="/guide" element={<GuidePage />} />}
              {haveAccess && <Route path="*" element={<Navigate to="/" />} />}
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
  }else
  {
    return (
      <div style={{display: "flex", alignItems: "center", justifyContent: "center", height: "100vh"}}>
        <Tag style ={{fontSize: "50px", padding: "16", lineHeight: "100px"}}color= "red">{"Нет доступа. Запросите доступ."}</Tag>
        
      </div>
    )
  }
};

export default App;
