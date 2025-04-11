import {
  Button,
  Checkbox,
  Form,
  Input,
  message,
  Modal,
  Space,
  Table,
  Tag,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import http from "../utils/http";

export default function ManagerLibrary() {
  const [libraries, setLibraries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
  const [id, setId] = useState(null);

  //   Gọi API lấy danh sách quản lý thư viện
  const getAllLibrary = async () => {
    // Hiển thị loading
    setIsLoading(true);
    try {
      const response = await http.get("libraries");

      if (response.data) {
        setLibraries(response.data);
      }
    } catch (error) {
      message.error("Lấy danh sách mượn trả thất bại");
    } finally {
      // Tắt loading
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllLibrary();
  }, []);

  // Hàm mở modal xác nhận xóa
  const handleShowModalDelete = (id) => {
    // Mở modal xác nhận xóa
    setIsShowModalConfirm(true);

    // Cập nhật lại id cần xóa
    setId(id);
  };

  // Hàm đóng modal xác nhận xóa
  const handleCloseModalDelete = () => {
    // Mở modal xác nhận xóa
    setIsShowModalConfirm(false);

    // Reset lại giá trị của state id
    setId(null);
  };

  // Hàm gọi API xóa thông tin
  const handleDelete = async () => {
    try {
      const response = await http.delete(`libraries/${id}`);

      //  Kiểm tra dữ liệu trả về từ server để xử lý các logic
      if (response.status === 200) {
        // Tắt modal
        handleCloseModalDelete();

        // Render lại giao diện
        getAllLibrary();

        // Thông báo cho người dùng biết là xóa thành công
        message.success("Xóa thông tin thành công");
      }
    } catch (error) {
      message.error("Xóa thông tin thất bại");
    }
  };

  const columns = [
    {
      title: "Tên sách",
      dataIndex: "bookName",
      key: "bookName",
    },
    {
      title: "Sinh viên mượn",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Ngày mượn",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "Ngày trả",
      dataIndex: "endDate",
      key: "endDate",
    },

    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a>Invite {record.name}</a>
          <a onClick={() => handleShowModalDelete(record.id)}>Delete</a>
        </Space>
      ),
    },
  ];

  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      {/* Modal thêm mới/sửa thông tin */}
      <Modal open={false} title="Thêm mới thông tin" footer={null}>
        <Form
          layout="vertical"
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Tên sách"
            name="bookName"
            rules={[
              { required: true, message: "Tên sách không được để trống" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Tên người nhận"
            name="studentName"
            rules={[
              { required: true, message: "Tên người mượn không được để trống" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Ngày mượn"
            name="startDate"
            rules={[
              { required: true, message: "Ngày mượn không được để trống" },
            ]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            label="Ngày trả"
            name="endDate"
            rules={[
              { required: true, message: "Ngày trả không được để trống" },
            ]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item className="flex justify-end gap-3 mb-0">
            <Button htmlType="button">Hủy</Button>
            <Button className="ml-2" type="primary" htmlType="submit">
              Thêm
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        onCancel={handleCloseModalDelete}
        title="Xác nhận"
        open={isShowModalConfirm}
        onOk={handleDelete}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa thông tin này?</p>
      </Modal>

      <div className="flex flex-col">
        <header className="flex items-center justify-between mb-3">
          <h3>Quản lý mượn trả sách</h3>
          <Button type="primary">Thêm thông tin</Button>
        </header>

        <main>
          <Table loading={isLoading} columns={columns} dataSource={libraries} />
        </main>
      </div>
    </>
  );
}
