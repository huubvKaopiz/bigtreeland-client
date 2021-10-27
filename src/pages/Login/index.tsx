import React from "react";
import { Button, Form, Input } from "antd";
import * as message from "../../lib/validateMessage";

import logo from "../../assets/image/mainlogo.png";
import "./index.css";

const requireMessage = message.default.REQUIRE;

export default function Login(): JSX.Element {
  return (
    <section className="login__page">
      <div className="login__form">
        <div>
          <h1>Sign In</h1>
          <h5>Enter your email and password to sign in</h5>
        </div>
        <Form labelCol={{ span: 6 }} labelAlign="left" layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            className="login__form--item"
            rules={[
              {
                required: true,
                message: requireMessage,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            className="login__form--item"
            rules={[
              {
                required: true,
                message: requireMessage,
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button className="login__form--button" type="primary">
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
      <img className="login__logo" src={logo} alt="" />
    </section>
  );
}
