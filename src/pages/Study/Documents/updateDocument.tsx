import React, { useEffect, useState } from "react";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";
import { useSelector } from "react-redux";
import moment from "moment";

import FileSelectModal from "components/FileSelectModal";
import { DocumentType, FileType } from "interface";
import { actionGetDocuments, actionUpdateDocument } from "store/documents/slice";
import { RootState, useAppDispatch } from "store/store";

export default function UpdateDocument(props: {
    documentInfo: DocumentType | null,
    show: boolean,
    setShow: (param: boolean) => void
}): JSX.Element {
    const { documentInfo, show, setShow } = props;
    const dispatch = useAppDispatch();
    const [editForm] = Form.useForm();
    const [submiting, setSubmiting] = useState(false);
    const [showSelect, setShowSelect] = useState(false);
    const [fileSelected, setFileSelected] = useState<Array<FileType>>([]);

    const updateDocumentState = useSelector((state: RootState) => state.documentReducer.updateDocumentStatus);

    useEffect(() => {
        if (documentInfo) {
            setFileSelected(documentInfo.files);
            editForm.setFieldsValue({
                'title': documentInfo.title,
                'link': documentInfo.link,
            })
        }
    }, [documentInfo])

    useEffect(() => {
        if (updateDocumentState === 'success') {
            setSubmiting(false);
            setShow(false);
            if (documentInfo) dispatch(actionGetDocuments({ class_id: documentInfo.class_id }));
        } else if (updateDocumentState === 'error') {
            setSubmiting(false);
        }
    }, [updateDocumentState])

    function handleFileSelected(filesSelected: Array<FileType>) {
        setFileSelected(filesSelected);
    }

    function handleSubmit(values: any) {
        console.log('submit')
        if (documentInfo) {
            setSubmiting(true);
            const listIdFile = fileSelected.map(file => file.id) as number[]
            const payload = {
                id: documentInfo.id,
                class_id: documentInfo.class_id,
                title: values.title,
                files: listIdFile,
                link: values.link,
            };
            dispatch(actionUpdateDocument(payload))
        }
    }

    return (
        <>
            <Modal
                visible={show}
                closable
                onCancel={() => setShow(false)}
                title="C???p nh???t t??i li???u"
                width={800}
                footer={[
                    <Button key="btncancle" onClick={() => setShow(false)}>
                        Hu??? b???
                    </Button>,
                    <Button
                        loading={submiting}
                        key="btnok"
                        type="primary"
                        htmlType="submit"
                        form="editForm"
                    >
                        L??u l???i
                    </Button>,
                ]}
            >
                <Form
                    form={editForm}
                    id="editForm"
                    initialValues={{ date: moment() }}
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Ti??u ?????"
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: "Ti??u ????? kh??ng ???????c b??? tr???ng",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label="Link t??i li???u" name="link">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Ch???n files">
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
                                Ch???n files
                            </Button>
                        </FileSelectModal>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
