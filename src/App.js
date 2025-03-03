import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import ValidationPage from "./pages/ValidationPage";
import MonitoringPage from "./pages/MonitoringPage";
import GuidePage from "./pages/GuidePage";
const { Header, Content } = Layout;

const App = () => {
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
            Распознавание
          </Header>
          <Content style={{ margin: "16px 16px 0", padding: 24, background: "#fff" }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/validation" element={<ValidationPage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="/guide" element={<GuidePage />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
