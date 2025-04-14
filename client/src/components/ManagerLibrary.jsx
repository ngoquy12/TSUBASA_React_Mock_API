import {
  Button,
  Form,
  Input,
  message,
  Modal,
  notification,
  Space,
  Table,
} from "antd";
import { HttpStatusCode } from "axios";
import React, { useEffect, useState } from "react";
import http from "../utils/http";
import useDounce from "../hooks/useDounce";

export default function ManagerLibrary() {
  const [libraries, setLibraries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
  const [id, setId] = useState(null); // Id quản lý trạng thái của việc sửa, xóa,...
  const [isShowModal, setIsShowModal] = useState(false);
  const [form] = Form.useForm();
  const [inputValue, setInputValue] = useState("");

  // Sử dụng cusome hook useDebounce
  const delaySearch = useDounce(inputValue, 500);

  //   Gọi API lấy danh sách quản lý thư viện
  const getAllLibrary = async () => {
    // Hiển thị loading
    setIsLoading(true);
    try {
      const response = await http.get(`libraries?bookName_like=${delaySearch}`);

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
  }, [delaySearch]);

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
      if (response.status === HttpStatusCode.Ok) {
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

  // Hàm mở modal chỉnh sửa
  const handleShowModalEdit = (id) => {
    // Mở modal
    setIsShowModal(true);

    // Tìm kiếm thông tin theo id
    const findInfo = libraries.find((library) => library.id === id);

    // Fill dữ liệu của thông tin vào trong Form
    form.setFieldsValue(findInfo);

    // Cập nhật lại id cần sửa
    setId(id);
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
          <a onClick={() => handleShowModalEdit(record.id)}>Edit</a>
          <a onClick={() => handleShowModalDelete(record.id)}>Delete</a>
        </Space>
      ),
    },
  ];

  // Hàm mở modal thêm mới
  const handleShowModal = () => {
    setIsShowModal(true);
  };

  // Hàm đóng modal thêm mới
  const handleCloseModal = () => {
    setIsShowModal(false);

    // Cập nhật lại id
    setId(null);
  };

  const onFinish = async (values) => {
    // Gọi API thêm mới thông tin
    try {
      if (id) {
        // Tiến hành cập nhật
        await http.put(`libraries/${id}`, values);

        // Kiểm tra điều kiện
      } else {
        // Tiến hành thêm
        await http.post("libraries", values);
      }

      // Tắt modal
      handleCloseModal();

      // Render lại giao diện
      getAllLibrary();

      // Hiển thị thông báo
      notification.success({
        message: "Thành công",
        description: `${id ? "Thêm mới" : "Cập nhật"} thông tin thành công`,
      });
    } catch (error) {
      notification.success({
        message: "Thất bại",
        description: `${id ? "Cập nhật" : "Thêm mói"} thông tin thất bại`,
      });
    }
  };

  return (
    <>
      {/* Modal thêm mới/sửa thông tin */}
      <Modal
        onCancel={handleCloseModal}
        open={isShowModal}
        title={`${id ? "Cập nhật" : "Thêm mới"} thông tin`}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
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
            <Button onClick={handleCloseModal} htmlType="button">
              Hủy
            </Button>
            <Button className="ml-2" type="primary" htmlType="submit">
              {id ? "Lưu" : "Thêm"}
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
          <Button onClick={handleShowModal} type="primary">
            Thêm thông tin
          </Button>
        </header>

        <div className="mb-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <main>
          <Table
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={libraries}
          />
        </main>
      </div>
    </>
  );
}
