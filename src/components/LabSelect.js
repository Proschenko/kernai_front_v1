import React, { useState, useEffect } from "react";
import { Select, notification } from "antd";
import api from "../utils/api"; 

const LabSelect = ({ onChange }) => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLabs = async () => {
      setLoading(true);
      try {
        const response = await api.get("/labs"); // Исправленный вызов API
        setLabs(response.data.map(lab => ({ value: lab.id, label: lab.labname })));
      } catch (error) {
        notification.error({
          message: "Ошибка загрузки",
          description: "Не удалось загрузить список лабораторий. Попробуйте позже.",
          placement: "topRight",
        });
        console.error("Ошибка загрузки лабораторий:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabs();
  }, []);

  return (
    <Select
      style={{ width: "100%", marginTop: 16 }}
      placeholder="Выберите лабораторию"
      options={labs}
      loading={loading}
      onChange={onChange}
    />
  );
};

export default LabSelect;
