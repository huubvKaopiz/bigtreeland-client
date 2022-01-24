import { Button, Form, Input } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import React, { useState } from 'react';
import { actionChangePassword } from 'store/auth/slice';
import { useAppDispatch } from 'store/store';

export function ChangePasswordForm(): JSX.Element {
    const [show, setShow] = useState(false);
    const dispatch = useAppDispatch();

    function handleSubmit(values: any) {
        // console.log(values)
        dispatch(actionChangePassword(values)).finally(()=>setShow(false))
    }

    return (
        <>
            <Button type="link" onClick={()=>setShow(true)}>Thay đổi mật khẩu</Button>
            <Modal
                title="Thay đổi mật khẩu"
                visible={show} width={600}
                closable onCancel={() => setShow(false)}
                footer={[
                    <Button key="btnsubmit" type="primary" htmlType="submit" form="cForm">
                        Gửi lên
                    </Button>
                ]}
            >
                <Form
                    name="basic"
                    id="cForm"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 14 }}
                    initialValues={{ remember: true }}
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="current_password"
                        rules={[{ required: true, message: 'Trường này không được để trống!' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới"
                        name="new_password"
                        rules={[{ required: true, message: 'Trường này không được để trống!' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}   