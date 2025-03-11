import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Input, message, notification } from "antd";
import api from "../utils/api"; // Используем ваш API-инстанс

const AddCommentModal = ({ 
  visible, 
  onCancel, 
  onAddComment, 
  kernCode, 
  labName, 
  kernId, 
}) => {
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [labId, setLabId] = useState(null);

  // Функция для получения id лаборатории по имени
  const getLabId = useCallback(async () => {
    try {
      const { data } = await api.get(`/lab_id/${labName}`);
      setLabId(data); // Устанавливаем id лаборатории
    } catch (error) {
      message.error("Не удалось получить id лаборатории");
      notification.error({
        message: "Ошибка",
        description: "Не удалось получить id лаборатории. Попробуйте еще раз.",
      });
      console.error("Ошибка при получении id лаборатории:", error);
    }
  }, [labName]); // Указываем labName как зависимость для getLabId

  useEffect(() => {
    if (labName) {
      getLabId(); // Запрашиваем labId при монтировании компонента или изменении labName
    }
  }, [getLabId, labName]); // Добавляем getLabId и labName в зависимости

  const handleAddComment = async () => {
    if (!newComment.trim() || !labId) return; // Проверяем, что labId получен

    setLoading(true);
    try {
      const { data } = await api.post(`/kern/comments/`, {
        comment_text: newComment,
        kern_id: kernId,
        lab_id: labId,
      });

      message.success("Комментарий добавлен");
      onAddComment(data); // Передаем новый комментарий в родительский компонент
      setNewComment("");
      onCancel();
    } catch (error) {
      message.error("Не удалось добавить комментарий");
      console.error("Ошибка при добавлении комментария:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title="Добавить комментарий"
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" onClick={handleAddComment} loading={loading}>
          Добавить
        </Button>,
      ]}
    >
      <div>
        <p><strong>Код Керна:</strong> {kernCode}</p>
        <p><strong>Лаборатория:</strong> {labName}</p>
      </div>
      <Input.TextArea
        rows={4}
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Введите ваш комментарий"
        disabled={loading}
      />
    </Modal>
  );
};

export default AddCommentModal;