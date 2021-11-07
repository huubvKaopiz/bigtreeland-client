import { Button, Space } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useState } from "react";
import {DeleteOutlined,WarningOutlined } from "@ant-design/icons";
import { EmployeeType } from "interface";
import { RootState, useAppDispatch } from "store/store";
import { useSelector } from "react-redux";
import { actionDeleteEmployee, actionGetEmployees } from "store/employees/slice";

export default function DeleteEmployeeModal(props:{employee:EmployeeType}): JSX.Element {
    const {employee} = props;
    const [show, setShow] = useState(false);
    const dispatch = useAppDispatch();
    const status = useSelector((state:RootState) => state.employeeReducer.deleteEmployeeStatus);

    useEffect(()=>{
        if(status === 'success'){
            setShow(false);
            dispatch(actionGetEmployees({}));
        }
    },[status, dispatch]);

    function handleDelete(){
        console.log("Xoá nhân viên");
        dispatch(actionDeleteEmployee(employee.id));
    }
    return (
       <Space>
           <Button type="link" icon={<DeleteOutlined />} danger onClick={() => setShow(true)}/>
           <Modal 
            visible={show}
            title={<><WarningOutlined twoToneColor="#eb2f96" /> Bạn muốn xoá nhân viên </>}
            onCancel= {() => setShow(false)}
            onOk = {handleDelete}
            centered
        >
            <p>Khi xoá nhân viên thì tất cả những thông tin liên quan đến nhân viên có thể bị xoá và không thể phục hồi được!</p>

        </Modal>
       </Space>
    )
}