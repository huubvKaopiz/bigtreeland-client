import { Form, Modal, Button, Input, Select, DatePicker, Divider, Upload } from "antd";
import React, { useState } from "react";
import moment from 'moment';
// import numeral from "numeral";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import { EmployeeType } from "interface";



interface PropsType {
    employee:EmployeeType;
}
const dateFormat = 'DD/MM/YYYY';

export default function UpdateEmplyeeForm(props:PropsType): JSX.Element {
    const {employee} = props;
    const [show, setShow] = useState(false);



     function handleReset() {
        console.log('reset');
        
    }

    const normFile = () => {
        // console.log('Upload event:', e);
        // if (Array.isArray(e: {name:'string'})) {
        //   return e;
        // }
        // return e && e.fileList;
      };

      console.log(employee);

    const IsNumeric = { pattern: /^-{0,1}\d*\.{0,1}\d+$/, message: "Giá trị nhập phải là số" };
    return (
        <div>
            <Button type="link" icon={<EditOutlined />} onClick={() => setShow(true)}/>
            <Modal
                width={1000}
                visible={show}
                onCancel={()=>setShow(false)}
                closable={true}
                okText='Lưu thông tin'
                cancelText='Huỷ bỏ'
                footer = {[
                    <Button key="cancel">Huỷ bỏ</Button>,
                    <Button key="submit" htmlType="submit" form="ueForm"></Button>
                ]}
            >
                <Form
                    id="ueForm"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    initialValues={{ 
                        'name':employee.name,
                        'phone':employee.phone,
                        'gender':employee.gender,
                        'address':employee.address,
                        'interests':employee.interests,
                        'disklikes':employee.dislikes,
                        'basic_salary':employee.employee_contract.basic_salary,
                        'position':employee.employee_contract.position,
                    }}
                    // onValuesChange={}
                >
                     <Divider >Thông tin cơ bản</Divider>
                    <Form.Item name='name' label="Họ tên" rules={[{required:true, message:'Họ tên không được để trống!'}]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='phone' label="Số điện thoại" rules={[{required:true, message:'Số điện thoại không được để trống!'}]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name ='gender'label="Giới tính">
                        <Select>
                            <Select.Option value={0}>Nam</Select.Option>
                            <Select.Option value={1}>Nữ</Select.Option>
                            <Select.Option value={2}>Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name='birthday' label="Ngày sinh">
                        <DatePicker defaultValue={moment(employee.birthday)} format={dateFormat} />
                    </Form.Item>
                    <Form.Item name='address' label="Địa chỉ">
                        <Input />
                    </Form.Item>
                    <Form.Item name='interests' label="Sở thích">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name='dislikes' label="Sở ghét">
                        <Input.TextArea />
                    </Form.Item>
                    <Divider >Thông tin hợp đồng</Divider>
                    <Form.Item  name='identify' label="Số CMT/CCCD">
                        <Input />
                    </Form.Item>
                    <Form.Item rules={[IsNumeric]} name={['contract', 'basic_salary']} label="Lương cơ bản">
                        <Input />
                    </Form.Item>
                    <Form.Item name={['contract', 'sales_salary']} label="Lương doanh số">
                        <Input />
                    </Form.Item>
                    <Form.Item  name={['contract', 'position']} label="Vị trí">
                        <Input />
                    </Form.Item>
                    <Form.Item  name={['contract', 'working_date']} label="Ngày vào làm">
                        <DatePicker />
                    </Form.Item>
                    <Form.Item
                        name={['contract', 'contract_file']}
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