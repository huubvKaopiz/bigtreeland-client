import { Button, DatePicker, Form, Modal, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { ClassType } from 'interface';
import { useAppDispatch } from 'store/store';
import { get } from 'lodash';
import moment from 'moment';
import { actionAddStudySummary, actionGetStudySummaryList } from 'store/study-summary/slice';

const { Option } = Select;
const { RangePicker } = DatePicker;
export function CreateStudySummary(
    prop: {
        classList: ClassType[] | null;
    }
): JSX.Element {

    const { classList } = prop;
    const dispatch = useAppDispatch();
    const [show, setShow] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    function submit(values: any) {
        if (values.dateRange == null) return;
        const payload = {
            class_id: values.class_id,
            from_date: moment(values.dateRange[0]).format("YYYY-MM-DD"),
            to_date: moment(values.dateRange[1]).format("YYYY-MM-DD")
        }
        console.log(payload)
        setSubmitting(true);
        dispatch(actionAddStudySummary(payload)).finally(() => {
            setShow(false);
            setSubmitting(false);
            dispatch(actionGetStudySummaryList({}))
        })
    }
    return (
        <>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShow(true)}
            >
                Lập bảng tổng kết
            </Button>

            <Modal
                title="Lập bảng tổng kết"
                visible={show}
                onCancel={() => setShow(false)}
                width={800}
                footer={[
                    <Button key="btnCancel" type="default" >Cancel</Button>,
                    <Button key="btnSubmit" type="primary" htmlType="submit" form="stcreateFrom" loading={submitting}>Submit</Button>,

                ]}
            >
                <Form
                    id="stcreateFrom"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 13 }}
                    layout="horizontal"
                    onFinish={submit}
                >
                    <Form.Item label="Chọn lớp" name="class_id" required>
                        <Select defaultValue={0} style={{ width: 260 }} >
                            <Option value={0}>Tất cả</Option>
                            {classList && classList.map((cl) => (
                                <Option value={cl.id} key={cl.id}>
                                    {" "}
                                    {cl.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Khoảng thời gian" name="dateRange" required>
                        <RangePicker />
                    </Form.Item>
                </Form>

            </Modal>
        </>
    )
}