
import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { EditOutlined } from "@ant-design/icons";

export default function EditClassModal(): JSX.Element {
    const [show, setShow] = useState(false);
    return (
        <div>
            <Button type="link" icon={<EditOutlined />} onClick={() => setShow(true)} />
            <Modal visible={show} title="Sửa thông tin lớp học" onCancel={()=>setShow(false)}>

            </Modal>
        </div>
    )
}