import { Form, Modal, Button, Input, Select, DatePicker, Divider, Upload } from "antd";
import React, { useState } from "react";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { EmployeeParams } from "store/employees/slice";
import moment from "moment";

const IsNumeric = { pattern: /^-{0,1}\d*\.{0,1}\d+$/, message: "Giá trị nhập phải là số" };

export default function AddEmplyeeForm({ handleSubmit }: { handleSubmit: (params: EmployeeParams) => void }): JSX.Element {
    const [show, setShow] = useState(false);
    const [employee_form] = Form.useForm();
    const normFile = (e: any) => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {

            return e;
        }
        console.log("files:", e && e.fileList[0].name)
    };

    const submitForm = async (values: any) => {
        const params:EmployeeParams = {
            name:values.name,
            emaul:values.email,
            password:'password',
            phone:values.phone,
            gender:values.gender,
            birthday:moment(values.birthday).format("YYYY-MM-DD"),
            address:values.address,
            interests:values.interests,
            disklikes:values.disklikes,
            identifier:values.identifier,
            basic_salary:values.basic_salary,
            sales_salary:values.sales_salary,
            working_day:moment(values.working_day).format("YYYY-MM-DD"),
            position:values.position,
        }
        handleSubmit(params);
    }

    return (
        <div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShow(true)}>
                Thêm nhân viên
            </Button>
            <Modal
                width={1000}
                visible={show}
                closable={true}
                onCancel={() => setShow(false)}
                footer={[
                    <Button key="" onClick={() => setShow(false)}>
                        Cancel
                    </Button>,
                    <Button type="primary" form="eForm" key="submit" htmlType="submit">
                        Submit
                    </Button>
                ]}
            >
                <Form
                    id="eForm"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    form={employee_form}
                    onFinish={submitForm}
                >
                    <Divider >Thông tin cơ bản</Divider>
                    <Form.Item name='name' label="Họ tên" rules={[{ required: true, message: 'Họ tên không được để trống!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='email' label="Email" rules={[{ required: true, message: 'Email không được để trống!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='phone' label="Số điện thoại" rules={[{ required: true, message: 'Số điện thoại không được để trống!' }, IsNumeric]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='gender' label="Giới tính" rules={[{ required: true, message: 'Giới tính không được để trống!' }]}>
                        <Select>
                            <Select.Option value={1}>Nam</Select.Option>
                            <Select.Option value={0}>Nữ</Select.Option>
                            <Select.Option value={2}>Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name='birthday' label="Ngày sinh" rules={[{ required: true, message: 'Ngày sinh không được để trống!' }]}>
                        <DatePicker />
                    </Form.Item>
                    <Form.Item name='address' label="Địa chỉ">
                        <Input />
                    </Form.Item>
                    <Form.Item name='interests' label="Sở thích">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name='disklikes' label="Sở ghét">
                        <Input.TextArea />
                    </Form.Item>
                    <Divider >Thông tin hợp đồng</Divider>
                    <Form.Item name='identifier' label="Số CMT/CCCD" rules={[IsNumeric]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='basic_salary' label="Lương cơ bản" rules={[IsNumeric]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='sales_salary' label="Lương doanh số" rules={[IsNumeric]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='position' label="Vị trí">
                        <Input />
                    </Form.Item>
                    <Form.Item name='working_day' label="Ngày vào làm">
                        <DatePicker />
                    </Form.Item>
                    <Form.Item
                        name="contract_file"
                        label="File đính kèm"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                    >
                        <Upload name="logo" action="/upload.do" listType="picture">
                            <Button icon={<UploadOutlined />}>Click to upload</Button>
                        </Upload>
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    )

}