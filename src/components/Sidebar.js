import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Typography } from "antd";
import { UserOutlined, HomeTwoTone, EditTwoTone, EyeTwoTone, MessageTwoTone } from "@ant-design/icons";
import logo from "../assets/images/логотип Новатэк.png";
import { useAuth } from '../auth/AuthContext';  // Импортируем контекст


const { Sider } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: "/", icon: <HomeTwoTone />, label: "Главная", path: "/" },
  { key: "/validation", icon: <EditTwoTone />, label: "Валидация", path: "/validation" },
  { key: "/monitoring", icon: <EyeTwoTone />, label: "Мониторинг", path: "/monitoring" },
  { key: "/guide", icon: <MessageTwoTone />, label: "Справка", path: "/guide" },
];

const Sidebar = () => {
  const {mail,username, roles} =  useAuth();

  const role = roles.length > 0 ? roles[0] : "Неизвестная роль";
  const location = useLocation(); // Получаем текущий путь

  return (
    <Sider width={200} style={{ height: "100vh", position: "fixed", left: 0, top: 0, bottom: 0 }}>
      <div style={{ padding: "16px", textAlign: "center" }}>
        <img src={logo} alt="Логотип" style={{ maxWidth: "100%", height: "auto" }} />
      </div>
      <div style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.2)" }}>
        <Avatar size={64} icon={<UserOutlined />} />
        <div style={{ marginTop: 8 }}>
          <Text style={{ color: "white", fontWeight: "bold" }}>{username || "Неизвестный пользователь"}</Text>
        </div>
        <div>
          <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>{mail || "Email не указан"}</Text>
        </div>
        <div>
          <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>Роль: {role}</Text>
        </div>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]} // Активный пункт меню
        items={menuItems.map((item) => ({
          key: item.path,
          icon: item.icon,
          label: <NavLink to={item.path}>{item.label}</NavLink>,
        }))}
      />
    </Sider>
  );
};

export default Sidebar;