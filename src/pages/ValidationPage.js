import React, { useState, useEffect, useCallback, useReducer } from "react";
import { Table, Tag, Button, Modal, Image, Input, message, notification, Checkbox, Popconfirm } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
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
  const [loading, setLoading] = useState(false);
  const [disablePopconfirm, setDisablePopconfirm] = useState(false);

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Функция для плавного скролла к элементу
  const smoothScrollTo = (element) => {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 500; // длительность анимации в мс
    let startTime = null;

    const easeInOutQuad = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    };

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
  };

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
    sessionStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(processingResults.map((i) => i.rotated_path)));
    forceUpdate();
  }, [fetchImage]);

  // Загружаем данные из localStorage и sessionStorage при монтировании
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedCachePaths = JSON.parse(sessionStorage.getItem(IMAGE_CACHE_KEY) || "[]");

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setData(parsedData.map(item => ({ ...item, status: false })));
      prefetchImages(parsedData);
    } else if (result?.processing_results) {
      const processedResults = result.processing_results.map(item => ({ ...item, status: false }));
      setData(processedResults);
      prefetchImages(processedResults);
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
  }, [result, prefetchImages, fetchImage]);

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

  // Кнопка загрузки данных с плавной прокруткой к первой неподтвержденной записи
  const handleLoadData = () => {
    const unconfirmedRow = data.find((row) => row.status !== true);
    if (unconfirmedRow) {
      notification.warning({
        message: "Заполните все записи!",
        description: "Пожалуйста, подтвердите все строки, прежде чем загружать данные.",
      });
      const rowElement = document.getElementById(unconfirmedRow.rotated_path);
      if (rowElement) {
        smoothScrollTo(rowElement);
      }
      return;
    }
    message.success("Данные загружены!");
  };

  // Подтвердить или отменить подтверждение записи
  const handleConfirm = (index) => {
    const newData = [...data];
    newData[index].status = !newData[index].status;
    setData(newData);
  };

  // Удаление записи
  const handleDelete = (index) => {
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
    message.success("Запись удалена!");
  };

  // Плавное перемещение к первой неподтвержденной записи или уведомление, если все подтверждены
  const handleShowUnconfirmed = () => {
    const unconfirmedRow = data.find((row) => !row.status);
    if (unconfirmedRow) {
      const rowElement = document.getElementById(unconfirmedRow.rotated_path);
      if (rowElement) {
        smoothScrollTo(rowElement);
      }
    } else {
      notification.info({ message: "Все записи подтверждены" });
    }
  };

  const confirmedCount = data.filter(item => item.status).length;
  const unconfirmedCount = data.length - confirmedCount;

  const columns = [
    {
      title: "Изображение",
      dataIndex: "rotated_path",
      key: "rotated_path",
      render: (_, record) => (
        <Image
          id={record.rotated_path}
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
      title: "Текст распознанный ИИ",
      dataIndex: "predicted_text",
      key: "predicted_text",
      render: (text, record) => (
        <Tag color={text === record.kern_code ? "green" : "red"}>{text}</Tag>
      ),
    },
    {
      title: "Конечный код керна",
      dataIndex: "kern_code",
      key: "kern_code",
      render: (text, record, index) => (
        <Input
          value={text}
          disabled={record.status}
          onChange={(e) => {
            const newData = [...data];
            newData[index].kern_code = e.target.value;
            setData(newData);
          }}
        />
      ),
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status ? <CheckCircleOutlined style={{ color: "green" }} /> : <CloseCircleOutlined style={{ color: "red" }} />,
    },
    {
      title: "Подтверждение",
      key: "action",
      render: (_, record, index) => (
        <Button type={record.status ? "default" : "primary"} onClick={() => handleConfirm(index)}>
          {record.status ? "Отменить" : "Подтвердить"}
        </Button>
      ),
    },
    {
      title: "Удаление",
      key: "delete",
      render: (_, record, index) =>
        disablePopconfirm ? (
          <Button type="danger" onClick={() => handleDelete(index)}>
            Удалить
          </Button>
        ) : (
          <Popconfirm
            title="Вы уверены, что хотите удалить эту запись?"
            onConfirm={() => handleDelete(index)}
            okText="Да"
            cancelText="Отмена"
          >
            <Button type="danger">Удалить</Button>
          </Popconfirm>
        ),
    },
  ];

  return (
    <div>
      <div style={{display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h1>Верификация</h1>
      </div>
      
      <div style={{display: "flex", justifyContent: "space-between"}}>
        <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <Button type="primary" onClick={handleLoadData}>
            Загрузить данные
          </Button>
          <Button onClick={handleShowUnconfirmed}>Показать неподтвержденные</Button>
          
        </div>
        <div></div>
        <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <Checkbox onChange={(e) => setDisablePopconfirm(e.target.checked)}>
          Отключить подтверждение удаления
        </Checkbox>
        <Button  onClick={handleClearTable} danger>
          Очистить таблицу
        </Button>
      </div>

      </div>


      <div style={{ marginBottom: "10px" }}>
        <Tag color="blue">Всего: {data.length}</Tag>
        <Tag color="green">Подтверждено: {confirmedCount}</Tag>
        <Tag color="red">Не подтверждено: {unconfirmedCount}</Tag>
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
