import React, { useState } from "react";

import { Button, Input, Modal, Form } from "antd";
import { User } from "../../utils/interfaces";

interface Props {
  user: User
}

function ChangePassForm(props: Props): JSX.Element {
  const { user } = props;
  const [showForm, setShowForm] = useState(false);
  const from_layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };

  function handleChangePass() {
    console.log(user.email);
  }

  return (
    <div>
      <Button onClick={() => setShowForm(true)}>Đổi mật khẩu </Button>
      <Modal
        title='Thay đổi mật khẩu'
        centered
        visible={showForm}
        onCancel={() => setShowForm(false)}
        footer={false}
      >
        <Form {...from_layout} name="nest-messages" onFinish={handleChangePass}>
          <Form.Item name={['user', 'old_password']} label="Mật khẩu hiện tại">
            <Input.Password />
          </Form.Item>
          <Form.Item name={['user', 'new_password']} label="Mật khẩu mới">
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
  );
}

export default ChangePassForm;
