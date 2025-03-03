import React, { useState } from "react";
import { Modal, Button, Input } from "antd";

//TODO API для добавления комментария
const AddCommentModal = ({ visible, onCancel, onAddComment, kernCode, labName }) => {
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment(""); // Очищаем текст после отправки
    }
  };

  return (
    <Modal
      open={visible}
      title="Добавить комментарий"
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" onClick={handleAddComment}>
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
      />
    </Modal>
  );
};

export default AddCommentModal;
