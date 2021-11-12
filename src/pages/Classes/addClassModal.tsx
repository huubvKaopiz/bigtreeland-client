
import React, { useEffect, useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Select,
} from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import { RootState, useAppDispatch } from 'store/store';
import { useSelector } from 'react-redux';
import { actionAddClass, actionGetClasses } from 'store/classes/slice';
import { actionGetEmployees } from 'store/employees/slice';
import { get } from 'lodash';
import { EmployeeType } from 'interface';


export default function AddClassModal(): JSX.Element {
    const [show, setShow] = useState(false);
    const dispatch =  useAppDispatch();
    const addStatus =  useSelector((state:RootState) => state.classReducer.addClassStatus);

    useEffect(()=>{
        if(addStatus === 'success'){
            setShow(false);
            dispatch(actionGetClasses({page:1}));
        }
    },[dispatch, addStatus]);

    useEffect(()=>{
        dispatch(actionGetEmployees({class_id:0}))
    }, [dispatch])

    function handleSubmit(values:any) {
        dispatch(actionAddClass(values))
    }

    const teachers =  useSelector((state:RootState) => state.employeeReducer.employees);

    return (
        <div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShow(true)}>Thêm lớp học</Button>
            <Modal visible={show} title="Thêm lớp học" onCancel={() => setShow(false)}
                footer={[
                    <Button key="btnsubmit" type="primary" htmlType="submit" form="aForm">Lưu lại</Button>
                ]}
                width={800}
            >
                <Form
                    id="aForm"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 17 }}
                    layout="horizontal"
                    // initialValues={}
                    onFinish={handleSubmit}
                >
            
                <Form.Item label="Tên lớp" name="name">
                    <Input />
                </Form.Item>
                <Form.Item label="Giáo viên" name="employee_id">
                    <Select>
                        <Select.Option value={-1}>Chọn sau</Select.Option>
                        {
                            teachers && get(teachers,"data",[]).map((tc:EmployeeType) => {
                                return(
                                <Select.Option value={tc.id} key={tc.id}>{tc.name} - {tc.user.phone}</Select.Option>
                                )
                            })
                        }
                    </Select>
                </Form.Item>
                <Form.Item label="Số buổi học" name="sessions_num">
                    <Input />
                </Form.Item>
                <Form.Item label="Học phí" name="fee_per_session">
                    <Input />
                </Form.Item>
                <Form.Item label="Lịch học" name="schedule">
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
        </div >
    )
}