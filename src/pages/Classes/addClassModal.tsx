
import React, { useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Select,
} from 'antd';
import { PlusOutlined } from "@ant-design/icons";


export default function AddClassModal(): JSX.Element {
    const [show, setShow] = useState(false);

    function onFormValuesChange() {
        console.log('change values');
    }

    return (
        <div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShow(true)}>Thêm lớp học</Button>
            <Modal visible={show} title="Thêm lớp học" onCancel={() => setShow(false)}>
                <Form
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 17 }}
                    layout="horizontal"
                    // initialValues={}
                    onValuesChange={onFormValuesChange}
                >
            
                <Form.Item label="Tên lớp">
                    <Input />
                </Form.Item>
                <Form.Item label="Giáo viên">
                    <Select>
                        <Select.Option value="demo">Demo</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Số buổi học">
                    <Input />
                </Form.Item>
                <Form.Item label="Học phí">
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
        </div >
    )
}