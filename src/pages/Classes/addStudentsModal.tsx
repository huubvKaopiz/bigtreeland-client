import { PlusOutlined } from "@ant-design/icons";
import { Button, Select } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { StudentType } from 'interface';
import { get } from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { actionAddStudents, actionResetAddStudent } from 'store/classes/slice';
import { RootState, useAppDispatch } from 'store/store';
import { actionGetStudents } from 'store/students/slice';

export default function AddStudentsModal(props: { class_id: string | null }): JSX.Element {
    const { class_id } = props;
    const dispatch = useAppDispatch();
    const [show, setShow] = useState(false);
    const students = useSelector((state: RootState) => state.studentReducer.students);
    const status = useSelector((state:RootState) => state.classReducer.addStudentsStatus);
    const [selectedStudents, setSelectedStudents] = useState([])

    useEffect(() => {
        // dispatch(actionGetStudents({ class_id: 0 }))
        if(status === "success"){
            setShow(false);
            dispatch(actionResetAddStudent())
        }
    }, [dispatch, status])

    useEffect(() => {
        if(show)
            dispatch(actionGetStudents({ class_id: 0 }))
    },[dispatch, show]);
    
    const handleSubmit = () => {
        if (class_id) {
            dispatch(actionAddStudents({ data: { students: selectedStudents }, cID: parseInt(class_id) }))
        }
    }

    const handleChange = (value: any) => {
        setSelectedStudents(value)
    }

    const options: any = [];
    get(students, "data", []).map((student: StudentType) => {
        const label = <><strong>{student.name}</strong> ({moment(student.birthday).format("DD/MM/YYYY")})</>
        options.push({ label, value: student.id })
    })

    return (
        <>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShow(true)}>Thêm học sinh</Button>
            <Modal
                visible={show}
                title="Thêm học sinh vào lớp"
                closable
                onCancel={() => setShow(false)}
                footer={[
                    <Button type="primary" key="btnSubmit" onClick={handleSubmit}>Lưu lại</Button>
                ]}
            >

                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Chọn học sinh"
                    onChange={handleChange}
                    options={options}
                />

            </Modal>
        </>
    )
}