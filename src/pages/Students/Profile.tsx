import { Modal } from 'antd';
// import { useSelector } from 'react-redux';
// import { RootState } from 'store/store';
import { StudentType } from 'interface';
import React, { useState } from 'react';



export default function Profile(props: { student: StudentType }): JSX.Element {
    const { student } = props;
    const [show, setShow] = useState(false);
    // const loadStatus = useSelector((state:RootState) => state.studentReducer.getStudentStatus);

    return (
        <>
            <Modal
                title="Thông tin học sinh"
                visible={show}
                width={1000}
                onCancel={() => setShow(false)}
                closable
            >   
             <label>Họ tên:{student.name}</label>
            </Modal>
        </>
    )
}