import { Button, Tooltip, Space, Select } from 'antd';
import { ImportOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import Modal from 'antd/lib/modal/Modal';

export default function ImportClass(props: { studen_id: number }): JSX.Element {
    const { studen_id } = props;
    const [show, setShow] = useState(false);

    const selectProps = {
        // mode: 'multiple' as const,
        style: { width: '100%' },
        // value,
        // options,
        // onChange: (newValue: string[]) => {
        //   setValue(newValue);
        // },
        placeholder: 'Chọn lớp học...',
        maxTagCount: 'responsive' as const,
      };
    
    const handleSubmit = () => {
        console.log("student:", studen_id)
    }
    return (
        <>
            <Tooltip placement="top" title="Nhập lớp"><Button onClick={() => setShow(true)} type="link" icon={<ImportOutlined />} /></Tooltip>
            <Modal
                title="Nhập lớp học"
                visible={show}
                closable={true}
                onCancel={() => setShow(false)}
                footer={[
                    <Button key="btnSubmit" type="primary" onClick={handleSubmit}>Lưu lại</Button>
                ]}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Select {...selectProps} />
                </Space>
            </Modal>
        </>
    )
}