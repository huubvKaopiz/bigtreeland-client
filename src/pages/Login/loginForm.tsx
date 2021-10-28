import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../store/store";
import { Layout, Form, Input, Button, Checkbox, notification } from "antd";
import { actionLogin } from "../../store/auth/slice";
import { get } from "lodash";
import { Redirect } from "react-router-dom";
import useIsMounted from "../../hooks/useIsMounted";
import validateMessage from "../../lib/validateMessage";
import logo from "../../assets/image/mainlogo.png";

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
      <Content>
        <section
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "rgba(240, 242, 245, 0.1)",
          }}
        >
          <div>
            <div>
              <h1
                style={{
                  color: "#141414",
                  fontSize: 48,
                  fontWeight: 700,
                  letterSpacing: -0.3,
                  margin: "0px 0px 15px",
                  textAlign: "left",
                  paddingLeft: 20,
                  lineHeight: "72px",
                  fontFamily: "sans-serif",
                }}
              >
                Sign In
              </h1>
              <h5
                style={{
                  color: "#8c8c8c",
                  fontSize: 20,
                  letterSpacing: -0.3,
                  margin: "0px 0px 15px",
                  textAlign: "left",
                  paddingLeft: 20,
                  lineHeight: "30px",
                  fontFamily: "sans-serif",
                }}
              >
                Enter your email and password to sign in
              </h5>
            </div>

            <Form
              style={{
                display: "block",
                margin: "auto auto",
                width: 500,
                paddingTop: 20,
                paddingLeft: 20,
                paddingRight: 30,
                paddingBottom: 20,
              }}
              name="basic"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
            >
              <Form.Item
                label="Email/Phone"
                name="email"
                rules={[{ required: true, message: validateMessage.REQUIRE }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: validateMessage.REQUIRE }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="remember"
                valuePropName="checked"
                wrapperCol={{ offset: 0, span: 16 }}
              >
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  style={{ display: "block", width: "100%" }}
                  type="primary"
                  htmlType="submit"
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
          </div>
          <img
            style={{ maxWidth: "50%", margin: "auto 0", paddingRight: 200 }}
            src={logo}
            alt=""
          />
        </section>
      </Content>
    </Layout>
  );
}

export default LoginForm;
