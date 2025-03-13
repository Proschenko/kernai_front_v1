import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Modal, Image, Input } from "antd";
import { useLocation } from "react-router-dom";

const placeholderImage = "https://via.placeholder.com/100"; // Заглушка


const ValidationPage = () => {
  const location = useLocation();
  useEffect(() => {
    console.log("location:", location);
  }, [location]);

  const { state } = location || {};
  console.log("state:", state);

  const { result } = state || {};
  console.log("result:", result);



  const [modalVisible, setModalVisible] = useState(false);
  const [modalImages, setModalImages] = useState({ rotated: "", cropped: "" });
  const [data, setData] = useState(result?.processing_results || []);

  const showImageModal = (rotated, cropped) => {
    setModalImages({ rotated, cropped });
    setModalVisible(true);
  };

  const handleAlgorithmTextChange = (index, value) => {
    const newData = [...data];
    newData[index].algorithm_text = value;
    setData(newData);
  };

  const handleConfirm = (index) => {
    console.log("Подтверждено:", data[index]);
  };

  const columns = [
    {
      title: "Изображение",
      dataIndex: "rotated_path",
      key: "rotated_path",
      render: (text, record) => (
        <Image
          src={`/get_image?path=${record.rotated_path}`}
          width={100}
          height={100}
          style={{ cursor: "pointer" }}
          fallback={placeholderImage}
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
        <Input value={text} onChange={(e) => handleAlgorithmTextChange(index, e.target.value)} />
      ),
    },
    {
      title: "Действие",
      key: "action",
      render: (_, record, index) => (
        <Button type="primary" onClick={() => handleConfirm(index)}>
          Подтвердить
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1>Валидация данных</h1>
      <Table columns={columns} dataSource={data} rowKey="rotated_path" pagination={false} />

      <Modal open={modalVisible} footer={null} onCancel={() => setModalVisible(false)} width={800}>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <Image src={`/get_image?path=${modalImages.rotated}`} fallback={placeholderImage} width={350} />
          <Image src={`/get_image?path=${modalImages.cropped}`} fallback={placeholderImage} width={350} />
        </div>
      </Modal>
    </div>
  );
};

export default ValidationPage;
