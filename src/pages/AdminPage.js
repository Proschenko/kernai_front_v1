import React, { useState, useEffect } from "react";
import { Table, Button, Collapse, Modal, Form, Input, Popconfirm } from "antd";
import api from "../utils/api";

const { Panel } = Collapse;

const AdminPage = () => {
  const [labs, setLabs] = useState([]);
  const [damages, setDamages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLabModalVisible, setLabModalVisible] = useState(false);
  const [isDamageModalVisible, setDamageModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState(null);
  const [currentType, setCurrentType] = useState(null);
  const [searchTerms, setSearchTerms] = useState({ lab: "", damage: "" });

  useEffect(() => {
    fetchLabs();
    fetchDamages();
  }, []);

  const fetchLabs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/get_labs");
      setLabs(response.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchDamages = async () => {
    setLoading(true);
    try {
      const response = await api.get("/get_damages");
      setDamages(response.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    await api.delete(`/delete_${type}/${id}`);
    type === "lab" ? fetchLabs() : fetchDamages();
  };

  const handleEdit = (record, type) => {
    form.setFieldsValue({
      name: type === "lab" ? record.lab_name : record.damage_type,
    });
    setEditingKey(record.id);
    setCurrentType(type);
    type === "lab" ? setLabModalVisible(true) : setDamageModalVisible(true);
  };

  const handleAdd = (type) => {
    form.resetFields();
    setEditingKey(null);
    setCurrentType(type);
    type === "lab" ? setLabModalVisible(true) : setDamageModalVisible(true);
  };

  const handleSave = async (values) => {
    const type = currentType;
    const data = type === "lab" ? { lab_name: values.name } : { damage_type: values.name };
    
    if (editingKey) {
      await api.put(`/update_${type}/${editingKey}`, data);
    } else {
      await api.post(`/add_${type}`, data);
    }

    setEditingKey(null);
    form.resetFields();
    type === "lab" ? fetchLabs() : fetchDamages();
    type === "lab" ? setLabModalVisible(false) : setDamageModalVisible(false);
  };

  const filteredLabs = labs.filter(lab => lab.lab_name?.toLowerCase().includes(searchTerms.lab.toLowerCase()));
  const filteredDamages = damages.filter(damage => damage.damage_type?.toLowerCase().includes(searchTerms.damage.toLowerCase()));

  const columns = (type) => [
    { 
      title: "Название", 
      dataIndex: type === "lab" ? "lab_name" : "damage_type", 
      key: "name", 
      sorter: (a, b) => {
        const key = type === "lab" ? "lab_name" : "damage_type";
        return (a[key] || "").localeCompare(b[key] || "");
      },
    },
    {
      title: "Действия",
      key: "actions",
      render: (text, record) => (
        <>
          <Button onClick={() => handleEdit(record, type)}>Изменить</Button>
          <Popconfirm title="Удалить запись?" onConfirm={() => handleDelete(record.id, type)}>
            <Button danger style={{ marginLeft: 8 }}>Удалить</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Collapse accordion>
        <Panel header="Справочник лабораторий" key="1">
          <Input placeholder="Поиск..." onChange={(e) => setSearchTerms(prev => ({ ...prev, lab: e.target.value }))} style={{ marginBottom: 16, width: 200 }} />
          <Button type="primary" style={{marginLeft:"20px"}} onClick={() => handleAdd("lab")}>Добавить лабораторию</Button>
          <Table rowKey="id" dataSource={filteredLabs} columns={columns("lab")} loading={loading} style={{ marginTop: 16 }} />
        </Panel>
        <Panel header="Справочник видов повреждений" key="2">
          <Input placeholder="Поиск..." onChange={(e) => setSearchTerms(prev => ({ ...prev, damage: e.target.value }))} style={{ marginBottom: 16, width: 200 }} />
          <Button type="primary" style={{marginLeft:"20px"}} onClick={() => handleAdd("damage")}>Добавить повреждение</Button>
          <Table rowKey="id" dataSource={filteredDamages} columns={columns("damage")} loading={loading} style={{ marginTop: 16 }} />
        </Panel>
      </Collapse>
      
      <Modal
        title={editingKey ? "Редактировать лабораторию" : "Добавить лабораторию"}
        open={isLabModalVisible}
        onCancel={() => setLabModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSave}>
          <Form.Item name="name" label="Название" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingKey ? "Редактировать повреждение" : "Добавить повреждение"}
        open={isDamageModalVisible}
        onCancel={() => setDamageModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSave}>
          <Form.Item name="name" label="Название" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPage;