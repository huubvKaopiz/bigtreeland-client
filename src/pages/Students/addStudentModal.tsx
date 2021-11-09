
import React, { useEffect, useState } from 'react';
import {
    Button,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    InputNumber,
    Switch,
} from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import { RootState, useAppDispatch } from 'store/store';
import { useSelector } from 'react-redux';
import { actionAddStudent, actionGetStudents } from 'store/students/slice';
import { ParentType } from 'interface';
import moment from 'moment';
import { actionGetParents } from 'store/parents/slice';
import { get } from 'lodash';

export default function AddStudentModal(): JSX.Element {
    const [show, setShow] = useState(false);
    const dispatch = useAppDispatch();
    const status = useSelector((state: RootState) => state.studentReducer.addStudentStatus);
  
    useEffect(() => {
        if (status === "success") {
            setShow(false);
            dispatch(actionGetStudents({ page: 1 }));
        }
    }, [status, dispatch]);

    useEffect(()=>{
       if(parent === null || show === true){
        dispatch(actionGetParents({}));
       }
    })

    const parents = useSelector((state: RootState) => state.parentReducer.parents);
  
    const listParents:ParentType[] = get(parents,"data",[]);

    const handleSubmit = (values: any) => {
        console.log("submit form:", values);
        const data = { 
            ...values, 
            birthday: moment(values.birthday).format("YYYY-MM-DD"), 
            admission_date: moment(values.admission_date).format("YYYY-MM-DD"),
            is_special: values.is_special === true ? 1 : 0, 
        }
        dispatch(actionAddStudent(data));
    }

    console.log(listParents)
    return (
        <div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShow(true)}>Thêm học sinh</Button>
            <Modal
                visible={show}
                title="Thông tin học sinh"
                onCancel={() => setShow(false)}
                width={1000}
                footer={[
                    <Button key="btnCancel" onClick={() => setShow(false)}>Huỷ bỏ</Button>,
                    <Button type="primary" key="btnSubmit" htmlType="submit" form="sForm">Lưu thông tin</Button>
                ]}
            >
                <Form
                    id="sForm"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    onFinish={handleSubmit}
                >
                    <Form.Item label="Họ và tên" name="name">
                        <Input />
                    </Form.Item>
                    <Form.Item name="parent_id" label="Phụ huynh">
                        <Select>
                            {
                                listParents.map((parent: ParentType) => {
                                    return (
                                        <Select.Option key={parent.id} value={parent.id}>{parent.name} - {parent.user.phone}</Select.Option>
                                    )
                                })
                            }

                        </Select>
                    </Form.Item>
                    <Form.Item name="gender" label="Giới tính" wrapperCol={{ span: 2 }}>
                        <Select>
                            <Select.Option value={1}>Nam</Select.Option>
                            <Select.Option value={0}>Nữ</Select.Option>
                            <Select.Option value={2}>Khác</Select.Option>

                        </Select>
                    </Form.Item>
                    <Form.Item name="birthday" label="Sinh nhật" >
                        <DatePicker />
                    </Form.Item>
                    <Form.Item name="school" label="Trường đang học">
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input />
                    </Form.Item>
                    <Form.Item name="admission_date" label="Ngày nhập học">
                        <DatePicker />
                    </Form.Item>
                    <Form.Item name="knowledge_status" label="Tình trạng đầu vào">
                        <InputNumber />
                    </Form.Item>
                    <Form.Item name="is_special" label="Trường hợp đặc biệt" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="personality" label="Tính cách">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="interests" label="Sở thích">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="dislikes" label="Sở ghét">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="hope" label="Ước mơ">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}