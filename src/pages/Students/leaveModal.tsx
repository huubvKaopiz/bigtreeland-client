import { MinusCircleOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import React, { useState } from 'react';

export default function LeaveModal(props: { studen_id: number }): JSX.Element {
    const { studen_id } = props;
    const [show, setShow] = useState(false);
    
    const handleSubmit = () => {
        console.log("student:", studen_id)
    }
    return (
        <>
            <Tooltip placement="top" title="Đổi trạng thái nghỉ"><Button onClick={() => setShow(true)} type="link" danger icon={<MinusCircleOutlined />} /></Tooltip>
            <Modal
                title="Đổi trạng thái nghỉ học"
                visible={show}
                closable={true}
                onCancel={() => setShow(false)}
                footer={[
                    <Button key="btnSubmit" type="primary" onClick={handleSubmit} >Lưu lại</Button>
                ]}
            >
                Sau khi đổi, thông tin học sinh sẽ không hiển thị trong danh sách nữa.
                
            </Modal>
        </>
    )
}