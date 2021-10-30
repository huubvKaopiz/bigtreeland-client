import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchUsers } from "../../store/counter/slice";
import { RootState, useAppDispatch } from "../../store/store";
import { get } from "lodash";
import { notification, Spin, Layout, Table, Space, Button, Input, Modal, Form } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { User } from "../../utils/interfaces";
import ChangePassForm from "./changePassForm";

export default function Users(): JSX.Element {
  const dispatch = useAppDispatch();
  const users = useSelector((state: RootState) => state.counter.users);
  const [loading, setLoading] = useState(false);
  const [showAddFrom, setShowAddForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchUsers({ search: "" }))
      .then((res) => {
        console.log(res);
        if (get(res, "error", null)) {
          notification.error({
            message: get(res, "error.message", "Có lỗi xảy ra"),
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch]);

  function handleChangePass(user: User) {
    console.log(user.email);
  }

  function handleDeactive(user: User) {
    console.log(user.email);
  }

  function handleSetPermission(user: User) {
    console.log(user.email);
  }

  function handleAdduser() {
    console.log("handle add new user");
  }

  const ColActions = (user: User) => {
    return (
      <Space size="middle">
        <ChangePassForm user={user} />
        <Button size="small" danger onClick={() => handleDeactive(user)}>Vô hiệu hoá</Button>
        <Button size="small" type="primary" onClick={() => handleSetPermission(user)}>Phân quyền</Button>
      </Space>
    );
  }
  ColActions.displayName = "ColActions";

  const from_layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };

  const dataSource: User[] = [
    {
      email: "nhamtkdh92@gmail.com",
      phone: "0987654321",
      role: "admin"
    },
    {
      email: "quynhcho@gmail.com",
      phone: "123456789",
      role: "teacher"
    },
    {
      email: "huubuivan@gmail.com",
      phone: "1345282122",
      role: "parent"
    }
  ];

  const columns = [

    {
      width: '25%',
      title: "Email",
      dataIndex: "email",
      key: "email"
    },
    {
      width: '20%',
      title: "Phone",
      dataIndex: "phone",
      key: "phone"
    },
    {
      width: '20%',
      title: "Role",
      dataIndex: "role",
      key: "role"
    },
    {
      width: '35%',
      title: "Action",
      key: "action",
      render: ColActions
    },
  ]

  return (
    <Layout.Content style={{ height: "100vh", padding: 20 }}>
      <Spin spinning={loading}>
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
          <Input placeholder="serach buy phone or email" prefix={<SearchOutlined />} />
          <div style={{ marginLeft: 20 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAddForm(true)}>Thêm người dùng</Button>
            <Modal
              title="Thêm tài khoàn người dùng mới"
              centered
              visible={showAddFrom}
              onCancel={() => setShowAddForm(false)}
              footer={false}
            >
              <Form {...from_layout} name="nest-messages" onFinish={handleAdduser}>
              
                <Form.Item name={['user', 'email']} label="Email" rules={[{ type: 'email' }]}>
                  <Input />
                </Form.Item>
              
                <Form.Item name={['user', 'phone']} label="Số điện thoại">
                  <Input />
                </Form.Item>
                <Form.Item name={['user', 'password']} label="Mật khẩu">
                  <Input.Password />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8 }}>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </div>
        <Table dataSource={dataSource} columns={columns} bordered />
      </Spin>
    </Layout.Content>
  );
}
