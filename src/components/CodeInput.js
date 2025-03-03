import React, { useState } from "react";
import { Input, Button } from "antd";

const { TextArea } = Input;

const CodeInput = ({ onCodesChange }) => {
  const [text, setText] = useState("");
  const [codes, setCodes] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    // Разбиваем данные по строкам, удаляем пустые элементы и пробелы
    const parsedCodes = value
      .split(/[\n,;]+/) // Разделяем по Enter, запятой, точке с запятой
      .map((code) => code.trim()) // Убираем пробелы
      .filter((code) => code.length > 0); // Убираем пустые строки

    setCodes(parsedCodes);
    onCodesChange(parsedCodes); // Отправляем коды наверх
  };

  const handleClear = () => {
    setText("");
    setCodes([]);
    onCodesChange([]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <TextArea
        placeholder="Вставьте коды из Excel..."
        rows={6}
        value={text}
        onChange={handleChange}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Количество кодов: {codes.length}</span>
        <Button onClick={handleClear} danger>Очистить</Button>
      </div>
    </div>
  );
};

export default CodeInput;
