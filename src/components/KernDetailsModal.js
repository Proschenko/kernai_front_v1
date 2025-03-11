import React, { useEffect, useState } from "react";
import { Modal, Spin, Table, Button, Divider } from "antd";
import api from "../utils/api";
import moment from "moment";
import AddCommentModal from "./AddCommentModal";  // Импортируем новый компонент

const KernDetailsModal = ({ id, onClose }) => {
  const [data, setData] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false); 
  const [kernCode, setKernCode] = useState(""); 
  const [labName, setLabName] = useState(""); 

  useEffect(() => {
    if (id) {
      fetchData(id);
      fetchComments(id);
    }
  }, [id]);

  const fetchData = async (kernId) => {
    setLoading(true);
    try {
      const response = await api.get(`/kern/${kernId}`);
      setData(response.data);
      if (response.data.length > 0) {
        setKernCode(response.data[0].kern_code); 
        setLabName(response.data[0].lab_name); 
      }
    } catch (error) {
      console.error("Ошибка загрузки данных керна:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (kernId) => {
    setLoadingComments(true);
    try {
      const response = await api.get(`/kern/${kernId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error("Ошибка загрузки комментариев:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const addComment = (newComment) => {
    setComments([newComment, ...comments]); // Добавляем новый комментарий в начало списка
  };

  const kernColumns = [
    { title: "Дата добавления", dataIndex: "insert_date", key: "insert_date", render: (date) => moment(date).format("DD.MM.YYYY HH:mm") },
    { title: "Лаборатория", dataIndex: "lab_name", key: "lab_name" },
    { title: "Тип повреждения", dataIndex: "damage_type", key: "damage_type", render: (damage) => damage || "Нет повреждений" },
    { title: "Пользователь", dataIndex: "insert_user", key: "insert_user" },
  ];

  const commentColumns = [
    { 
      title: "Дата", 
      dataIndex: "insert_date", 
      key: "insert_date", 
      render: (date) => moment(date).format("DD.MM.YYYY HH:mm"),
      width: 150,
    },
    { 
      title: "Пользователь", 
      dataIndex: "insert_user", 
      key: "insert_user",
      render: (text) => text,
      width: 200,
    },
    { title: "Лаборатория", dataIndex: "lab_name", key: "lab_name", width: 120, },
    { title: "Комментарий", dataIndex: "comment_text", key: "comment_text" },
  ];

  const getFirstDamageDate = () => {
    if (data.length === 0) return null;
    const firstDamage = data.reduce((prev, current) => 
      moment(prev.insert_date).isBefore(moment(current.insert_date)) ? prev : current
    );
    return moment(firstDamage.insert_date).format("DD.MM.YYYY HH:mm");
  };

  const sortedData = data.sort((a, b) => moment(b.insert_date).diff(moment(a.insert_date)));
  const sortedComments = comments.sort((a, b) => moment(b.insert_date).diff(moment(a.insert_date)));

  return (
    <Modal open={!!id} onCancel={onClose} footer={null} title="Детали Керна" width="90%" bodyStyle={{ padding: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", height: "70vh", overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", height: "100%" }}>
          {data.length > 0 && (
            <>
              <p><strong>Код Керна:</strong> {data[0].kern_code}</p>
              <p><strong>Последняя лаборатория:</strong> {data[data.length - 1].lab_name}</p><p><strong>Дата первого повреждения:</strong> {getFirstDamageDate()}</p>
              </>
          )}
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Комментарии</h3>
            <Button type="primary" onClick={() => setCommentModalVisible(true)}>
              Добавить комментарий
            </Button>
          </div>
          
          {loadingComments ? (
            <Spin size="large" />
          ) : (
            <div style={{ flex: 1, overflowY: "auto" }}>
              <Table
                columns={commentColumns}
                dataSource={sortedComments}
                rowKey="id"
                size="small"
                pagination={false}
                style={{ fontSize: '8px' }}
                scroll={{ y: "calc(100vh - 600px)" }}
              />
            </div>
          )}
        </div>

        <Divider type="vertical" style={{ height: "100%" }} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px", height: "100%" }}>
          <h3>Таблица перемещений</h3>
          {loading ? (
            <Spin size="large" />
          ) : (
            <div style={{ flex: 1, overflowY: "auto" }}>
              <Table
                columns={kernColumns}
                dataSource={sortedData}
                rowKey="id"
                size="small"
                pagination={false}
                style={{ fontSize: '8px' }}
                scroll={{ y: "calc(100vh - 450px)" }}
              />
            </div>
          )}
        </div>
      </div>

      <AddCommentModal
        visible={commentModalVisible}
        onCancel={() => setCommentModalVisible(false)}
        onAddComment={addComment}
        kernCode={kernCode}
        labName={labName}
        kernId={id}
      />
    </Modal>
  );
};

export default KernDetailsModal;
