import React, { useEffect, useState } from 'react';
import { Space, DatePicker, Modal, List, Button } from 'antd';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { ClassType, DocumentType } from 'interface';
import { get } from 'lodash';
import { useSelector } from 'react-redux';
import { actionDeleteDocument, actionGetDocuments } from 'store/documents/slice';
import { RootState, useAppDispatch } from 'store/store';
import AddDocument from './addDocument';
import { formatFileSize, isImageType } from 'utils/ultil';
import { fileIconList } from 'utils/const';
import moment from 'moment';
import UpdateDocument from './updateDocument';
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const imageStyle = {
    width: "100%",
    height: "40px",
    objectFit: "contain",
};

export default function (props: {
    classInfo: ClassType | null
}): JSX.Element {
    const { classInfo } = props;
    const dispatch = useAppDispatch();
    const [editIndex, setEditIndex] = useState(-1)
    const [showEdit, setShowEdit] = useState(false)

    const documentsData = useSelector((state: RootState) => state.documentReducer.documents);
    const deleteDocumentState = useSelector((state: RootState) => state.documentReducer.deleteDocumentStatus);


    useEffect(() => {
        if (classInfo) {
            dispatch(actionGetDocuments({ class_id: classInfo.id }));
        }
    }, [classInfo])

    useEffect(() => {
        if (deleteDocumentState === 'success') {
            if (classInfo) dispatch(actionGetDocuments({ class_id: classInfo.id }));
        }
    }, [deleteDocumentState])

    const handleChangeDateRange = (_: any, dateString: string[]) => {
        const from_date = dateString[0] || void 0;
        const to_date = dateString[1] || void 0;
        if (classInfo) {
            dispatch(
                actionGetDocuments({ class_id: classInfo.id, from_date, to_date })
            );
        }
    }

    const handleEdit = (index: number) => {
        setEditIndex(index);
        setShowEdit(true)
    }

    const handleDelete = (id: number) => {
        confirm({
            title: "Xác nhận xoá tài liệu này!",
            icon: <ExclamationCircleOutlined />,
            okText: "Xoá",
            cancelText: "Huỷ bỏ",
            okButtonProps: {
                loading: deleteDocumentState === 'loading'
            },
            onOk: () => {
                dispatch(actionDeleteDocument(id));
            }
        })
    }

    return (
        <>
            <Space>
                <RangePicker
                    style={{ marginTop: 20, marginBottom: 20 }}
                    onChange={handleChangeDateRange}
                />
                <AddDocument class_id={classInfo?.id || 0} />
            </Space>

            {
                get(documentsData, "data", []).map((document: DocumentType, index: number) => {
                    return (
                        <div key={document.id} style={{marginBottom:15, borderBottom:"solid 1px #f5f6fa"}}>
                            <h2>{document.title}</h2>
                            <label style={{ color: "#7f8c8d" }}>{document.created_at}</label>
                            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(document.id)} />
                            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(index)} />
                            {
                                document.files.length > 0 &&
                                <List
                                    style={{ backgroundColor: 'rgba(230, 126, 34,0.1)', padding: 10, marginTop: 15 }}
                                    itemLayout="horizontal"
                                    rowKey={(file) => file.id}
                                    dataSource={document.files}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={
                                                    (isImageType(item.type || "") && (
                                                        <img className="img-center" src={item.url} style={imageStyle as React.CSSProperties} />
                                                    )) || (
                                                        <img
                                                            className="img-center"
                                                            src={
                                                                fileIconList[
                                                                Object.keys(fileIconList).find((k) => k === item.type) as keyof typeof fileIconList
                                                                ]
                                                            }
                                                            style={imageStyle as React.CSSProperties}
                                                        />
                                                    )
                                                }
                                                title={<a rel="noopener" href={item.url}>{item.name}</a>}
                                                description={formatFileSize(item.size)}
                                            />
                                        </List.Item>
                                    )}
                                />
                            }

                        </div>
                    )
                })
            }
            <UpdateDocument
                documentInfo={editIndex !== -1 && get(documentsData, "data", [])[editIndex] || null}
                show={showEdit}
                setShow={setShowEdit}
            />
        </>
    )
}
