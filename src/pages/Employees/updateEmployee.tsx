import { Form, Modal, Button, Input, Select, DatePicker, Divider } from "antd";
import React, { useState } from "react";
import { EditOutlined } from "@ant-design/icons";
type SizeType = Parameters<typeof Form>[0]['size'];

export default function UpdateEmplyeeForm(): JSX.Element {
    const [show, setShow] = useState(false);
    const [componentSize, setComponentSize] = useState<SizeType | 'default'>('default');
    const onFormLayoutChange = ({ size }: { size: SizeType }) => {
        setComponentSize(size);
    };
    return (
        <div>
            <Button type="link" icon={<EditOutlined />} onClick={() => setShow(true)}/>
            <Modal
                width={1000}
                visible={show}
                onCancel={() => setShow(false)}
                closable={false}
            >
                <Form
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    initialValues={{ size: componentSize }}
                    onValuesChange={onFormLayoutChange}
                    size={componentSize as SizeType}
                >
                     <Divider >Thông tin cơ bản</Divider>
                    <Form.Item label="Họ tên" rules={[{required:true, message:'Họ tên không được để trống!'}]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" rules={[{required:true, message:'Số điện thoại không được để trống!'}]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Giới tính">
                        <Select>
                            <Select.Option value={0}>Nam</Select.Option>
                            <Select.Option value={1}>Nữ</Select.Option>
                            <Select.Option value={2}>Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Ngày sinh">
                        <DatePicker />
                    </Form.Item>
                    <Form.Item label="Địa chỉ">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Sở thích">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item label="Sở ghét">
                        <Input.TextArea />
                    </Form.Item>
                    <Divider >Thông tin hợp đồng</Divider>
                    <Form.Item label="Số CMT/CCCD">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Lương cơ bản">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )

}