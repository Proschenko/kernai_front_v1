import React, { useState, useEffect } from "react";
import { Table, Input, Space, Button, Select, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import api from "../utils/api"; // Подключаем API
import moment from "moment";
import KernDetailsModal from "../components/KernDetailsModal"

const { Option } = Select;

const MonitoringPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    kern_code: "",
    lab_name: "",
    user_name: "",
    damage_type: "",
  });
  const [selectedKern, setSelectedKern] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/kerns");
      setData(response.data);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (record) => {
    setSelectedKern(record.id);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const resetFilters = () => {
    setFilters({ kern_code: "", lab_name: "", user_name: "", damage_type: "" });
    setSearchText("");
  };


  const filteredData = data.filter((item) =>
    Object.values(item).some((field) =>
      field?.toString().toLowerCase().includes(searchText.toLowerCase())
    ) &&
    Object.keys(filters).every((key) =>
      filters[key] ? item[key]?.toString().toLowerCase().includes(filters[key].toLowerCase()) : true
    )
  );

  const getUniqueValues = (key) => {
    return [...new Set(data.map((item) => item[key]))].filter(Boolean);
  };

  const columns = [
    { title: "Код керна", dataIndex: "kern_code", key: "kern_code", sorter: (a, b) => a.kern_code.localeCompare(b.kern_code) },
    { title: "Тип повреждения", dataIndex: "damage_type", key: "damage_type", sorter: (a, b) => (a.damage_type || "").localeCompare(b.damage_type || ""),
      render: (damage) => (
        <Tag color={damage ? "red" : "green"}>{damage || "Повреждений нет"}</Tag>
      ),
      filterDropdown: () => (
        <Select
          allowClear
          placeholder="Выберите тип повреждения"
          onChange={(value) => handleFilterChange("damage_type", value)}
          style={{ width: 150 }}
        >
          {getUniqueValues("damage_type").map((damage) => (
            <Option key={damage} value={damage}>{damage}</Option>
          ))}
        </Select>
      )
    },
    { title: "Лаборатория", dataIndex: "lab_name", key: "lab_name", sorter: (a, b) => a.lab_name.localeCompare(b.lab_name),
      filterDropdown: () => (
        <Select
          allowClear
          placeholder="Выберите лабораторию"
          onChange={(value) => handleFilterChange("lab_name", value)}
          style={{ width: 150 }}
        >
          {getUniqueValues("lab_name").map((lab) => (
            <Option key={lab} value={lab}>{lab}</Option>
          ))}
        </Select>
      )
    },
    { title: "Дата обновления", dataIndex: "last_date", key: "last_date", sorter: (a, b) => new Date(a.last_date) - new Date(b.last_date),
      render: (date) => moment(date).format("DD.MM.YYYY HH:mm")
    },
    { title: "Пользователь", dataIndex: "user_name", key: "user_name", sorter: (a, b) => a.user_name.localeCompare(b.user_name),
      filterDropdown: () => (
        <Select
          allowClear
          placeholder="Выберите пользователя"
          onChange={(value) => handleFilterChange("user_name", value)}
          style={{ width: 150 }}
        >
          {getUniqueValues("user_name").map((user) => (
            <Option key={user} value={user}>{user}</Option>
          ))}
        </Select>
      )
    }
  ];

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Поиск"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 200 }}
        />
        <Button onClick={fetchData} type="primary">Обновить</Button>
        <Button onClick={resetFilters} type="primary" danger>Сбросить фильтры</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record)
        })}
        size="small"
      />
      {selectedKern && <KernDetailsModal id={selectedKern} onClose={() => setSelectedKern(null)} />}
    </div>
  );
};

export default MonitoringPage;
