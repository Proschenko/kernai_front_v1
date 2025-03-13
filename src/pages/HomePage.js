import React, { useState } from "react";
import { Radio, Button, Modal, Progress } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LabSelect from "../components/LabSelect";
import ImageDragger from "../components/ImageDragger";
import CodeInput from "../components/CodeInput";
import api from "../utils/api";

const HomePage = () => {
  const [uploadType, setUploadType] = useState("imgOnly");
  const [selectedLab, setSelectedLab] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputCodes, setInputCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();

  const showModal = (message, percent) => {
    setProgress(percent);
    setModalVisible(true);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      return Modal.warning({ title: "Ошибка", content: "Пожалуйста, загрузите изображение!" });
    }
    if (!selectedLab) {
      return Modal.warning({ title: "Ошибка", content: "Пожалуйста, выберите лабораторию!" });
    }
    if (uploadType === "imgAndList" && inputCodes.length === 0) {
      return Modal.warning({ title: "Ошибка", content: "Введите коды или выберите 'Только изображение'" });
    }

    setLoading(true);
    setModalVisible(true);
    showModal("Загрузка файла...", 20);

    try {
      // 1. Загружаем изображение
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const uploadResponse = await api.post("/upload_img", formData);
      const { file_path, party_id } = uploadResponse.data;

      showModal("Файл загружен. Запуск анализа...", 40);

      // 2. Запускаем анализ
      const analyzeResponse = await api.post("/analyze_img", {
        party_id,
        image_path: file_path,
        codes: inputCodes,
        lab_id: selectedLab,
      });

      const { task_id } = analyzeResponse.data;

      showModal("Запрос отправлен. Проверяем очередь...", 60);

      // 3. Проверяем очередь
      let queueEmpty = false;
      while (!queueEmpty) {
        const queueResponse = await api.get("/queue_size");
        queueEmpty = queueResponse.data.queue_size === 0;
        if (!queueEmpty) {
          showModal(`В очереди: ${queueResponse.data.queue_size} задач`, 70);
          await new Promise((res) => setTimeout(res, 5000));
        }
      }

      showModal("Очередь пуста. Ожидание обработки...", 80);

      // 4. Ожидаем завершения обработки
      let result = null;
      while (!result) {
        const statusResponse = await api.get(`/task_status/${task_id}`);
        if (statusResponse.data.status === "SUCCESS") {
          result = statusResponse.data.result;
        } else {
          showModal("Обработка данных...", 90);
          await new Promise((res) => setTimeout(res, 5000));
        }
      }

      showModal("Обработка завершена!", 100);

      // 5. Редирект на валидацию
      setTimeout(() => {
        setModalVisible(false);
        console.log("Передаваемые данные:", { lab: selectedLab, uploadType, codes: inputCodes, result });
        navigate("/validation", { state: { lab: selectedLab, uploadType, codes: inputCodes, result } });
      }, 1000);
    } catch (error) {
      Modal.error({ title: "Ошибка", content: "Произошла ошибка при обработке запроса." });
    } finally {
      setLoading(false);
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
      <LabSelect onChange={(labId) => setSelectedLab(labId)} />

      <Button
        type="primary"
        icon={<UploadOutlined />}
        onClick={handleAnalyze}
        loading={loading}
        style={{ width: "100%", marginTop: 16 }}
      >
        {loading ? "Обработка..." : "Анализировать"}
      </Button>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: 16 }}>
        {uploadType === "imgAndList" && <CodeInput onCodesChange={setInputCodes} />}
        <ImageDragger onFileChange={setUploadedFile} />
      </div>

      {/* Модальное окно ожидания */}
      <Modal title="Обработка" open={modalVisible} footer={null} closable={false}>
        <Progress percent={progress} status="active" />
        <p>Подождите, идет обработка...</p>
      </Modal>
    </div>
  );
};

export default HomePage;
