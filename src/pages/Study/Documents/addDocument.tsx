import React, { useEffect, useState } from "react";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";
import { useSelector } from "react-redux";
import moment from "moment";

import FileSelectModal from "components/FileSelectModal";
import { FileType } from "interface";
import { actionAddDocument, actionGetDocuments } from "store/documents/slice";
import { RootState, useAppDispatch } from "store/store";

export default function AddDocument(props: { class_id: number | null }): JSX.Element {
    const { class_id } = props;
    const dispatch = useAppDispatch();
    const [show, setShow] = useState(false);
    const [submiting, setSubmiting] = useState(false);
    const [showSelect, setShowSelect] = useState(false);
    const [fileSelected, setFileSelected] = useState<Array<FileType>>([]);

    const addDocumentState = useSelector((state: RootState) => state.documentReducer.addDocumentStatus);

    useEffect(() => {
        if (addDocumentState === 'success') {
            setSubmiting(false);
            setShow(false);
            if (class_id) dispatch(actionGetDocuments({ class_id }));
        } else if (addDocumentState === 'error') {
            setSubmiting(false);
        }
    }, [addDocumentState])

    function handleFileSelected(filesSelected: Array<FileType>) {
        setFileSelected(filesSelected);
    }

    function handleSubmit(values: any) {
        if (class_id && class_id > 0) {
            setSubmiting(true);
            const listIdFile = fileSelected.map(file => file.id) as number[]
            const payload = {
                class_id,
                title: values.title,
                files: listIdFile,
                link: values.link,
            };
            dispatch(actionAddDocument(payload))
        }
    }

    return (
        <>
            <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => setShow(true)}
            >
                Thêm tài liệu
            </Button>
            <Modal
                visible={show}
                closable
                onCancel={() => setShow(false)}
                title="Thêm tài liệu mới"
                width={800}
                footer={[
                    <Button key="btncancle" onClick={() => setShow(false)}>
                        Huỷ bỏ
                    </Button>,
                    <Button
                        loading={submiting}
                        key="btnok"
                        type="primary"
                        htmlType="submit"
                        form="aForm"
                    >
                        Lưu lại
                    </Button>,
                ]}
            >
                <Form
                    id="aForm"
                    initialValues={{ date: moment() }}
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Tiêu đề"
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: "Tiêu đề không được bỏ trống",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label="Link tài liệu" name="link">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Chọn files">
                        <FileSelectModal
                            defaultSelected={fileSelected}
                            isShow={showSelect}
                            okFunction={handleFileSelected}
                            closeFunction={() => setShowSelect(false)}
                            review={true}
                            showSelectedList
                        >
                            <Button
                                onClick={() => setShowSelect(true)}
                                type="primary"
                                ghost
                                size="middle"
                                icon={<UploadOutlined />}
                            >
                                Chọn files
                            </Button>
                        </FileSelectModal>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
