import { Button, Tooltip, Space, Select, Spin } from 'antd';
import { ImportOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import Modal from 'antd/lib/modal/Modal';
import { ListClassesType, ClassType, StudentType } from 'interface';
import { get } from 'lodash';
import { useAppDispatch } from 'store/store';
import { actionUpdateStudent } from 'store/students/slice';

export default function ImportClass(props: { student: StudentType, classesList: ListClassesType | null, searchClass: (search: string) => void, searchStatus: string }): JSX.Element {
    const { student, classesList, searchClass, searchStatus } = props;
    const [show, setShow] = useState(false);
    const [classID, setClassID] = useState(null);
    const dispatch = useAppDispatch();

    const handleSelected = (value:any) =>{
        setClassID(value);
    }

    const handleSubmit = () => {
       if(classID){
        //    dispatch(actionUpdateStudent({
        //         data:{
        //             ...student,
        //             class_id:classID
        //         }
        //    }))
       }
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
                    <Select
                        style={{ width: '100%' }} 
                        placeholder="Chọn lớp" 
                        onChange={handleSelected}
                        showSearch
                        onSearch={(e) => searchClass(e)}
                        notFoundContent={searchStatus === 'loading' ? <Spin size="small" /> : null}
                        defaultValue={get(student,"class.id",0)}
                    >
                        {get(classesList, "data", []).map((cl: ClassType) => {
                            return (
                                <Select.Option key={cl.id} value={cl.id}>
                                    {cl.name}
                                </Select.Option>
                            );
                        })}
                    </Select>
                </Space>
            </Modal>
        </>
    )
}