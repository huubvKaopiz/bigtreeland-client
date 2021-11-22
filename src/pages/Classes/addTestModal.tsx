import { Button, Modal, Form, DatePicker, Input, Upload } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { RootState, useAppDispatch } from 'store/store';
import moment from 'moment';
import { actionUploadFile } from 'store/files/slice';
import { useSelector } from 'react-redux';
import { ClassType } from 'interface';
import { get } from 'lodash';
import { actionAddTest, actionResetAddTestStatus } from 'store/classes/slice';


export default function AddTest(props: { classInfo: ClassType | null }): JSX.Element {
    const { classInfo } = props;
    const dispatch = useAppDispatch();
    const [show, setShow] = useState(false)
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<FileList | File>();

    const uploadStatus = useSelector((state: RootState) => state.filesReducer.statusUploadFile)
    const addTestStatus = useSelector((state: RootState) => state.classReducer.addTestStatus)

    useEffect(() => {
        if (uploadStatus === "success") {
            setUploading(false)
        }
    }, [uploadStatus])

    useEffect(() => {
        if (addTestStatus === "success") {
            setShow(false)
            dispatch(actionResetAddTestStatus())
        }
    }, [addTestStatus, dispatch])

    function handleUpload() {
        if (file) {
            setUploading(true)
            console.log(file)
            dispatch(actionUploadFile(file))
        }
    }

    function handleSubmit(values: any) {
        const data = {
            class_id: get(classInfo, "id", 0),
            title: values.title,
            date: values.date,
            content_file: 1
        }
        dispatch(actionAddTest(data))
    }

    return (
        <>
            <Button icon={<PlusOutlined />} type="primary" onClick={() => setShow(true)}>Tạo bài test</Button>
            <Modal
                visible={show}
                closable
                onCancel={() => setShow(false)}
                title="Tạo bài test mới"
                width={800}
                footer={[
                    <Button key="btncancle" onClick={() => setShow(false)}>Huỷ bỏ</Button>,
                    <Button key="btnok" type="primary" htmlType="submit" form="aForm">Lưu lại</Button>
                ]}
            >
                <Form
                    id="aForm"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    onFinish={handleSubmit}
                >
                    <Form.Item label="Tiêu đề" name="title" required>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Ngày" name="date">
                        <DatePicker format="YYYY-MM-DD" defaultValue={moment(new Date)} />
                    </Form.Item>
                    <Form.Item label="Đề bài">
                        <Upload maxCount={1} onChange={(e: any) => setFile(e.fileList)} >
                            {
                                file == null ?
                                    <Button icon={<UploadOutlined />}>Chọn file đề thi</Button>
                                    : ""
                            }
                        </Upload>
                        {
                            file && <Button loading={uploading} onClick={handleUpload} style={{ marginTop: 10 }} type="primary" size="small" ghost icon={<UploadOutlined />}>Tải lên</Button>
                        }
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}