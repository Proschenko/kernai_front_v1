import React, { useState } from "react";
import { Radio, Button, Modal, Progress } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LabSelect from "../components/LabSelect";
import ImageDragger from "../components/ImageDragger";
import CodeInput from "../components/CodeInput";
import api from "../utils/api"; // Подключаем API

const HomePage = () => {
  const [uploadType, setUploadType] = useState("imgOnly");
  const [selectedLab, setSelectedLab] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inputCodes, setInputCodes] = useState([]);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    // Проверка на заполненность полей
    if (!uploadedFile) {
      return Modal.warning({ title: "Ошибка", content: "Пожалуйста, загрузите изображение!" });
    }
    if (!selectedLab) {
      return Modal.warning({ title: "Ошибка", content: "Пожалуйста, выберите лабораторию!" });
    }
    if ((uploadType === "imgAndList") && (inputCodes.length === 0 )){
      return Modal.warning({ title: "Ошибка", content: "Пожалуйста, введите коды или выберите способ анализа (Только изображение)" });
    }
    setModalVisible(true);



    setProgress(10);
    try {
      // Имитируем отправку запроса
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProgress(50);

      // Отправка файла на сервер
      const formData = new FormData();
      formData.append("file", uploadedFile);
      console.log("Файл:", formData);
      const result = await api.post("/analyze_img", formData);
      console.log("Результат:", result.data);
      setProgress(100);

      setTimeout(() => {
        setModalVisible(false);
        navigate("/validation", {
          state: { lab: selectedLab, uploadType, codes: inputCodes, fileName: uploadedFile.name },
        });
      }, 500);
    } catch (error) {
      Modal.error({ title: "Ошибка", content: "Не удалось отправить запрос." });
      setModalVisible(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Radio.Group
        options={[
          { label: "Только изображение", value: "imgOnly" },
          { label: "Изображение + Ведомость", value: "imgAndList" },
        ]}
        value={uploadType}
        onChange={(e) => setUploadType(e.target.value)}
        optionType="button"
        buttonStyle="solid"
        style={{ marginBottom: 16 }}
      />

      <LabSelect onChange={(value) => setSelectedLab(value)} />

      <Button
        type="primary"
        icon={<UploadOutlined />}
        onClick={handleAnalyze}
        style={{ width: "100%", marginTop: 16 }}
      >
        Анализировать
      </Button>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: 16 }}>
        {uploadType === "imgAndList" && (
          <CodeInput onCodesChange={(codes) => {console.log("Список кодов:", codes); setInputCodes(codes);}} />
        )}
        <ImageDragger onFileChange={setUploadedFile} />
      </div>

      {/* Модальное окно с прогресс-баром */}
      <Modal open={modalVisible} title="Анализ изображения" footer={null} closable={false}>
        <Progress percent={progress} />
      </Modal>
    </div>
  );
};

export default HomePage;
