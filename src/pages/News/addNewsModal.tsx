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
    // const editorRef = useRef(null);

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
            notification.error({ message: "Ti??u ????? kh??ng ???????c ????? tr???ng!" })
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
                title={editting ? "S???a tin b??i" : "T???o tin b??i m???i"}
                footer={[
                    <Button key="btn-cancel" onClick={() => {
                        setShow(false);
                        setEditting(false);
                    }}>Hu??? b???</Button>,
                    <Button
                        key="btn-submit"
                        type="primary"
                        onClick={() => handleSubmit()}
                        loading={submitting === "loading" ? true : false}>
                        {editting ? "C???p nh???t" : "L??u l???i"}
                    </Button>

                ]}
            >
                <div style={{ marginBottom: 20 }}>
                    <Text style={{ marginBottom: 15, fontWeight:'bold' }}>Ti??u ?????</Text>
                    <Input  placeholder="Ti??u ?????" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div style={{marginBottom:20}}>
                    <Text style={{ marginRight:15, fontWeight:'bold' }}>???nh cover</Text>
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
                            Ch???n files
                        </Button>
                    </FileSelectModal>
                </div>
                <div>
                    <Text style={{ marginBottom: 15, fontWeight:'bold' }}>N???i dung</Text>
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
                                'link |' +
                                'removeformat | help',
                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                        }}
                    />
                </div>

            </Modal>
        </>
    )
}