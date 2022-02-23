import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Modal, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
// import { CKEditor } from 'ckeditor4-react';
import { Editor } from '@tinymce/tinymce-react';
import { RootState, useAppDispatch } from 'store/store';
import { actionAddNews, actionGetNewsList, actionUpdateNews } from 'store/news/slice';
import { useSelector } from 'react-redux';
import { NewsType } from 'interface';
import Text from 'antd/lib/typography/Text';

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
    const editorRef = useRef(null);
    
    const submitting = useSelector((state: RootState) => state.newsReducer.addNewsStatus)
    const updateting = useSelector((state: RootState) => state.newsReducer.updateNewsStatus)

    useEffect(() => {
        if (editting === true && newInfo) {
            setTitle(newInfo.title);
            setContent(newInfo.content)
        } else {
            setTitle("");
            setContent("");
        }
    }, [editting, newInfo]);

    useEffect(()=>{
        if(submitting === 'success' || updateting === 'success'){
            dispatch(actionGetNewsList({ per_page: 20 }));
            setShow(false);
        }
    },[updateting, submitting])

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
                console.log(payload)
                dispatch(actionUpdateNews({ newId: newInfo.id, data: payload }));
            }
        } else {
            dispatch(actionAddNews(payload));
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
                        loading={submitting === "loading" ? true : false}>
                        {editting ? "Cập nhật" : "Lưu lại"}
                    </Button>

                ]}
            >
                <Text style={{marginBottom:10}}>Tiêu đề</Text>
                <Input style={{ marginBottom: 20 }} placeholder="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <Text  style={{marginBottom:10}}>Nội dung</Text>
                <Editor
                    // onInit={(evt, editor) => editorRef.current = editor}
                    initialValue={content}
                    onChange={(e) => setContent(e.target.getContent())}
                    init={{
                        height: 500,
                        menubar: false,
                        plugins: [
                            'advlist autolink lists link image charmap print preview anchor',
                            'searchreplace visualblocks code fullscreen',
                            'insertdatetime media table paste code help wordcount'
                        ],
                        toolbar: 'undo redo | formatselect | ' +
                            'bold italic backcolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'removeformat | help',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                />
            </Modal>
        </>
    )
}