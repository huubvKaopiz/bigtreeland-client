import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../store/store";
import { Layout, Form, Input, Button, Checkbox, notification } from "antd";
import { actionLogin } from "../../store/auth/slice";
import { get } from "lodash";
import { Redirect } from "react-router-dom";
import useIsMounted from "../../hooks/useIsMounted";

const { Content } = Layout;
interface LoginForm {
  email: string;
  password: string;
}

function LoginForm(): JSX.Element {
  // const counter = useSelector((state: RootState) => state.counter);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const userLogin = useSelector((state: RootState) => state.auth.user);
  const isMounted = useIsMounted();

  const onFinish = (values: LoginForm) => {
    setLoading(true);
    dispatch(actionLogin(values)).then((res) => {
      if (isMounted.current) setLoading(false);
      if (get(res, "error", null)) {
        notification.error({
          message: get(res, "error.message", "Login fail"),
        });
      }
    });
  };

  if (userLogin) return <Redirect to="/" />;

  return (
    <Layout>
      <Content style={{ minHeight: 1500 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 1000,
            backgroundColor: "white",
          }}
        >
          <Form
            style={{
              width: 500,
              paddingTop: 40,
              paddingLeft: 20,
              paddingRight: 30,
              paddingBottom: 20,
            }}
            name="basic"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Email/Phone"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email or phone number!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="remember"
              valuePropName="checked"
              wrapperCol={{ offset: 6, span: 16 }}
            >
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
    </Layout>
  );
}

export default LoginForm;
