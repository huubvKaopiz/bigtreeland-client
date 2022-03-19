// import { CKEditor } from 'ckeditor4-react';
import { Editor } from '@tinymce/tinymce-react';
import { Button, Input, Modal, notification } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Text from 'antd/lib/typography/Text';
import FileSelectModal from 'components/FileSelectModal';
import { FileType, NewsType } from 'interface';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { actionAddNews, actionGetNewsList, actionUpdateNews } from 'store/news/slice';
import { RootState, useAppDispatch } from 'store/store';

export function AddNewsModal(props: {
    editting: boolean,
    setEditting: (param: boolean) => void,
    show: boolean,
    setShow: (param: boolean) => void,
    newsInfo: NewsType | null
}): JSX.Element {

    const { editting, setEditting, newsInfo, show, setShow } = props;
    const dispatch = useAppDispatch();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [fileSelected, setFileSelected] = useState<Array<FileType>>([]);
    const [showSelect, setShowSelect] = useState(false);
    const editorRef = useRef(null);

    const submitting = useSelector((state: RootState) => state.newsReducer.addNewsStatus)
    const updateting = useSelector((state: RootState) => state.newsReducer.updateNewsStatus)

    useEffect(() => {
        if (editting === true && newsInfo) {
            setTitle(newsInfo.title);
            setContent(newsInfo.content);
            newsInfo.photo ? setFileSelected([newsInfo.photo]) : setFileSelected([])
        } else {
            setTitle("");
            setContent("");
        }
    }, [editting, newsInfo]);

    useEffect(() => {
        if (submitting === 'success' || updateting === 'success') {
            dispatch(actionGetNewsList({ per_page: 20 }));
            setShow(false);
        }
    }, [updateting, submitting])

    function handleFileSelected(filesSelected: Array<FileType>) {
        setFileSelected(filesSelected);
    }

    function handleSubmit() {
        if (title.length === 0) {
            notification.error({ message: "Tiêu đề không  được để trống!" })
            return;
        }
        const payload = {
            title,
            photo: fileSelected.length > 0 && fileSelected[0].id,
            content
        }
        if (editting) {
            if (newsInfo) {
                console.log(payload)
                dispatch(actionUpdateNews({ newId: newsInfo.id, data: payload }));
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
                <div style={{ marginBottom: 20 }}>
                    <Text style={{ marginBottom: 10 }}>Tiêu đề</Text>
                    <Input  placeholder="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div style={{marginBottom:20}}>
                    <Text style={{ marginRight:15 }}>Ảnh cover</Text>
                    <FileSelectModal
                        defaultSelected={fileSelected}
                        isShow={showSelect}
                        okFunction={handleFileSelected}
                        closeFunction={() => setShowSelect(false)}
                        showSelectedList
                        review={true}
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
                </div>
                <div>
                    <Text style={{ marginBottom: 10 }}>Nội dung</Text>
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
                </div>

            </Modal>
        </>
    )
}