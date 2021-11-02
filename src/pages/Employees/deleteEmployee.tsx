import { Button, Space } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useState } from "react";
import {DeleteOutlined } from "@ant-design/icons";


export default function DeleteEmployeeModal(): JSX.Element {
    const [show, setShow] = useState(false);

    function handleDelete(){
        console.log("Xoá nhân viên");
    }
    return (
       <Space>
           <Button type="link" icon={<DeleteOutlined />} danger onClick={() => setShow(true)}/>
           <Modal 
            visible={show}
            title="Bạn muốn xoá nhân viên này"
            onCancel= {() => setShow(false)}
            onOk = {handleDelete}
            centered
        >
            <p>Khi xoá nhân viên thì tất cả những thông tin liên quan đến nhân viên có thể bị xoá và không thể phục hồi được!</p>

        </Modal>
       </Space>
    )
}