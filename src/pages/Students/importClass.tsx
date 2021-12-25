import { ImportOutlined } from '@ant-design/icons';
import { Button, Select, Space, Spin, Tooltip } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { ClassType, GetResponseType, StudentType } from 'interface';
import { get } from 'lodash';
import React, { useState } from 'react';
import { useAppDispatch } from 'store/store';

export default function ImportClass(props: { student: StudentType, classesList: GetResponseType<ClassType> | null, searchClass: (search: string) => void, searchStatus: string }): JSX.Element {
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