import React, { useState, useEffect, useCallback, useReducer } from "react";
import {  Table,  Tag,  Button,  Modal,  Image,  Input,  message,  notification,  Checkbox,  Popconfirm,  Select,
} from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import api from "../utils/api";

const placeholderImage = null;
const LOCAL_STORAGE_KEY = "validationPageData";
const IMAGE_CACHE_KEY = "imageCache";

const VerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { state } = location || {};
  const { result } = state || {};
  const {party_id, lab} = state || {};

  const [modalVisible, setModalVisible] = useState(false);
  const [modalImages, setModalImages] = useState({ rotated: "", cropped: "",  process_image: "", recognition_text_image: "" });
  const [data, setData] = useState([]);
  const [imageCache, setImageCache] = useState({});
  const [disablePopconfirm, setDisablePopconfirm] = useState(false);
  // Состояние для списка видов повреждений, полученных из API
  const [damageTypes, setDamageTypes] = useState([]);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Запрос списка видов повреждений из API
  useEffect(() => {
    const fetchDamageTypes = async () => {
      try {
        const res = await api.get("/get_damages");
        setDamageTypes(res.data); // ожидается, что res.data — массив объектов с полями id и damage_type
      } catch (error) {
        console.error("Ошибка при загрузке видов повреждений:", error);
      }
    };

    fetchDamageTypes();
  }, []);

  // Функция для плавного скролла к элементу
  const smoothScrollTo = (element) => {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 500;
    let startTime = null;

    const easeInOutQuad = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
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

  //Функция получения путей до иных изображений полученных не из ответа API
  function get_all_image_from_path(path_inner){
    function goUpDir(path,levels=1){
        const segments = path.split(/[\\/]/).filter(Boolean)
        if (levels >= segments.lenght) return '';
        return segments.slice(0,-levels).join('/');
    }
    const main_dir = goUpDir(path_inner,2);
    
    const id_num_kern = path_inner.split('/').pop().split('_').pop().split('.')[0]
    
    function getAllImages(main_dir,id_num_img){
        const step5_rotate = main_dir+"/step5_rotate_image/process_image_"+id_num_img+".png";
        const step6_recog_text = main_dir+"/step6_recognize_text/one_image/recognition_text_image_"+id_num_img+".png";
        return {step5_rotate, step6_recog_text}
    }
    const res=getAllImages(main_dir,id_num_kern)
    return res
}




  // Предварительная загрузка изображений
  const prefetchImages = useCallback(
    async (processingResults) => {
      const newCache = {};
      for (const item of processingResults) {
        newCache[item.rotated_path] = await fetchImage(item.rotated_path);
        newCache[item.cropped_path] = await fetchImage(item.cropped_path);
        
        const result_tmp = get_all_image_from_path(item.cropped_path)
        const step5_rotate_path =  result_tmp['step5_rotate']
        const step6_recog_text_path = result_tmp['step6_recog_text']
        
        console.log("Loading step5_rotate_path:", step5_rotate_path);
        console.log("Loading step6_recog_text_path:", step6_recog_text_path);

        newCache[step5_rotate_path] = await fetchImage(step5_rotate_path);
        newCache[step6_recog_text_path] = await fetchImage(step6_recog_text_path);
      }
      setImageCache(newCache);
      sessionStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(processingResults.map((i) => i.rotated_path)));
      forceUpdate();
    },
    [fetchImage]
  );

  // Загрузка данных из localStorage или результата обработки
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Добавляем поле damage_type, если его ещё нет
      const dataWithDamage = parsedData.map((item) => ({ ...item, status: false, damage_type: item.damage_type || "" }));
      setData(dataWithDamage);
      prefetchImages(dataWithDamage);
    } else if (result?.processing_results) {
      const processedResults = result.processing_results.map((item) => ({
        ...item,
        status: false,
        damage_type: "",
      }));
      setData(processedResults);
      prefetchImages(processedResults);
    }
  }, [result, prefetchImages]);

  // Сохраняем данные в localStorage при изменении data
  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  // Открытие модального окна с изображениями
  const showImageModal = (rotated, cropped,process_image,recognition_text_image) => {
    console.log("rotated:", rotated);
    console.log("cropped:", cropped);
    console.log("process_image:", process_image);
    console.log("recognition_text_image:", recognition_text_image);

    setModalImages({
      rotated: { url: imageCache[rotated] || placeholderImage, caption: "Повернутое (конец) изображение" },
      cropped: { url: imageCache[cropped] || placeholderImage, caption: "Исходное изображение" },
      process_image: { url: imageCache[process_image] || placeholderImage, caption: "Поворот №1" },
      recognition_text_image: { url: imageCache[recognition_text_image] || placeholderImage, caption: "Распознанный текст" },
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
  const handleLoadData = async () => {
    // Проверяем, что все строки подтверждены
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

    // Формируем payload для запроса вставки данных
    console.log("data:")
    console.log(data)
    console.log("result")
    console.log(result)
    const payload = {
      id_party: party_id, // идентификатор для kern_party
      kern_party_statements: result?.codes || [], // список кодов для kern_party_statements; может быть пустым
      insert_date: result?.insert_date, // общий insert_date для всех записей
      validation_date: new Date().toISOString().slice(0, 19).replace("T", " "),
      download_date: result?.download_date,
      lab_id: lab,
      input_type: result?.input_type,
      rows: data.map((item) => ({
        damage_id: damageTypes.find(d => d.damage_type === item.damage_type)?.id || null,
        confidence_model: item.model_confidence,   
        code_model: item.predicted_text,             
        code_algorithm: item.algorithm_text, 
        kern_code: item.kern_code, //здесь все хорошо
      })),
    };
    console.log("payload")
    console.log(payload)

    try {
      const response = await api.post("/insert_data", payload);
      console.log(response)
      message.success("Данные успешно загружены");
      navigate('/accounting');
    } catch (error) {
      message.error("Ошибка загрузки данных");
    }
  };

  // Подтверждение записи
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

  // Прокрутка к первой неподтвержденной записи
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

  const confirmedCount = data.filter((item) => item.status).length;
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
          onClick={() => {
            console.log(record);
            const result_tmp = get_all_image_from_path(record.cropped_path);
            const step5_rotate_path = result_tmp['step5_rotate'];
            const step6_recog_text_path = result_tmp['step6_recog_text'];
            showImageModal(record.rotated_path, record.cropped_path, step5_rotate_path, step6_recog_text_path);
          }}
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
      title: "Вид повреждения",
      dataIndex: "damage_type",
      key: "damage_type",
      render: (text, record, index) => (
        <Select
          value={record.damage_type || undefined}
          disabled={record.status}
          onChange={(value) => {
            const newData = [...data];
            newData[index].damage_type = value;
            setData(newData);
          }}
          allowClear
          style={{ width: 160 }}
          placeholder="Выберите"
        >
          {damageTypes.map((dt) => (
            <Select.Option key={dt.id} value={dt.damage_type}>
              {dt.damage_type}
            </Select.Option>
          ))}
        </Select>
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
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <Button type="primary" onClick={handleLoadData}>
            Отправить данные
          </Button>
          <Button onClick={handleShowUnconfirmed}>Показать неподтвержденные</Button>
        </div>
        <div></div>
        <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <Checkbox onChange={(e) => setDisablePopconfirm(e.target.checked)}>
            Отключить подтверждение удаления
          </Checkbox>
          <Button onClick={handleClearTable} danger>
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

      <Modal open={modalVisible} footer={null} onCancel={() => setModalVisible(false)}>
  <div style={{
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    flexWrap: "wrap",
    padding: "16px"
  }}>
    {Object.entries(modalImages).map(([key, image]) => (
      <div key={key} style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "8px"
      }}>
        <Image
          src={image.url}
          fallback={placeholderImage}
          width={350}
          style={{ maxWidth: "100%" }}
        />
        <div style={{ textAlign: "center", marginTop: "8px" }}>{image.caption}</div>
      </div>
    ))}
  </div>
</Modal>
    </div>
  );
};

export default VerificationPage;
