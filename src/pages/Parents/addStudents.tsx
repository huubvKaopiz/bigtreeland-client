import { Button,Select, Space, Tooltip } from 'antd';
import React, { useState } from 'react';
import { UsergroupAddOutlined } from "@ant-design/icons";
import Modal from 'antd/lib/modal/Modal';


export default function AddStudent(props: { parent_id: number }): JSX.Element {
    const { parent_id } = props;
    const [show, setShow] = useState(false);

    const handlSubmit = () => {
        console.log("add students for parent:", parent_id);
    }
    const selectProps = {
        mode: 'multiple' as const,
        style: { width: '100%' },
        // value,
        // options,
        // onChange: (newValue: string[]) => {
        //   setValue(newValue);
        // },
        placeholder: 'Chọn học sinh...',
        maxTagCount: 'responsive' as const,
      };

    return (
        <>
            <Tooltip placement="top" title="Thêm học sinh">
            <Button icon={<UsergroupAddOutlined />} type="link" onClick={() => setShow(true)} />
            </Tooltip>
            <Modal
                title="Thêm học sinh"
                visible={show}
                onCancel={() => setShow(false)}
                closable={true}
                width={800}
                footer={[
                    <Button type="primary" key="btnsubmit" onClick={handlSubmit}>Lưu lại</Button>
                ]}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Select {...selectProps} />
                </Space>

            </Modal>
        </>
    )
}