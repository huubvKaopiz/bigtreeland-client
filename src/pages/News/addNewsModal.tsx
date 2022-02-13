import { Button, Input, Modal, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import React, { useEffect, useState } from 'react';
import { RootState, useAppDispatch } from 'store/store';
import { actionUploadFile } from 'store/files/slice';
import { actionAddNews, actionGetNewsList, actionUpdateNews } from 'store/news/slice';
import { useSelector } from 'react-redux';
import { NewsType } from 'interface';


export function AddNewsModal(props: {
    editting: boolean,
    setEditting: (param: boolean) => void,
    show: boolean,
    setShow: (param: boolean) => void,
    newInfo: NewsType | null
}): JSX.Element {
    const { editting, setEditting, newInfo, show, setShow } = props;
    const dispatch = useAppDispatch();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const submitting = useSelector((state: RootState) => state.newsReducer.addNewsStatus)
    const updateting = useSelector((state: RootState) => state.newsReducer.updateNewsStatus)


    useEffect(() => {
        if (editting && newInfo) {
            setTitle(newInfo.title);
            setContent(newInfo.content)
        } else {
            setTitle("");
            setContent("");
        }
    }, [editting, newInfo]);

    function handleSubmit() {
        if (title.length === 0) {
            notification.error({ message: "Tiêu đề không  được để trống!" })
            return;
        }
        const payload = {
            title,
            content
        }
        if (editting) {
            if (newInfo) {
                dispatch(actionUpdateNews({ newId: newInfo.id, data: payload })).finally(() => {
                    if (updateting === "success") {
                        dispatch(actionGetNewsList({ per_page: 20 }))
                    }
                    setShow(false);
                })
            }
        } else {
            dispatch(actionAddNews(payload)).finally(() => {
                if (submitting === "success") {
                    dispatch(actionGetNewsList({ per_page: 20 }))
                }
                setShow(false);
            })
        }
    }

    return (
        <>

            <Modal
                visible={show}
                onCancel={() => {
                    setShow(false);
                    setEditting(false);
                }}
                width={1000}
                title={editting ? "Sửa tin bài" : "Tạo tin bài mới"}
                footer={[
                    <Button key="btn-cancel" onClick={() => {
                        setShow(false);
                        setEditting(false);
                    }}>Huỷ bỏ</Button>,
                    <Button 
                        key="btn-submit" 
                        type="primary" 
                        onClick={() => handleSubmit()} 
                        loading={submitting === "loading" ? true : false }>
                            {editting ? "Cập nhật" : "Lưu lại"}
                    </Button>

                ]}
            >
                <Input style={{ marginBottom: 20 }} placeholder="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <CKEditor
                    editor={ClassicEditor}
                    data={content}
                    onChange={(event: any, editor: CKEditor) => {
                        const data = editor.getData();
                        setContent(data);
                    }}

                />
            </Modal>
        </>
    )
}