import { Button, DatePicker, Form, Input, InputNumber, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import Modal from 'antd/lib/modal/Modal';
import { RootState, useAppDispatch } from 'store/store';
import { useSelector } from 'react-redux';
import { actionGetEmployees } from 'store/employees/slice';
import { get } from 'lodash';
import moment from 'moment';
const { Option } = Select;
export default function AddSalary(): JSX.Element {
    const dispatch = useAppDispatch();
    const [showModal, setShowModal] = useState(false);
    const emloyees = useSelector((state: RootState) => state.employeeReducer.employees);

    useEffect(() => {
        dispatch(actionGetEmployees())
    }, [dispatch])



    const formLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
    };
    return (
        <>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowModal(true)}>Tạo bảng lương mới</Button>
            <Modal
                width={800}
                closable
                visible={showModal}
                title="Lập bảng lương"
                onCancel={() => setShowModal(false)}
            >
                <Form {...formLayout} name="nest-messages" >

                    <Form.Item name='employee_id' label="Chọn nhân viên" rules={[{ required: true }]}>
                        <Select
                            allowClear
                            showSearch
                            style={{ width: 350 }}
                            placeholder="Search to Select"
                            optionFilterProp="children"

                            filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                        >
                            {
                                get(emloyees, "data", []).map((e) => <Option value={e.id} key={e.id}><a>{e.name}</a> - {e.phone}</Option >)
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item label="Lương cơ bản" name="basic_salary">
                        <Input style={{ width: '40%' }}  />
                    </Form.Item>
                    <Form.Item label="Lương doanh thu" name="basic_salary" >
                        <Input style={{ width: '40%' }} />
                    </Form.Item>
                    <Form.Item label="Lương thưởng" name="bonus" >
                        <Input style={{ width: '40%' }} />
                    </Form.Item>
                    <Form.Item label="Lương trừ" name="debt" >
                        <Input style={{ width: '40%' }} />
                    </Form.Item>
                    <Form.Item name='note' label="Ghi chú">
                        <Input.TextArea />
                    </Form.Item>
                    {/* <Form.Item label="Ngày lập">
                        <DatePicker defaultValue={moment(new Date())} style={{ width: '30%' }}/>
                    </Form.Item> */}

                </Form>
            </Modal>
        </>
    )
}