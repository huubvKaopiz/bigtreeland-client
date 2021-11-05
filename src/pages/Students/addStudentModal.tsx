
import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { PlusOutlined } from "@ant-design/icons";

export default function AddStudentModal(): JSX.Element {
    const [show, setShow] = useState(false);
    return (
        <div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShow(true)}>Thêm lớp học</Button>
            <Modal visible={show} title="Thêm lớp học" onCancel={()=>setShow(false)}>

            </Modal>
        </div>
    )
}