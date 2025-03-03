import React, { useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import { Upload, message } from "antd";
import api from "../utils/api"; // Подключаем API

const { Dragger } = Upload;

const ImageDragger = ({ onFileChange }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file) => {
    if (!file.type.startsWith("image/")) {
      message.error("Разрешена загрузка только изображений!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/upload_img", formData);
      message.success("Изображение загружено успешно!");

      setFile(file);
      onFileChange(file);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      message.error("Ошибка загрузки изображения");
    } finally {
      setLoading(false);
    }
  };

  const props = {
    name: "file",
    multiple: false,
    beforeUpload: (file) => {
      handleUpload(file);
      return false; // Останавливаем автоматическую загрузку
    },
    onRemove: () => {
      setFile(null);
      onFileChange(null);
    },
  };

  return (
    <Dragger {...props} fileList={file ? [file] : []} showUploadList={false} style={{ width: "100%", height: 250 }}>
      {loading ? (
        <p>Загрузка...</p>
      ) : file ? (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        <>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Кликните или перетащите изображение</p>
          <p className="ant-upload-hint">Разрешены только изображения</p>
        </>
      )}
    </Dragger>
  );
};

export default ImageDragger;
