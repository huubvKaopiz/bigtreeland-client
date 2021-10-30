import React from "react";
// import { useSelector } from "react-redux";
// import { RootState, useAppDispatch } from "../../store/store";
import { Layout, Form, Input, Button, Checkbox } from "antd";

const { Content } = Layout;
interface LoginForm {
    email: string
    password: string
}

function LoginForm(): JSX.Element {
    // const counter = useSelector((state: RootState) => state.counter);
    // const dispatch = useAppDispatch();

    const onFinish = (values: LoginForm) => {
        console.log('Success:', values);
    };
    return (
        <Layout style={{minHeight:1000}}>
            <Content  >
                <div  style={{ display: "flex", justifyContent: "center", alignItems: "center", height:"100vh", backgroundColor: "white" }}>
                    <Form
                        style={{ width: 500, paddingTop: 40, paddingLeft: 20, paddingRight: 30, paddingBottom: 20 }}
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
                            rules={[{ required: true, message: 'Please input your email or phone number!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item name="remember" valuePropName="checked" wrapperCol={{ offset: 6, span: 16 }}>
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                            <Button type="primary" htmlType="submit">
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
