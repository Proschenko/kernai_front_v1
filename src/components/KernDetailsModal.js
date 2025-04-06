import React, { useEffect, useState, useMemo } from "react";
import { Modal, Spin, Table, Button, Divider } from "antd";
import api from "../utils/api";
import moment from "moment";
import AddCommentModal from "./AddCommentModal";

const formatDate = (date) => moment(date).format("DD.MM.YYYY HH:mm");

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
      const result = response.data;
      setData(result);
      if (result.length > 0) {
        setKernCode(result[0].kern_code);
        setLabName(result[0].lab_name);
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
    setComments((prev) => [newComment, ...prev]);
  };

  const getFirstDamageDate = () => {
    const damaged = data.filter((item) => item.damage_type);
    if (damaged.length === 0) return null;

    const earliest = damaged.reduce((a, b) =>
      moment(a.insert_date).isBefore(b.insert_date) ? a : b
    );
    return formatDate(earliest.insert_date);
  };

  const kernColumns = [
    {
      title: "Дата добавления",
      dataIndex: "insert_date",
      key: "insert_date",
      render: formatDate,
    },
    { title: "Лаборатория", dataIndex: "lab_name", key: "lab_name" },
    {
      title: "Тип повреждения",
      dataIndex: "damage_type",
      key: "damage_type",
      render: (val) => val || "Нет повреждений",
    },
    { title: "Пользователь", dataIndex: "insert_user", key: "insert_user" },
  ];

  const commentColumns = [
    {
      title: "Дата",
      dataIndex: "insert_date",
      key: "insert_date",
      render: formatDate,
      width: 160,
    },
    {
      title: "Пользователь",
      dataIndex: "insert_user",
      key: "insert_user",
      width: 160,
    },
    {
      title: "Лаборатория",
      dataIndex: "lab_name",
      key: "lab_name",
      width: 140,
    },
    {
      title: "Комментарий",
      dataIndex: "comment_text",
      key: "comment_text",
      ellipsis: true,
    },
  ];

  const sortedData = useMemo(() => [...data].sort((a, b) => moment(b.insert_date).diff(a.insert_date)), [data]);
  const sortedComments = useMemo(() => [...comments].sort((a, b) => moment(b.insert_date).diff(a.insert_date)), [comments]);

  return (
    <Modal
      open={!!id}
      onCancel={onClose}
      footer={null}
      title="Детали Керна"
      width="90%"
      bodyStyle={{ padding: 0 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          height: "70vh",
          overflow: "hidden",
        }}
      >
        {/* Левая колонка */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            height: "100%",
            minWidth: 0, // фикс для ограничения расширения
          }}
        >
          {data.length > 0 && (
            <>
              <p>
                <strong>Код Керна:</strong> {kernCode}
              </p>
              <p>
                <strong>Последняя лаборатория:</strong> {data[data.length - 1]?.lab_name}
              </p>
              {getFirstDamageDate() && (
                <p>
                  <strong>Дата первого повреждения:</strong> {getFirstDamageDate()}
                </p>
              )}
            </>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>Комментарии</h3>
            <Button type="primary" onClick={() => setCommentModalVisible(true)}>
              Добавить комментарий
            </Button>
          </div>

          {loadingComments ? (
            <Spin size="large" />
          ) : (
            <div style={{ flex: 1, overflowY: "auto", overflowX: "auto", minWidth: 0 }}>
              <Table
                columns={commentColumns}
                dataSource={sortedComments}
                rowKey="id"
                size="small"
                pagination={false}
                style={{ fontSize: "8px", tableLayout: "fixed", minWidth: "100%" }}
                scroll={{ y: "calc(100vh - 600px)" }}
              />
            </div>
          )}
        </div>

        <Divider type="vertical" style={{ height: "100%" }} />

        {/* Правая колонка */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            height: "100%",
            minWidth: 0,
          }}
        >
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
                style={{ fontSize: "8px" }}
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
