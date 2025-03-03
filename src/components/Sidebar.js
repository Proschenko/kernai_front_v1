import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import { HomeTwoTone, EditTwoTone, EyeTwoTone, MessageTwoTone } from "@ant-design/icons";
import logo from "../assets/images/логотип Новатэк.png";

const { Sider } = Layout;

const menuItems = [
  { key: "/", icon: <HomeTwoTone />, label: "Главная", path: "/" },
  { key: "/validation", icon: <EditTwoTone />, label: "Валидация", path: "/validation" },
  { key: "/monitoring", icon: <EyeTwoTone />, label: "Мониторинг", path: "/monitoring" },
  { key: "/guide", icon: <MessageTwoTone />, label: "Справка", path: "/guide" },
];

const Sidebar = () => {
  const location = useLocation(); // Получаем текущий путь

  return (
    <Sider width={200} style={{ height: "100vh", position: "fixed", left: 0, top: 0, bottom: 0 }}>
      <div style={{ padding: "16px", textAlign: "center" }}>
        <img src={logo} alt="Логотип" style={{ maxWidth: "100%", height: "auto" }} />
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