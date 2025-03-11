import React, { createContext, useContext, useState, useEffect } from "react";
import UserService from "./UserService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [username, setUsername] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mail, setMail] = useState (null);
    const [roles, setRole] = useState (null);
    useEffect(() => {
        if (UserService.isLoggedIn()) {
            setAuthenticated(true);
            setUsername(UserService.getUsername()); // Получаем имя пользователя
            setMail(UserService.getMail());
            setRole(UserService.getUserRoles());
        } else {
            setAuthenticated(false);
            setUsername(null);
        }
        setLoading(false);
    }, []);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    return (
        <AuthContext.Provider value={{ authenticated, username, mail, roles, login: UserService.doLogin, logout: UserService.doLogout }}>
            {children}
        </AuthContext.Provider>
    );
};
