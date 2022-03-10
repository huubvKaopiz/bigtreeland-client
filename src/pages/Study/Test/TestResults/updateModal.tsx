import {
    Button,
    Input,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "antd/lib/modal/Modal";
import { RootState } from "store/store";
import {
    actionAddTestResult,
    actionUpdateTestResult,
    resetUpdateTestResultsStatus,
} from "store/test-results/slice";
import { TestResultDataType } from ".";
import FileSelectModal from "components/FileSelectModal";
import { FileType } from "interface";


const { TextArea } = Input;
export default function UpdateModal(props: {
    testResultInfo: TestResultDataType | null;
    test_id: number | null;
    show: boolean;
    setShow: (param: boolean) => void;
}): JSX.Element {
    const { testResultInfo, show, setShow, test_id } = props;
    const dispatch = useDispatch();
    const [comment, setComment] = useState("");
    const [point, setPoint] = useState("");
    const [fileSelected, setFileSelected] = useState<FileType[]>([]);
    const [showSelect, setShowSelect] = useState(false);

    // application state
    const updateTestResultState = useSelector(
        (state: RootState) => state.testResultsReducer.updateTestResultStatus
    );
    const addTestResultState = useSelector(
        (state: RootState) => state.testResultsReducer.addTestResultStatus
    );

    useEffect(()=>{
        if(testResultInfo?.test_result){
            setComment(testResultInfo.test_result.teacher_comment)
            setPoint(testResultInfo.test_result.point)
            setFileSelected(testResultInfo.test_result.correct_files)
        }
    },[testResultInfo])
   

    function handleSubmit() {
        if (testResultInfo) {
            if (testResultInfo.test_result) {
                const data = {
                    id: testResultInfo.test_result.id,
                    teacher_comment: comment,
                    point,
                    correct_files: fileSelected.map((file) => file.id),
                };
                dispatch(actionUpdateTestResult(data));
            } else if (test_id) {
                const data = {
                    test_id,
                    student_id: testResultInfo.student.id,
                    teacher_comment: comment,
                    point,
                    correct_files: fileSelected.map((file) => file.id),
                }
                dispatch(actionAddTestResult(data))
            }
        }
    }

    return (
        <>
            <Modal
                title="Chấm điểm và nhận xét"
                width={800}
                visible={show}
                closable
                onCancel={() => setShow(false)}
                onOk={handleSubmit}
                okText="Lưu lại"
                cancelText="Huỷ bỏ"
                confirmLoading={updateTestResultState === "loading" || addTestResultState === 'loading'}
            >
                <div style={{ padding: 20 }}>
                    <p style={{ marginBottom: 10, marginTop: 10 }}>Chấm điểm</p>
                    <Input
                        placeholder="0.0"
                        onChange={({ target: { value } }) => setPoint(value)}
                        value={point}
                    />
                    <p style={{ marginBottom: 10, marginTop: 10 }}>Nhận xét</p>
                    <TextArea
                        placeholder="Viết nhận xét bài làm của học sinh..."
                        onChange={({ target: { value } }) => setComment(value)}
                        value={comment}
                        style={{ height: 100 }}
                    />
                    <p style={{ marginBottom: 10, marginTop: 10 }}>Link bài chữa</p>
                    <Input placeholder="Dán đường dẫn bài chữa nếu có..." />
                    <p style={{ marginTop: 20 }}>Ảnh bài chữa</p>
                    <FileSelectModal
                        defaultSelected={fileSelected}
                        isShow={showSelect}
                        okFunction={setFileSelected}
                        closeFunction={() => setShowSelect(false)}
                        showSelectedList
                        review={true}
                    >
                        <Button
                            onClick={() => setShowSelect(true)}
                            type="default"
                            size="middle"
                            style={{backgroundColor:"#FFF", color:"#f39c12", borderColor:"#f39c12"}}
                            icon={<UploadOutlined />}
                        >
                            Chọn files
                        </Button>
                    </FileSelectModal>
                </div>
            </Modal>
        </>
    );
}
