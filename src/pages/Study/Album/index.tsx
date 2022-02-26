import {
    InboxOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import {
    Button,
    Form,
    Image,
    Modal,
    Space,
    Spin,
} from "antd";
import Dragger from "antd/lib/upload/Dragger";
import { UploadFile } from "antd/lib/upload/interface";
import { ClassPhotoType, FileType, StudentType, TestType } from "interface";
import { get } from "lodash";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { actionAddClassPhotos, actionGetClassPhotos } from "store/classes/slice";
import { actionUploadFile } from "store/files/slice";
import { RootState, useAppDispatch } from "store/store";
import { defaul_image_base64, imageExtensionsList, NOTIFI_URIS, STUDY_TABS } from "utils/const";
import { dummyRequest } from "utils/ultil";

export function ClassPhotos(props: { class_id: string }): JSX.Element {
    const { class_id } = props;
    const dispatch = useAppDispatch();
    const [show, setShow] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);

    const photos = useSelector((state: RootState) => state.classReducer.photos)
    const activeTab = useSelector((state: RootState) => state.classReducer.classDetailTabKey);

    useEffect(() => {
        if (class_id && activeTab === STUDY_TABS.ALBUM)
            dispatch(actionGetClassPhotos({ class_id: +class_id }))
    }, [class_id, activeTab])

    useEffect(() => {
        if (show) setFileList([]);
    }, [show]);

    function handleUploadFile() {
        if (fileList.length > 0) {
            setIsLoading(true);
            const listFileUpload = fileList.map((file) => {
                return file.originFileObj as File;
            });
            //Todo dispatch action to upload file then reset
            const fileIdUploaded: number[] = [];
            dispatch(actionUploadFile(listFileUpload))
                .then((data) => {
                    (get(data, "payload", []) as FileType[]).forEach((file) => {
                        fileIdUploaded.push(file.id);
                    });
                    return fileIdUploaded;
                })
                .then((fileIdList) => {
                    dispatch(actionAddClassPhotos({ class_id: +class_id, file_ids: fileIdList }))
                        .then(() => {
                            dispatch(actionGetClassPhotos({ class_id: +class_id }))
                        })
                        .finally(() => {
                            setIsLoading(false);
                            setShow(false);
                        });
                });
        }
    }

    return (
        <>
            <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => {
                    setShow(true);
                }}
            >
                Tải ảnh mới
            </Button>
            <Modal
                title="Chọn ảnh để upload"
                centered
                visible={show}
                onCancel={() => {
                    setShow(false);
                }}
                footer={null}
                width={950}
                maskClosable={false}
            >
                <Spin spinning={isLoading}>
                    <Form onFinish={handleUploadFile} form={form}>
                        <Form.Item>
                            <Dragger
                                accept={imageExtensionsList.map((ext) => `.${ext}`).join(",")}
                                name="file"
                                multiple={true}
                                customRequest={dummyRequest}
                                onDrop={(e) => {
                                    // console.log(e.dataTransfer.files);
                                }}
                                listType="picture-card"
                                fileList={fileList}
                                onChange={({ fileList }) => {
                                    setFileList(fileList);
                                }}
                            // className="upload-list-inline"
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">
                                    Nhấn hoặc kéo thả file vào khu vực để upload!
                                </p>
                            </Dragger>
                        </Form.Item>
                        <Form.Item style={{ textAlign: "center" }}>
                            <Button type="primary" htmlType="submit">
                                Upload
                            </Button>
                            <Button
                                style={{ marginLeft: 30 }}
                                onClick={() => {
                                    setShow(false);
                                }}
                            >
                                Cancel
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
            <Space
                style={{ backgroundColor: "white", padding: 10 }}
                size={[10, 10]}
                wrap
            >
                {get(photos, "data", []).map(
                    (photo: ClassPhotoType, index: number) => (
                        <Image
                            key={index}
                            width={240}
                            height={240}
                            style={{ objectFit: "cover" }}
                            alt="logo"
                            src={get(
                                photo,
                                "file.url",
                                "error"
                            )}
                            fallback={defaul_image_base64}
                        />
                    )
                )}
            </Space>
        </>
    );
}
