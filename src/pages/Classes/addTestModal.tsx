import { Button, Modal, Form, DatePicker, Input, Upload } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { RootState, useAppDispatch } from "store/store";
import moment from "moment";
import { actionUploadFileTest, resetRecentFileTestUploaded } from "store/files/slice";
import { useSelector } from "react-redux";
import { ClassType } from "interface";
import { get } from "lodash";
import { UploadFile } from "antd/lib/upload/interface";
import { actionAddTest, actionGetTestes } from "store/testes/slice";

export default function AddTest(props: { classInfo: ClassType | null }): JSX.Element {
    const { classInfo } = props;
    const dispatch = useAppDispatch();
    const [show, setShow] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<UploadFile[]>([]);

    const uploadStatus = useSelector((state: RootState) => state.filesReducer.statusUploadFile);
    const addTestStatus = useSelector((state: RootState) => state.testReducer.addTestStatus);
    const recentFileUploaded = useSelector((state: RootState) => state.filesReducer.recentFileTestUploaded);


    useEffect(() => {
        if (uploadStatus === "success" && recentFileUploaded) {
            setUploading(false);
            setFile([])
        }
    }, [uploadStatus, recentFileUploaded]);

    useEffect(() => {
        if (addTestStatus === "success") {
            setShow(false);
            dispatch(resetRecentFileTestUploaded())
            dispatch(actionGetTestes({ class_id: get(classInfo, "id", 0) }))
        }
    }, [addTestStatus, dispatch, classInfo]);

    function handleUpload() {
        if (file) {
            setUploading(true);

            if (file.length > 0) {
                const listFileUpload = file.map((_file) => {
                    return _file.originFileObj as File;
                });
                dispatch(actionUploadFileTest(listFileUpload));
            }
        }
    }

    function handleRemoveFile() {
        dispatch(resetRecentFileTestUploaded())
        setUploading(false)
    }

    function handleSubmit(values: any) {
        console.log(recentFileUploaded);
        const data = {
            class_id: get(classInfo, "id", 0),
            title: values.title,
            date: moment(values.date).format("YYYY-MM-DD"),
            content_file: get(recentFileUploaded, "id", 0),
        };
        dispatch(actionAddTest(data));
    }

    return (
        <>
            <Button icon={<PlusOutlined />} type="primary" onClick={() => setShow(true)}>
                Tạo bài test
            </Button>
            <Modal
                visible={show}
                closable
                onCancel={() => setShow(false)}
                title="Tạo bài test mới"
                width={800}
                footer={[
                    <Button key="btncancle" onClick={() => setShow(false)}>
                        Huỷ bỏ
                    </Button>,
                    <Button key="btnok" type="primary" htmlType="submit" form="aForm">
                        Lưu lại
                    </Button>,
                ]}
            >
                <Form
                    id="aForm"
                    initialValues={{ date: moment(new Date()) }}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    onFinish={handleSubmit}
                >
                    <Form.Item label="Tiêu đề" name="title" required>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Ngày" name="date">
                        <DatePicker format="YYYY-MM-DD" defaultValue={moment(new Date())} />
                    </Form.Item>
                    <Form.Item label="Đề bài">
                        <Upload maxCount={1} onChange={(e: any) => setFile(e.fileList)} onRemove={handleRemoveFile}>
                            {file.length == 0 ? <Button icon={<UploadOutlined />}>Chọn file đề thi</Button> : ""}
                        </Upload>
                        {file && (
                            <Button
                                loading={uploading}
                                onClick={handleUpload}
                                style={{ marginTop: 10 }}
                                type="primary"
                                size="small"
                                ghost
                                icon={<UploadOutlined />}
                            >
                                Tải lên
                            </Button>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
