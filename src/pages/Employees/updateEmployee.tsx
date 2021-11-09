import { Form, Modal, Button, Input, Select, DatePicker, Divider, Upload, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import moment from 'moment';
// import numeral from "numeral";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import { EmployeeType } from "interface";
import { actionGetEmployees, actionUpdateEmployee, EmployeeParams } from "store/employees/slice";
import { RootState, useAppDispatch } from "store/store";
import { useSelector } from "react-redux";



interface PropsType {
    employee:EmployeeType;
}
const dateFormat = 'DD/MM/YYYY';

export default function UpdateEmplyeeForm(props:PropsType): JSX.Element {
    const {employee} = props;
    const [show, setShow] = useState(false);
    const dispatch = useAppDispatch();
    const status = useSelector((state:RootState) => state.employeeReducer.updateEmployeeStatus);

    useEffect(()=>{
        if(status==='success'){
            setShow(false);
            dispatch(actionGetEmployees({}));
        }
    },[status, dispatch]);

    const handleSubmit = (values:any) => {
        const data:EmployeeParams = {
            name:values.name,
            email:values.email,
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
        const params = {
            data,
            eID:employee.id
        }
        dispatch(actionUpdateEmployee(params));
    }
      console.log(employee);

    const IsNumeric = { pattern: /^-{0,1}\d*\.{0,1}\d+$/, message: "Giá trị nhập phải là số" };
    return (
        <div>
            <Tooltip placement="top" title="Sửa thông tin"><Button type="link" icon={<EditOutlined />} onClick={() => setShow(true)}/></Tooltip>
            <Modal
                width={1000}
                visible={show}
                onCancel={()=>setShow(false)}
                closable={true}
                okText='Lưu thông tin'
                cancelText='Huỷ bỏ'
                footer = {[
                    <Button key="cancel" onClick={()=> setShow(false)}>Huỷ bỏ</Button>,
                    <Button type="primary" key="submit" htmlType="submit" form="ueForm">Lưu thông tin</Button>
                ]}
            >
                <Form
                    id="ueForm"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    initialValues={{ 
                        'name':employee.name,
                        'email':employee.email,
                        'phone':employee.phone,
                        'birthday':moment(employee.birthday),
                        'gender':employee.gender,
                        'address':employee.address,
                        'interests':employee.interests,
                        'disklikes':employee.dislikes,
                        'basic_salary':employee.employee_contract && employee.employee_contract.basic_salary,
                        'sales_salary':employee.employee_contract &&  employee.employee_contract.sales_salary,
                        'position':employee.employee_contract &&  employee.employee_contract.position,
                        'working_day':employee.employee_contract &&  moment(employee.employee_contract.working_day)
                    }}
                    // onValuesChange={}
                    onFinish={handleSubmit}
                >
                     <Divider >Thông tin cơ bản</Divider>
                    <Form.Item name='name' label="Họ tên" rules={[{required:true, message:'Họ tên không được để trống!'}]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='email' label="email" rules={[{required:true, message:'Email không được để trống!'}]}>
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
                        <DatePicker format={dateFormat} />
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
                    <Form.Item name='sales_salary' label="Lương doanh số">
                        <Input />
                    </Form.Item>
                    <Form.Item  name= 'position' label="Vị trí">
                        <Input />
                    </Form.Item>
                    <Form.Item  name= 'working_date' label="Ngày vào làm">
                        <DatePicker format={dateFormat} />
                    </Form.Item>
                    <Form.Item
                        name= 'contract_file'
                        label="File đính kèm"
                        valuePropName="fileList"
                        // getValueFromEvent={normFile}
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