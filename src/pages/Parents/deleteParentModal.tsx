import {Button, Tooltip} from 'antd';
import {DeleteOutlined } from "@ant-design/icons";
import { ParentType } from 'interface';
import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { RootState, useAppDispatch } from 'store/store';
import Modal from 'antd/lib/modal/Modal';

export default function DeleteParent(props:{parent:ParentType}):JSX.Element {
    const {parent} = props;
    const [show, setShow] = useState(false);
    // const distpatch = useAppDispatch();
    // const status = useSelector((state:RootState) => state.parentReducer.updateParentStatus);

    const handleSubmit = () => {
       console.log("delete parent: ", parent.name)
    }
    return(
        <div>
            <Tooltip placement="top" title="Xoá"> <Button danger type="text" icon={<DeleteOutlined />} onClick={()=>setShow(true)}/></Tooltip>
            <Modal
                title="Xoá thông tin phụ huynh!"
                closable={true}
                visible={show}
                onCancel={()=>setShow(false)}
                footer={[
                    <Button key="btnCancel" >Huỷ bỏ</Button>,
                    <Button key="btnSubmit" danger type="primary" onClick={handleSubmit}>Xoá</Button>

                ]}
            >
                <span>Bạn thật sự muốn xoá thông tin này</span>
            </Modal>
        </div>
    )
}