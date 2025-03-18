import React, { useState, useEffect, useCallback, useReducer } from "react";
import { Table, Tag, Button, Modal, Image, Input, message } from "antd";
import { useLocation } from "react-router-dom";
import api from "../utils/api";

const placeholderImage = "https://via.placeholder.com/100";
const LOCAL_STORAGE_KEY = "validationPageData";
const IMAGE_CACHE_KEY = "imageCache";

const ValidationPage = () => {
  const location = useLocation();
  const { state } = location || {};
  const { result } = state || {};

  const [modalVisible, setModalVisible] = useState(false);
  const [modalImages, setModalImages] = useState({ rotated: "", cropped: "" });
  const [data, setData] = useState([]);
  const [imageCache, setImageCache] = useState({});

  const [, forceUpdate] = useReducer((x) => x + 1, 0); // Форсируем ререндер

  // Функция загрузки изображения через API
  const fetchImage = useCallback(async (path) => {
    if (!path) return placeholderImage;
    
    try {
      const response = await api.get(`/get_image?path=${encodeURIComponent(path)}`, { responseType: "blob" });
      const imageUrl = URL.createObjectURL(response.data);
      return imageUrl;
    } catch (error) {
      console.error("Ошибка загрузки изображения:", error);
      return placeholderImage;
    }
  }, []);

  // Предварительная загрузка изображений
  const prefetchImages = useCallback(async (processingResults) => {
    const newCache = {};

    for (const item of processingResults) {
      newCache[item.rotated_path] = await fetchImage(item.rotated_path);
      newCache[item.cropped_path] = await fetchImage(item.cropped_path);
    }

    setImageCache(newCache);
    sessionStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(processingResults.map((i) => i.rotated_path))); // Сохраняем пути, а не blob-ссылки

    forceUpdate(); // Форсируем ререндер
  }, [fetchImage]);

  // Загружаем данные из localStorage и sessionStorage при монтировании
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedCachePaths = JSON.parse(sessionStorage.getItem(IMAGE_CACHE_KEY) || "[]");
  
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setData(parsedData);
      prefetchImages(parsedData);
    } else if (result?.processing_results) {
      setData(result.processing_results);
      prefetchImages(result.processing_results);
    }
  
    if (savedCachePaths.length > 0) {
      (async () => {
        const newCache = {};
        for (const path of savedCachePaths) {
          newCache[path] = await fetchImage(path);
        }
        setImageCache(newCache);
        forceUpdate();
      })();
    }
  }, [result, prefetchImages, fetchImage]); // Добавили fetchImage

  // Сохраняем данные в localStorage при изменении data
  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  // Открытие модального окна с изображениями
  const showImageModal = (rotated, cropped) => {
    setModalImages({
      rotated: imageCache[rotated] || placeholderImage,
      cropped: imageCache[cropped] || placeholderImage,
    });
    setModalVisible(true);
  };

  // Очистка таблицы с подтверждением
  const handleClearTable = () => {
    Modal.confirm({
      title: "Вы уверены, что хотите очистить таблицу?",
      content: "Это действие удалит все данные и его нельзя будет отменить.",
      okText: "Да, очистить",
      cancelText: "Отмена",
      onOk: () => {
        setData([]);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        sessionStorage.removeItem(IMAGE_CACHE_KEY);
        setImageCache({});
        message.success("Таблица очищена!");
      },
    });
  };

  const columns = [
    {
      title: "Изображение",
      dataIndex: "rotated_path",
      key: "rotated_path",
      render: (_, record) => (
        <Image
          src={imageCache[record.rotated_path] || placeholderImage}
          width={100}
          height={100}
          style={{ cursor: "pointer" }}
          fallback={placeholderImage}
          preview={false}
          onClick={() => showImageModal(record.rotated_path, record.cropped_path)}
        />
      ),
    },
    {
      title: "Распознанный текст",
      dataIndex: "predicted_text",
      key: "predicted_text",
      render: (text, record) => (
        <Tag color={text === record.algorithm_text ? "green" : "red"}>{text}</Tag>
      ),
    },
    {
      title: "Редактируемый текст",
      dataIndex: "algorithm_text",
      key: "algorithm_text",
      render: (text, record, index) => (
        <Input value={text} onChange={(e) => {
          const newData = [...data];
          newData[index].algorithm_text = e.target.value;
          setData(newData);
        }} />
      ),
    },
    {
      title: "Действие",
      key: "action",
      render: (_, record, index) => (
        <Button type="primary" onClick={() => message.success("Текст подтвержден!")}>
          Подтвердить
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1>Валидация данных</h1>
      
      <div style={{ marginBottom: "16px" }}>
        <Button type="danger" onClick={handleClearTable}>
          Очистить таблицу
        </Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="rotated_path" pagination={false} />

      <Modal open={modalVisible} footer={null} onCancel={() => setModalVisible(false)} width={800}>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <Image src={modalImages.rotated} fallback={placeholderImage} width={350} />
          <Image src={modalImages.cropped} fallback={placeholderImage} width={350} />
        </div>
      </Modal>
    </div>
  );
};

export default ValidationPage;
